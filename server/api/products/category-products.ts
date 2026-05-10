import type { HttpTypes } from "@medusajs/types"

import { fetchAllStoreProducts, fetchStoreProducts, isProductInStock } from "#server/utils/products"
import { toUpstreamError } from "#server/utils/medusa-proxy"

const DEFAULT_ORDER = "-created_at"
const MAX_LIMIT = 48
const ALLOWED_ORDERS = new Set(["-created_at", "created_at", "title", "-title"])

type ProductRelation = {
    id: string
    name?: string
    title?: string
    value?: string
}

type ProductWithRelations = Omit<HttpTypes.StoreProduct, "collection" | "type" | "tags" | "categories" | "variants"> & {
    collection?: ProductRelation | null
    type?: ProductRelation | null
    tags?: ProductRelation[]
    categories?: ProductRelation[]
    variants?: HttpTypes.StoreProductVariant[]
}

type FacetItem = {
    id: string
    label: string
    count: number
}

function parseIds(value: unknown) {
    if (Array.isArray(value)) {
        return value
            .flatMap((item) => String(item).split(","))
            .map((item) => item.trim())
            .filter(Boolean)
    }

    if (typeof value === "string") {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
    }

    return []
}

function parseNumber(value: unknown) {
    if (value == null || value === "") {
        return null
    }

    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : null
}

function parsePositiveInteger(value: unknown, fallbackValue: number) {
    const parsedValue = parseNumber(value)

    if (parsedValue === null || parsedValue < 0) {
        return fallbackValue
    }

    return Math.floor(parsedValue)
}

function addFacetCount(facetMap: Map<string, FacetItem>, relation: ProductRelation | null | undefined) {
    if (!relation?.id) {
        return
    }

    const label = relation.name || relation.title || relation.value
    if (!label) {
        return
    }

    const existingFacet = facetMap.get(relation.id)
    if (existingFacet) {
        existingFacet.count += 1
        return
    }

    facetMap.set(relation.id, {
        id: relation.id,
        label,
        count: 1
    })
}

function buildFacets(products: ProductWithRelations[]) {
    const categoryFacetMap = new Map<string, FacetItem>()
    const collectionFacetMap = new Map<string, FacetItem>()
    const typeFacetMap = new Map<string, FacetItem>()
    const tagFacetMap = new Map<string, FacetItem>()

    for (const product of products) {
        const seenCategoryIds = new Set<string>()
        const seenTagIds = new Set<string>()

        addFacetCount(collectionFacetMap, product.collection)
        addFacetCount(typeFacetMap, product.type)

        for (const category of product.categories ?? []) {
            if (seenCategoryIds.has(category.id)) {
                continue
            }

            seenCategoryIds.add(category.id)
            addFacetCount(categoryFacetMap, category)
        }

        for (const tag of product.tags ?? []) {
            if (seenTagIds.has(tag.id)) {
                continue
            }

            seenTagIds.add(tag.id)
            addFacetCount(tagFacetMap, tag)
        }
    }

    return {
        categories: [...categoryFacetMap.values()].sort((left, right) => left.label.localeCompare(right.label)),
        collections: [...collectionFacetMap.values()].sort((left, right) => left.label.localeCompare(right.label)),
        types: [...typeFacetMap.values()].sort((left, right) => left.label.localeCompare(right.label)),
        tags: [...tagFacetMap.values()].sort((left, right) => left.label.localeCompare(right.label))
    }
}

function compareProducts(leftProduct: ProductWithRelations, rightProduct: ProductWithRelations, order: string) {
    const isDescending = order.startsWith("-")
    const normalizedOrder = order.replace(/^-/, "")

    if (normalizedOrder === "title") {
        const leftTitle = String(leftProduct.title ?? "")
        const rightTitle = String(rightProduct.title ?? "")
        return isDescending ? rightTitle.localeCompare(leftTitle) : leftTitle.localeCompare(rightTitle)
    }

    if (normalizedOrder === "created_at") {
        const leftTime = new Date(String(leftProduct.created_at ?? 0)).getTime()
        const rightTime = new Date(String(rightProduct.created_at ?? 0)).getTime()
        return isDescending ? rightTime - leftTime : leftTime - rightTime
    }

    return 0
}

function hasClientSideFilters(filters: {
    selectedChildCategoryIds: string[]
    selectedCollectionIds: string[]
    selectedTypeIds: string[]
    selectedTagIds: string[]
    inStockOnly: boolean
}) {
    return Boolean(
        filters.selectedChildCategoryIds.length ||
            filters.selectedCollectionIds.length ||
            filters.selectedTypeIds.length ||
            filters.selectedTagIds.length ||
            filters.inStockOnly
    )
}

function filterProducts(
    products: ProductWithRelations[],
    filters: {
        selectedChildCategoryIds: string[]
        selectedCollectionIds: string[]
        selectedTypeIds: string[]
        selectedTagIds: string[]
        inStockOnly: boolean
    }
) {
    return products.filter((product) => {
        if (filters.selectedChildCategoryIds.length) {
            const categoryIds = new Set((product.categories ?? []).map((category) => category.id))
            if (!filters.selectedChildCategoryIds.some((categoryId) => categoryIds.has(categoryId))) {
                return false
            }
        }

        if (
            filters.selectedCollectionIds.length &&
            (!product.collection?.id || !filters.selectedCollectionIds.includes(product.collection.id))
        ) {
            return false
        }

        if (filters.selectedTypeIds.length && (!product.type?.id || !filters.selectedTypeIds.includes(product.type.id))) {
            return false
        }

        if (filters.selectedTagIds.length) {
            const tagIds = new Set((product.tags ?? []).map((tag) => tag.id))
            if (!filters.selectedTagIds.some((tagId) => tagIds.has(tagId))) {
                return false
            }
        }

        return !(filters.inStockOnly && !isProductInStock(product));
    })
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const regionId = query.region_id ? String(query.region_id) : null
    const countryCode = query.country_code ? String(query.country_code) : null
    const categoryId = query.category_id ? String(query.category_id) : null

    if (!regionId) {
        throw createError({ statusCode: 400, statusMessage: "region_id is required" })
    }

    const limit = Math.min(parsePositiveInteger(query.limit, 9), MAX_LIMIT)
    const offset = parsePositiveInteger(query.offset, 0)
    const requestedOrder = query.order ? String(query.order) : DEFAULT_ORDER
    const order = ALLOWED_ORDERS.has(requestedOrder) ? requestedOrder : DEFAULT_ORDER

    const filters = {
        selectedChildCategoryIds: parseIds(query.child_category_ids),
        selectedCollectionIds: parseIds(query.collection_ids),
        selectedTypeIds: parseIds(query.type_ids),
        selectedTagIds: parseIds(query.tag_ids),
        inStockOnly: String(query.in_stock_only ?? "false") === "true"
    }

    const searchParams = new URLSearchParams({
        fields: "+metadata,*collection,*type,*tags,*categories,*variants.calculated_price,+variants.inventory_quantity",
        region_id: regionId
    })

    if (categoryId) {
        searchParams.set("category_id", categoryId)
    }

    if (countryCode) {
        searchParams.set("country_code", countryCode)
    }

    try {
        const canUseUpstreamPagination = !hasClientSideFilters(filters)

        if (canUseUpstreamPagination) {
            const pageSearchParams = new URLSearchParams(searchParams)
            pageSearchParams.set("order", order)
            pageSearchParams.set("limit", String(limit))
            pageSearchParams.set("offset", String(offset))

            const pageResponse = await fetchStoreProducts<ProductWithRelations>(event, pageSearchParams, "/store/category-products")
            const products = Array.isArray(pageResponse.products) ? pageResponse.products : []
            const sortedProducts = [...products].sort((leftProduct, rightProduct) => compareProducts(leftProduct, rightProduct, order))

            setHeader(event, "Cache-Control", "no-store")

            return {
                products: sortedProducts,
                count: Number(pageResponse.count ?? products.length),
                facets: buildFacets(products)
            }
        }

        const { products } = await fetchAllStoreProducts<ProductWithRelations>(event, searchParams, {
            endpoint: "/store/category-products"
        })
        const filteredProducts = filterProducts(products, filters)
        const sortedProducts = [...filteredProducts].sort((leftProduct, rightProduct) => compareProducts(leftProduct, rightProduct, order))

        setHeader(event, "Cache-Control", "no-store")

        return {
            products: sortedProducts.slice(offset, offset + limit),
            count: filteredProducts.length,
            facets: buildFacets(products)
        }
    } catch (error: unknown) {
        setHeader(event, "Cache-Control", "no-store")
        throw toUpstreamError(error, "Failed to fetch category products")
    }
})
