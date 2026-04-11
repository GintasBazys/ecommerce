import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const accessToken = getCookie(event, "connect.sid")
    if (!accessToken) {
        throw createError({ statusCode: 401, statusMessage: "Not authenticated" })
    }

    try {
        return await fetchMedusaJson(event, "/store/reviews", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify(body)
        })
    } catch (error: unknown) {
        throw toUpstreamError(error, "Failed to add review")
    }
})
