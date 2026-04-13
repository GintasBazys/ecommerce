import { LIMIT } from "@/utils/consts"
import { getQueryCacheKey } from "#server/utils/cache"
import { assertMedusaResponse, fetchMedusaResponse, safeJson, toUpstreamError } from "#server/utils/medusa-proxy"

type ProductsResponse = {
    products?: unknown[]
    count?: number
}

export default defineCachedEventHandler(
    async (event) => {
        const query = getQuery(event)

        const limit = query.limit != null ? String(query.limit) : LIMIT
        const offset = query.offset != null ? String(query.offset) : "0"
        const categoryId = query.category_id != null ? String(query.category_id) : null
        const handle = query.handle ? String(query.handle) : null
        const order = query.order ? String(query.order) : "-created_at"

        const regionId = query.region_id ? String(query.region_id) : null
        const countryCode = query.country_code ? String(query.country_code) : ""
        if (!regionId) {
            throw createError({ statusCode: 400, statusMessage: "region_id is required" })
        }

        const queryParams = new URLSearchParams({
            fields: `*variants.calculated_price,+variants.inventory_quantity,*categories,+metadata`,
            region_id: regionId,
            country_code: countryCode,
            order
        })

        if (handle) queryParams.set("handle", handle)
        if (categoryId) queryParams.set("category_id", categoryId)
        if (countryCode) queryParams.set("country_code", countryCode)

        if (!countryCode) {
            throw createError({ statusCode: 400, statusMessage: "country_code is required for tax pricing" })
        }

        const path = `/store/products?${queryParams.toString()}&limit=${limit}&offset=${offset}`

        try {
            const response = await fetchMedusaResponse(event, path, {
                method: "GET"
            })

            await assertMedusaResponse(response, "Failed to fetch products")

            setHeader(event, "Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=86400")
            const payload = await safeJson<ProductsResponse>(response)

            if (payload === null) {
                throw createError({ statusCode: 502, statusMessage: "Invalid Medusa response" })
            }

            return payload
        } catch (error: unknown) {
            setHeader(event, "Cache-Control", "no-store")
            throw toUpstreamError(error, "Failed to fetch products")
        }
    },
    {
        name: "products-cache",
        maxAge: 300,
        swr: true,
        getKey: (event) => getQueryCacheKey(event, "products-v2")
    }
)
