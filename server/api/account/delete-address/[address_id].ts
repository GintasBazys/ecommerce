export default defineEventHandler(async (event) => {
    const accessToken = getCookie(event, "connect.sid")
    if (!accessToken) {
        throw createError({ statusCode: 401, statusMessage: "Not authenticated" })
    }

    const config = useRuntimeConfig()
    const { address_id } = event.context.params as { address_id: string }

    const headers = {
        Authorization: `Bearer ${accessToken}`,
        "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
        "Content-Type": "application/json",
        cookie: event.node.req.headers.cookie || ""
    }

    return await $fetch(`${config.public.MEDUSA_URL}/store/customers/me/addresses/${address_id}`, {
        method: "DELETE",
        headers,
        credentials: "include"
    })
})
