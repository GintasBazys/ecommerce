import { LIMIT } from "@/utils/consts"

import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const limit = query.limit != null ? String(query.limit) : LIMIT
    const offset = query.offset != null ? String(query.offset) : "0"
    const regionId = query.region_id ? String(query.region_id) : ""
    const countryCode = query.country_code ? String(query.country_code) : null
    const tagId = process.env.MEDUSA_API_TAG || ""

    if (!regionId) {
        throw createError({ statusCode: 400, statusMessage: "region_id is required" })
    }

    const searchParams = new URLSearchParams({
        fields: "*variants.calculated_price,*variants.inventory_quantity",
        region_id: regionId,
        limit,
        offset
    })

    if (countryCode) {
        searchParams.set("country_code", countryCode)
    }

    if (tagId) {
        searchParams.set("tag_id", tagId)
    }

    try {
        return await fetchMedusaJson(event, `/store/products?${searchParams.toString()}`)
    } catch (error: unknown) {
        throw toUpstreamError(error, "Failed to fetch products")
    }
})
