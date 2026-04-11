import type { HttpTypes } from "@medusajs/types"

const PAGE_SIZE = 200
const MAX_FETCH = 3000

type ProductRelation = {
    id: string
    name?: string
    title?: string
    value?: string
    parent_category_id?: string | null
}

type ProductWithRelations = Omit<HttpTypes.StoreProduct, "collection" | "type" | "tags" | "categories" | "variants"> & {
    collection?: ProductRelation | null
    type?: ProductRelation | null
    tags?: ProductRelation[]
    categories?: ProductRelation[]
    variants?: HttpTypes.StoreProductVariant[]
}

type StoreProductsResponse = {
    products?: ProductWithRelations[]
    count?: number
}

type FacetItem = {
    id: string
    label: string
    count: number
}

type ErrorShape = {
    statusCode?: number
    statusMessage?: string
    code?: string
    name?: string
    cause?: {
        code?: string
    }
}

async function fetchWithTimeout(input: Parameters<typeof fetch>[0], init: Parameters<typeof fetch>[1] & { timeoutMs?: number } = {}) {
    const { timeoutMs = 8000, ...rest } = init
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
        return await fetch(input, { ...rest, signal: controller.signal })
    } finally {
        clearTimeout(timeout)
    }
}

function parseIds(value: unknown): string[] {
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

function getProductPrices(product: ProductWithRelations): number[] {
    return (product.variants ?? [])
        .map((variant) => variant.calculated_price?.calculated_amount)
        .filter((value): value is number => typeof value === "number")
}

function getProductPrice(product: ProductWithRelations, mode: "min" | "max" = "min"): number | null {
    const prices = getProductPrices(product)

    if (!prices.length) {
        return null
    }

    return mode === "max" ? Math.max(...prices) : Math.min(...prices)
}

function isInStock(product: ProductWithRelations): boolean {
    return (product.variants ?? []).some((variant) => Number(variant.inventory_quantity ?? 0) > 0)
}

function compareProducts(a: ProductWithRelations, b: ProductWithRelations, order: string): number {
    const isDesc = order.startsWith("-")
    const normalizedOrder = order.replace(/^-/, "")

    if (normalizedOrder.includes("variants.calculated_price")) {
        const aPrice = getProductPrice(a, isDesc ? "max" : "min")
        const bPrice = getProductPrice(b, isDesc ? "max" : "min")
        const safeA = aPrice ?? (isDesc ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY)
        const safeB = bPrice ?? (isDesc ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY)

        return isDesc ? safeB - safeA : safeA - safeB
    }

    if (normalizedOrder === "title") {
        const aTitle = String(a.title ?? "")
        const bTitle = String(b.title ?? "")
        return isDesc ? bTitle.localeCompare(aTitle) : aTitle.localeCompare(bTitle)
    }

    if (normalizedOrder === "created_at") {
        const aTime = new Date(String(a.created_at ?? 0)).getTime()
        const bTime = new Date(String(b.created_at ?? 0)).getTime()
        return isDesc ? bTime - aTime : aTime - bTime
    }

    return 0
}

function addFacetCount(map: Map<string, FacetItem>, relation: ProductRelation | null | undefined) {
    if (!relation?.id) {
        return
    }

    const label = relation.name || relation.title || relation.value
    if (!label) {
        return
    }

    const existing = map.get(relation.id)
    if (existing) {
        existing.count += 1
        return
    }

    map.set(relation.id, {
        id: relation.id,
        label,
        count: 1
    })
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)

    const regionId = query.region_id ? String(query.region_id) : null
    const countryCode = query.country_code ? String(query.country_code) : null
    const categoryId = query.category_id ? String(query.category_id) : null

    if (!regionId) {
        throw createError({ statusCode: 400, statusMessage: "region_id is required" })
    }

    const limit = query.limit ? Number(query.limit) : 9
    const offset = query.offset ? Number(query.offset) : 0
    const order = query.order ? String(query.order) : "-created_at"
    const selectedChildCategoryIds = parseIds(query.child_category_ids)
    const selectedCollectionIds = parseIds(query.collection_ids)
    const selectedTypeIds = parseIds(query.type_ids)
    const selectedTagIds = parseIds(query.tag_ids)
    const inStockOnly = String(query.in_stock_only ?? "false") === "true"
    const minPrice = query.min_price ? Number(query.min_price) : null
    const maxPrice = query.max_price ? Number(query.max_price) : null

    const params = new URLSearchParams({
        fields: "+metadata,*collection,*type,*tags,*categories,*variants.calculated_price,+variants.inventory_quantity",
        region_id: regionId
    })

    if (categoryId) {
        params.set("category_id", categoryId)
    }

    if (countryCode) {
        params.set("country_code", countryCode)
    }

    const baseUrl = `${config.public.MEDUSA_URL}/store/products?${params.toString()}`

    try {
        const allProducts: ProductWithRelations[] = []

        const firstResponse = await fetchWithTimeout(`${baseUrl}&limit=${PAGE_SIZE}&offset=0`, {
            method: "GET",
            headers: {
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                "Content-Type": "application/json"
            }
        })

        if (!firstResponse.ok) {
            throw createError({ statusCode: firstResponse.status, statusMessage: "Failed to fetch category products" })
        }

        const firstJson = (await firstResponse.json()) as StoreProductsResponse
        const firstProducts = Array.isArray(firstJson.products) ? firstJson.products : []
        const total = Number(firstJson.count ?? firstProducts.length)
        const target = Math.min(total, MAX_FETCH)

        allProducts.push(...firstProducts)

        let internalOffset = firstProducts.length

        while (internalOffset < target) {
            const take = Math.min(PAGE_SIZE, target - internalOffset)
            const response = await fetchWithTimeout(`${baseUrl}&limit=${take}&offset=${internalOffset}`, {
                method: "GET",
                headers: {
                    "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                    "Content-Type": "application/json"
                }
            })

            if (!response.ok) {
                throw createError({ statusCode: response.status, statusMessage: "Failed to fetch additional category products" })
            }

            const payload = (await response.json()) as StoreProductsResponse
            const products = Array.isArray(payload.products) ? payload.products : []

            allProducts.push(...products)
            internalOffset += products.length

            if (!products.length) {
                break
            }
        }

        const categoryMap = new Map<string, FacetItem>()
        const collectionMap = new Map<string, FacetItem>()
        const typeMap = new Map<string, FacetItem>()
        const tagMap = new Map<string, FacetItem>()

        let priceMin = Number.POSITIVE_INFINITY
        let priceMax = 0
        let currencyCode: string | null = null

        allProducts.forEach((product) => {
            const seenCategoryIds = new Set<string>()
            const seenTagIds = new Set<string>()

            const minProductPrice = getProductPrice(product, "min")
            const maxProductPrice = getProductPrice(product, "max")

            if (minProductPrice) {
                priceMin = Math.min(priceMin, minProductPrice)
            }

            if (maxProductPrice) {
                priceMax = Math.max(priceMax, maxProductPrice)
            }

            if (!currencyCode) {
                currencyCode =
                    product.variants?.find((variant) => variant.calculated_price?.currency_code)?.calculated_price?.currency_code ?? null
            }

            addFacetCount(collectionMap, product.collection)
            addFacetCount(typeMap, product.type)
            ;(product.categories ?? []).forEach((item) => {
                if (seenCategoryIds.has(item.id)) {
                    return
                }

                seenCategoryIds.add(item.id)
                addFacetCount(categoryMap, item)
            })
            ;(product.tags ?? []).forEach((item) => {
                if (seenTagIds.has(item.id)) {
                    return
                }

                seenTagIds.add(item.id)
                addFacetCount(tagMap, item)
            })
        })

        const filtered = allProducts.filter((product) => {
            if (selectedChildCategoryIds.length) {
                const categoryIds = new Set((product.categories ?? []).map((item) => item.id))
                if (!selectedChildCategoryIds.some((id) => categoryIds.has(id))) {
                    return false
                }
            }

            if (selectedCollectionIds.length && (!product.collection?.id || !selectedCollectionIds.includes(product.collection.id))) {
                return false
            }

            if (selectedTypeIds.length && (!product.type?.id || !selectedTypeIds.includes(product.type.id))) {
                return false
            }

            if (selectedTagIds.length) {
                const productTagIds = new Set((product.tags ?? []).map((item) => item.id))
                if (!selectedTagIds.some((id) => productTagIds.has(id))) {
                    return false
                }
            }

            if (inStockOnly && !isInStock(product)) {
                return false
            }

            const price = getProductPrice(product, "min")

            if (minPrice && price && price < minPrice) {
                return false
            }

            if (maxPrice && price && price > maxPrice) {
                return false
            }

            return !((minPrice || maxPrice) && price === null)
        })

        const sorted = [...filtered].sort((a, b) => compareProducts(a, b, order))
        const paginated = sorted.slice(offset, offset + limit)

        setHeader(event, "Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=86400")

        return {
            products: paginated,
            count: filtered.length,
            facets: {
                categories: [...categoryMap.values()].sort((a, b) => a.label.localeCompare(b.label)),
                collections: [...collectionMap.values()].sort((a, b) => a.label.localeCompare(b.label)),
                types: [...typeMap.values()].sort((a, b) => a.label.localeCompare(b.label)),
                tags: [...tagMap.values()].sort((a, b) => a.label.localeCompare(b.label)),
                price: {
                    min: Number.isFinite(priceMin) ? priceMin : 0,
                    max: priceMax,
                    currencyCode
                }
            }
        }
    } catch (error: unknown) {
        console.error("Error fetching category products:", error)

        setHeader(event, "Cache-Control", "no-store")

        const typedError = error as ErrorShape
        const code = typedError.cause?.code || typedError.code

        if (code === "ECONNREFUSED" || code === "ENOTFOUND" || typedError.name === "AbortError") {
            throw createError({ statusCode: 503, statusMessage: "Medusa is unavailable" })
        }

        if (typedError.statusCode && typedError.statusMessage) {
            throw error
        }

        throw createError({ statusCode: 500, statusMessage: "Failed to fetch category products" })
    }
})
