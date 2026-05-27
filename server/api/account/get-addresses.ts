import { LIMIT } from "@/utils/consts"
import { fetchMedusaJson } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    const accessToken = getCookie(event, "connect.sid")

    if (!accessToken) {
        throw createError({ statusCode: 401, statusMessage: "Not authenticated" })
    }

    const query = getQuery(event)

    const limit = query.limit !== undefined && query.limit !== null ? String(query.limit) : LIMIT
    const offset = query.offset !== undefined && query.offset !== null ? String(query.offset) : "0"

    return fetchMedusaJson(
        event,
        `/store/customers/me/addresses?fields=*address_name&limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`,
        {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` }
        },
        "Could not load your addresses."
    )
})
