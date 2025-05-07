export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const accessToken = getCookie(event, "connect.sid")
    const config = useRuntimeConfig()
    if (!accessToken) {
        throw createError({ statusCode: 401, statusMessage: "Not authenticated" })
    }

    const forwardedHeaders = {
        "Content-Type": "application/json",
        "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
        Authorization: `Bearer ${accessToken}`,
        cookie: event.node.req.headers.cookie || ""
    }

    return await $fetch(`${config.public.MEDUSA_URL}/store/customers/me`, {
        method: "POST",
        headers: forwardedHeaders,
        credentials: "include",
        body
    })
})
