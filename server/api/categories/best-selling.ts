import { LIMIT } from "@/utils/consts"

import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const limit = query.limit != null ? String(query.limit) : String(LIMIT)
    const offset = query.offset != null ? String(query.offset) : "0"
    const regionId = query.region_id ? String(query.region_id) : ""

    if (!regionId) {
        throw createError({ statusCode: 400, statusMessage: "region_id is required" })
    }

    const searchParams = new URLSearchParams({
        region_id: regionId,
        limit,
        offset
    })

    try {
        const payload = await fetchMedusaJson(event, `/store/products/bestselling?${searchParams.toString()}`)
        setHeader(event, "Cache-Control", "no-store")
        return payload
    } catch (error: unknown) {
        setHeader(event, "Cache-Control", "no-store")
        throw toUpstreamError(error, "Failed to fetch products")
    }
})
