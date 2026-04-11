import { LIMIT } from "@/utils/consts"
import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const productId = query.product_id
    const limit = query.limit !== undefined && query.limit !== null ? String(query.limit) : String(LIMIT)
    const offset = query.offset !== undefined && query.offset !== null ? String(query.offset) : "0"

    if (!productId) {
        throw createError({ statusCode: 400, statusMessage: "Missing required query parameter: product_id" })
    }

    const queryParams = new URLSearchParams({
        limit,
        offset
    })

    try {
        return await fetchMedusaJson(event, `/store/products/${productId}/reviews?${queryParams.toString()}`, {
            method: "GET"
        })
    } catch (error: unknown) {
        throw toUpstreamError(error, "Failed to fetch product reviews")
    }
})
