import { fetchMedusaJson } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const accessToken = getCookie(event, "connect.sid")
    if (!accessToken) {
        throw createError({ statusCode: 401, statusMessage: "Not authenticated" })
    }

    return fetchMedusaJson(
        event,
        "/store/customers/me",
        {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify(body)
        },
        "Could not update your account."
    )
})
