import type { ProductDTO } from "@medusajs/types"
import type { H3Event } from "h3"

import { toUpstreamError } from "#server/utils/medusa-proxy"
import { fetchAllStoreProducts, fetchStoreProducts } from "#server/utils/products"

type SearchRequestBody = {
    q?: string
}

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

function buildBaseSearchParams(regionId: string | null, countryCode: string | null) {
    const searchParams = new URLSearchParams({
        fields: "*variants.calculated_price,*variants.inventory_quantity",
        limit: "48",
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
            fallbackParams.set("limit", "200")
            const fallbackResponse = await fetchAllStoreProducts<ProductDTO>(event, fallbackParams, { maxFetch: 200, pageSize: 200 })
            const normalizedQuery = normalizeSearchValue(rawQuery)

            collectedProducts = dedupeProducts(
                fallbackResponse.products
                    .map((product) => ({ product, rank: scoreProduct(product, normalizedQuery, queryTokens) }))
                    .filter((entry) => entry.rank > 0)
                    .sort((left, right) => right.rank - left.rank)
                    .map((entry) => entry.product)
            ).slice(0, 48)
        }

        if (!collectedProducts.length) {
            return {
                ...primaryResponse,
                products: [],
                count: 0
            }
        }

        return {
            ...primaryResponse,
            products: collectedProducts,
            count: collectedProducts.length,
            limit: primaryResponse.limit ?? collectedProducts.length,
            offset: primaryResponse.offset ?? 0
        }
    } catch (error: unknown) {
        throw toUpstreamError(error, "Failed to fetch search results")
    }
})
