export default defineEventHandler(async (event) => {
    const accessToken = getCookie(event, "connect.sid")
    const config = useRuntimeConfig()

    if (!accessToken) {
        throw createError({ statusCode: 401, statusMessage: "Not authenticated" })
    }

    const body = await readBody(event)

    const headers = {
        Authorization: `Bearer ${accessToken}`,
        "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
        "Content-Type": "application/json",
        cookie: event.node.req.headers.cookie || ""
    }

    return $fetch(`${config.public.MEDUSA_URL}/store/customers/me/addresses`, {
        method: "POST",
        headers,
        body,
        credentials: "include"
    })
})
