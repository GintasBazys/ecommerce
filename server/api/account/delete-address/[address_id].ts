import { fetchMedusaJson } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    const accessToken = getCookie(event, "connect.sid")
    if (!accessToken) {
        throw createError({ statusCode: 401, statusMessage: "Not authenticated" })
    }

    const { address_id } = event.context.params as { address_id: string }

    return fetchMedusaJson(
        event,
        `/store/customers/me/addresses/${address_id}`,
        {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` }
        },
        "Could not delete this address."
    )
})
