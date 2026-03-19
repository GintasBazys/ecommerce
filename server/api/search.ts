import type { ProductDTO } from "@medusajs/types"

type StoreProductsResponse = {
    products: ProductDTO[]
    count?: number
    limit?: number
    offset?: number
}

function normalizeSearchValue(value: string): string {
    return value.toLowerCase().replace(/\s+/g, " ").trim()
}

function buildProductSearchText(product: ProductDTO): string {
    const variantTexts = (product.variants || [])
        .map((variant) => [variant.title, variant.sku].filter(Boolean).join(" "))
        .join(" ")

    return normalizeSearchValue(
        [product.title, product.subtitle, product.description, product.handle, variantTexts].filter(Boolean).join(" ")
    )
}

function scoreProduct(product: ProductDTO, normalizedQuery: string, queryTokens: string[]): number {
    const searchText = buildProductSearchText(product)
    if (!searchText) {
        return 0
    }

    if (searchText.includes(normalizedQuery)) {
        return 4
    }

    const hasAllTokens = queryTokens.every((token) => searchText.includes(token))
    if (hasAllTokens) {
        return 3
    }

    const hasAnyToken = queryTokens.some((token) => searchText.includes(token))
    if (hasAnyToken) {
        return 2
    }

    return 0
}

function dedupeProducts(products: ProductDTO[]): ProductDTO[] {
    const seen = new Set<string>()
    const deduped: ProductDTO[] = []

    for (const product of products) {
        if (!product.id || seen.has(product.id)) {
            continue
        }
        seen.add(product.id)
        deduped.push(product)
    }

    return deduped
}

export default eventHandler(async (event) => {
    const { q } = await readBody<{ q?: string }>(event)
    const query = getQuery(event)
    const config = useRuntimeConfig()

    const rawQuery = typeof q === "string" ? q.trim() : ""
    if (!rawQuery) {
        throw createError({ statusCode: 400, message: "Search query is required" })
    }

    const regionId = query.region_id ? String(query.region_id) : null

    const baseParams = new URLSearchParams({
        fields: "*variants.calculated_price,*variants.inventory_quantity",
        limit: "48",
        offset: "0"
    })
    if (regionId) {
        baseParams.set("region_id", regionId)
    }

    const fetchProducts = async (searchTerm: string): Promise<StoreProductsResponse> => {
        const searchParams = new URLSearchParams(baseParams)
        searchParams.set("q", searchTerm)

        return await $fetch<StoreProductsResponse>(`${config.public.MEDUSA_URL}/store/products?${searchParams.toString()}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY
            }
        })
    }

    const fetchFallbackPool = async (): Promise<ProductDTO[]> => {
        const fallbackParams = new URLSearchParams(baseParams)
        fallbackParams.set("limit", "200")
        fallbackParams.set("offset", "0")

        const fallbackResponse = await $fetch<StoreProductsResponse>(
            `${config.public.MEDUSA_URL}/store/products?${fallbackParams.toString()}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "x-publishable-api-key": config.public.PUBLISHABLE_KEY
                }
            }
        )

        return fallbackResponse.products || []
    }

    try {
        const primaryResponse = await fetchProducts(rawQuery)
        let collectedProducts = dedupeProducts(primaryResponse.products || [])

        const queryTokens = normalizeSearchValue(rawQuery).split(" ").filter(Boolean)

        if (!collectedProducts.length && queryTokens.length > 1) {
            const tokenResponses = await Promise.all(queryTokens.filter((token) => token.length >= 2).map(fetchProducts))
            const tokenProducts = tokenResponses.flatMap((response) => response.products || [])
            collectedProducts = dedupeProducts(tokenProducts)
        }

        if (!collectedProducts.length && rawQuery.length >= 3) {
            const normalizedQuery = normalizeSearchValue(rawQuery)
            const fallbackPool = await fetchFallbackPool()
            const rankedProducts = fallbackPool
                .map((product) => ({ product, rank: scoreProduct(product, normalizedQuery, queryTokens) }))
                .filter((entry) => entry.rank > 0)
                .sort((left, right) => right.rank - left.rank)
                .map((entry) => entry.product)

            collectedProducts = dedupeProducts(rankedProducts).slice(0, 48)
        }

        if (collectedProducts.length) {
            return {
                ...primaryResponse,
                products: collectedProducts,
                count: collectedProducts.length,
                limit: primaryResponse.limit ?? collectedProducts.length,
                offset: primaryResponse.offset ?? 0
            }
        }

        return {
            ...primaryResponse,
            products: [],
            count: 0
        }
    } catch {
        throw createError({ statusCode: 500, message: "Failed to fetch search results" })
    }
})
