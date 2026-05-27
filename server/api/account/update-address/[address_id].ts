import { fetchMedusaJson } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    const accessToken = getCookie(event, "connect.sid")
    if (!accessToken) {
        throw createError({ statusCode: 401, statusMessage: "Not authenticated" })
    }

    const { address_id } = event.context.params as { address_id: string }

    const body = validateCustomerAddressPayload(await readBody(event))
    return fetchMedusaJson(
        event,
        `/store/customers/me/addresses/${address_id}`,
        {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify(body)
        },
        "Could not update this address."
    )
})
