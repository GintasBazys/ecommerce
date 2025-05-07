import { LIMIT } from "@/utils/consts"

export default defineEventHandler(async (event) => {
    const accessToken = getCookie(event, "connect.sid")
    const config = useRuntimeConfig()

    if (!accessToken) {
        throw createError({ statusCode: 401, statusMessage: "Not authenticated" })
    }

    const query = getQuery(event)

    const limit = query.limit !== undefined && query.limit !== null ? String(query.limit) : LIMIT
    const offset = query.offset !== undefined && query.offset !== null ? String(query.offset) : "0"

    const headers = {
        Authorization: `Bearer ${accessToken}`,
        "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
        "Content-Type": "application/json",
        cookie: event.node.req.headers.cookie || ""
    }

    return await $fetch(`${config.public.MEDUSA_URL}/store/customers/me/addresses?fields=*address_name&limit=${limit}&offset=${offset}`, {
        method: "GET",
        headers,
        credentials: "include"
    })
})
