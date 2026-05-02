import type { HttpTypes } from "@medusajs/types"

import { fetchAllStoreProducts, getAggregatedProductPrice, getProductCurrencyCode, isProductInStock } from "#server/utils/products"
import { toUpstreamError } from "#server/utils/medusa-proxy"

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

function compareProducts(leftProduct: ProductWithRelations, rightProduct: ProductWithRelations, order: string) {
    const isDescending = order.startsWith("-")
    const normalizedOrder = order.replace(/^-/, "")

    if (normalizedOrder.includes("variants.calculated_price")) {
        const leftPrice = getAggregatedProductPrice(leftProduct, isDescending ? "max" : "min")
        const rightPrice = getAggregatedProductPrice(rightProduct, isDescending ? "max" : "min")
        const leftValue = leftPrice ?? (isDescending ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY)
        const rightValue = rightPrice ?? (isDescending ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY)

        return isDescending ? rightValue - leftValue : leftValue - rightValue
    }

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

function buildFacets(products: ProductWithRelations[]) {
    const categoryFacetMap = new Map<string, FacetItem>()
    const collectionFacetMap = new Map<string, FacetItem>()
    const typeFacetMap = new Map<string, FacetItem>()
    const tagFacetMap = new Map<string, FacetItem>()

    let minimumPrice = Number.POSITIVE_INFINITY
    let maximumPrice = 0
    let currencyCode: string | null = null

    for (const product of products) {
        const seenCategoryIds = new Set<string>()
        const seenTagIds = new Set<string>()
        const productMinimumPrice = getAggregatedProductPrice(product, "min")
        const productMaximumPrice = getAggregatedProductPrice(product, "max")

        if (productMinimumPrice !== null) {
            minimumPrice = Math.min(minimumPrice, productMinimumPrice)
        }

        if (productMaximumPrice !== null) {
            maximumPrice = Math.max(maximumPrice, productMaximumPrice)
        }

        if (!currencyCode) {
            currencyCode = getProductCurrencyCode(product)
        }

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
        tags: [...tagFacetMap.values()].sort((left, right) => left.label.localeCompare(right.label)),
        price: {
            min: Number.isFinite(minimumPrice) ? minimumPrice : 0,
            max: maximumPrice,
            currencyCode
        }
    }
}

function filterProducts(
    products: ProductWithRelations[],
    filters: {
        selectedChildCategoryIds: string[]
        selectedCollectionIds: string[]
        selectedTypeIds: string[]
        selectedTagIds: string[]
        inStockOnly: boolean
        minPrice: number | null
        maxPrice: number | null
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

        if (filters.inStockOnly && !isProductInStock(product)) {
            return false
        }

        const minimumProductPrice = getAggregatedProductPrice(product, "min")
        if ((filters.minPrice !== null || filters.maxPrice !== null) && minimumProductPrice === null) {
            return false
        }

        if (filters.minPrice !== null && minimumProductPrice !== null && minimumProductPrice < filters.minPrice) {
            return false
        }

        return !(filters.maxPrice !== null && minimumProductPrice !== null && minimumProductPrice > filters.maxPrice)
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

    const limit = parsePositiveInteger(query.limit, 9)
    const offset = parsePositiveInteger(query.offset, 0)
    const order = query.order ? String(query.order) : "-created_at"

    const filters = {
        selectedChildCategoryIds: parseIds(query.child_category_ids),
        selectedCollectionIds: parseIds(query.collection_ids),
        selectedTypeIds: parseIds(query.type_ids),
        selectedTagIds: parseIds(query.tag_ids),
        inStockOnly: String(query.in_stock_only ?? "false") === "true",
        minPrice: parseNumber(query.min_price),
        maxPrice: parseNumber(query.max_price)
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
