import { LIMIT } from "@/utils/consts"

async function fetchWithTimeout(input: RequestInfo, init: RequestInit & { timeoutMs?: number } = {}) {
    const { timeoutMs = 8000, ...rest } = init
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), timeoutMs)
    try {
        return await fetch(input, { ...rest, signal: controller.signal })
    } finally {
        clearTimeout(t)
    }
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)

    const limit = query.limit != null ? String(query.limit) : LIMIT
    const offset = query.offset != null ? String(query.offset) : "0"
    const categoryId = query.category_id != null ? String(query.category_id) : null
    const handle = query.handle ? String(query.handle) : null
    const order = query.order ? String(query.order) : "-created_at"

    const regionId = query.region_id ? String(query.region_id) : null
    if (!regionId) {
        throw createError({ statusCode: 400, statusMessage: "region_id is required" })
    }

    const queryParams = new URLSearchParams({
        fields: `+metadata,*categories,*variants.calculated_price,*variants.inventory_quantity`,
        region_id: regionId,
        order
    })

    if (handle) queryParams.set("handle", handle)
    if (categoryId) queryParams.set("category_id", categoryId)

    const url = `${config.public.MEDUSA_URL}/store/products?${queryParams.toString()}&limit=${limit}&offset=${offset}`

    try {
        const response = await fetchWithTimeout(url, {
            method: "GET",
            headers: {
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                "Content-Type": "application/json"
            },
            timeoutMs: 8000
        })

        if (!response.ok) {
            setHeader(event, "Cache-Control", "no-store")

            const bodyText = await response.text().catch(() => "")
            throw createError({
                statusCode: response.status,
                statusMessage: bodyText || `Failed to fetch products: ${response.status} ${response.statusText}`
            })
        }

        setHeader(event, "Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=86400")
        return await response.json()
    } catch (err: any) {
        console.error("Error fetching products:", err)

        setHeader(event, "Cache-Control", "no-store")

        const code = err?.cause?.code || err?.code
        if (code === "ECONNREFUSED" || code === "ENOTFOUND" || err?.name === "AbortError") {
            throw createError({ statusCode: 503, statusMessage: "Medusa is unavailable" })
        }

        throw createError({ statusCode: 500, statusMessage: "Failed to fetch products" })
    }
})
