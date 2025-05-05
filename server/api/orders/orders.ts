export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const cookieHeader = event.node.req.headers.cookie || ""

    const query = getQuery(event)
    const pageParam = Array.isArray(query.page) ? query.page[0] : (query.page ?? "1")
    const limitParam = Array.isArray(query.limit) ? query.limit[0] : (query.limit ?? "10")

    const page = parseInt(pageParam, 10)
    const limit = parseInt(limitParam, 10)
    const offset = (page - 1) * limit

    try {
        const url = new URL(`${config.public.MEDUSA_URL}/store/orders`)
        url.searchParams.set("offset", offset.toString())
        url.searchParams.set("limit", limit.toString())

        const resp = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                Cookie: cookieHeader
            }
        })

        if (!resp.ok) {
            throw new Error(`Failed to fetch orders: ${resp.status} ${resp.statusText}`)
        }

        const data = await resp.json()
        return { orders: data.orders, total: data.count }
    } catch (err) {
        console.error("Error fetching paginated orders:", err)
        return createError({ statusCode: 401, statusMessage: "Not signed in" })
    }
})
