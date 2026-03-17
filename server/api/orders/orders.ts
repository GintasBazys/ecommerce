export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    const cookie = getHeader(event, "cookie") ?? ""

    const query = getQuery(event)
    const pageParam = Array.isArray(query.page) ? query.page[0] : (query.page ?? "1")
    const limitParam = Array.isArray(query.limit) ? query.limit[0] : (query.limit ?? "10")

    const page = Math.max(1, parseInt(String(pageParam), 10) || 1)
    const limit = Math.max(1, parseInt(String(limitParam), 10) || 10)
    const offset = (page - 1) * limit

    const url = new URL(`${config.public.MEDUSA_URL}/store/orders`)
    url.searchParams.set("offset", String(offset))
    url.searchParams.set("limit", String(limit))

    const resp = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
            cookie
        }
    })

    if (!resp.ok) {
        const text = await resp.text().catch(() => "")
        throw createError({
            statusCode: resp.status,
            statusMessage: text || `Failed to fetch orders: ${resp.status} ${resp.statusText}`
        })
    }

    const data = await resp.json()
    return { orders: data.orders ?? [], total: data.count ?? 0 }
})
