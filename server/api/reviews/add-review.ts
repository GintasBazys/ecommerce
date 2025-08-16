export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const accessToken = getCookie(event, "connect.sid")
    if (!accessToken) {
        throw createError({ statusCode: 401, statusMessage: "Not authenticated" })
    }

    const config = useRuntimeConfig()
    const headers = {
        "Content-Type": "application/json",
        "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
        Authorization: `Bearer ${accessToken}`,
        cookie: event.node.req.headers.cookie || ""
    }

    return $fetch(`${config.public.MEDUSA_URL}/store/reviews`, {
        method: "POST",
        headers,
        credentials: "include",
        body
    })
})
