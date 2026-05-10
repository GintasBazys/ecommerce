import type { ProductDTO } from "@medusajs/types"
import type { H3Event } from "h3"

import { toUpstreamError } from "#server/utils/medusa-proxy"
import { fetchAllStoreProducts, fetchStoreProducts } from "#server/utils/products"

type SearchRequestBody = {
    q?: string
}

const SEARCH_SORT_OPTIONS = new Set(["relevance", "price_asc", "price_desc", "newest"])
const DEFAULT_LIMIT = 24
const MAX_LIMIT = 96

function normalizeSearchValue(value: string) {
    return value.toLowerCase().replace(/\s+/g, " ").trim()
}

function buildProductSearchText(product: ProductDTO) {
    const variantText = (product.variants ?? []).map((variant) => [variant.title, variant.sku].filter(Boolean).join(" ")).join(" ")

    return normalizeSearchValue(
        [product.title, product.subtitle, product.description, product.handle, variantText].filter(Boolean).join(" ")
    )
}

function scoreProduct(product: ProductDTO, normalizedQuery: string, queryTokens: string[]) {
    const searchText = buildProductSearchText(product)
    if (!searchText) {
        return 0
    }

    if (searchText.includes(normalizedQuery)) {
        return 4
    }

    if (queryTokens.every((token) => searchText.includes(token))) {
        return 3
    }

    if (queryTokens.some((token) => searchText.includes(token))) {
        return 2
    }

    return 0
}

function dedupeProducts(products: ProductDTO[]) {
    const seenProductIds = new Set<string>()
    const dedupedProducts: ProductDTO[] = []

    for (const product of products) {
        if (!product.id || seenProductIds.has(product.id)) {
            continue
        }

        seenProductIds.add(product.id)
        dedupedProducts.push(product)
    }

    return dedupedProducts
}

function getProductPrice(product: ProductDTO): number | null {
    const prices = (product.variants ?? [])
        .map((variant) => variant.calculated_price?.calculated_amount)
        .filter((price): price is number => typeof price === "number")

    return prices.length ? Math.min(...prices) : null
}

function isProductInStock(product: ProductDTO): boolean {
    return (product.variants ?? []).some((variant) => typeof variant.inventory_quantity !== "number" || variant.inventory_quantity > 0)
}

function parsePositiveInteger(value: unknown, fallbackValue: number): number {
    const parsedValue = Number(value)

    return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallbackValue
}

function getProductTimestamp(product: ProductDTO): number {
    const timestamp = product.created_at ? Date.parse(String(product.created_at)) : Number.NEGATIVE_INFINITY

    return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp
}

function sortProducts(products: ProductDTO[], sort: string): ProductDTO[] {
    if (sort === "price_asc") {
        return [...products].sort((left, right) => (getProductPrice(left) ?? Number.POSITIVE_INFINITY) - (getProductPrice(right) ?? Number.POSITIVE_INFINITY))
    }

    if (sort === "price_desc") {
        return [...products].sort((left, right) => (getProductPrice(right) ?? Number.NEGATIVE_INFINITY) - (getProductPrice(left) ?? Number.NEGATIVE_INFINITY))
    }

    if (sort === "newest") {
        return [...products].sort((left, right) => getProductTimestamp(right) - getProductTimestamp(left))
    }

    return products
}

function buildBaseSearchParams(regionId: string | null, countryCode: string | null) {
    const searchParams = new URLSearchParams({
        fields: "*variants.calculated_price,*variants.inventory_quantity",
        limit: "100",
        offset: "0"
    })

    if (regionId) {
        searchParams.set("region_id", regionId)
    }

    if (countryCode) {
        searchParams.set("country_code", countryCode)
    }

    return searchParams
}

async function searchProducts(event: H3Event, baseSearchParams: URLSearchParams, term: string) {
    const searchParams = new URLSearchParams(baseSearchParams)
    searchParams.set("q", term)

    return await fetchStoreProducts<ProductDTO>(event, searchParams)
}

export default defineEventHandler(async (event) => {
    const body = await readBody<SearchRequestBody>(event)
    const query = getQuery(event)

    const rawQuery = typeof body.q === "string" ? body.q.trim() : ""
    if (!rawQuery) {
        throw createError({ statusCode: 400, statusMessage: "Search query is required" })
    }

    const regionId = query.region_id ? String(query.region_id) : null
    const countryCode = query.country_code ? String(query.country_code) : null
    const requestedSort = query.sort ? String(query.sort) : "relevance"
    const sort = SEARCH_SORT_OPTIONS.has(requestedSort) ? requestedSort : "relevance"
    const limit = Math.min(parsePositiveInteger(query.limit, DEFAULT_LIMIT), MAX_LIMIT)
    const inStockOnly = String(query.in_stock_only ?? "false") === "true"
    const baseSearchParams = buildBaseSearchParams(regionId, countryCode)
    const queryTokens = normalizeSearchValue(rawQuery).split(" ").filter(Boolean)

    try {
        const primaryResponse = await searchProducts(event, baseSearchParams, rawQuery)
        let collectedProducts = dedupeProducts(primaryResponse.products ?? [])

        if (!collectedProducts.length && queryTokens.length > 1) {
            const tokenResponses = await Promise.all(
                queryTokens.filter((token) => token.length >= 2).map((token) => searchProducts(event, baseSearchParams, token))
            )

            collectedProducts = dedupeProducts(tokenResponses.flatMap((response) => response.products ?? []))
        }

        if (!collectedProducts.length && rawQuery.length >= 3) {
            const fallbackParams = new URLSearchParams(baseSearchParams)
            fallbackParams.set("limit", "100")
            const fallbackResponse = await fetchAllStoreProducts<ProductDTO>(event, fallbackParams, { maxFetch: 100, pageSize: 100, concurrency: 2 })
            const normalizedQuery = normalizeSearchValue(rawQuery)

            collectedProducts = dedupeProducts(
                fallbackResponse.products
                    .map((product) => ({ product, rank: scoreProduct(product, normalizedQuery, queryTokens) }))
                    .filter((entry) => entry.rank > 0)
                    .sort((left, right) => right.rank - left.rank)
                    .map((entry) => entry.product)
            )
        }

        const refinedProducts = sortProducts(inStockOnly ? collectedProducts.filter(isProductInStock) : collectedProducts, sort)

        if (!refinedProducts.length) {
            return {
                ...primaryResponse,
                products: [],
                count: 0
            }
        }

        return {
            ...primaryResponse,
            products: refinedProducts.slice(0, limit),
            count: refinedProducts.length,
            limit,
            offset: 0
        }
    } catch (error: unknown) {
        throw toUpstreamError(error, "Failed to fetch search results")
    }
})
