import { LIMIT } from "@/utils/consts"

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)

    const limit = query.limit !== undefined && query.limit !== null ? String(query.limit) : LIMIT
    const offset = query.offset !== undefined && query.offset !== null ? String(query.offset) : "0"
    const categoryId = query.category_id !== undefined && query.category_id !== null ? String(query.category_id) : null
    const regionId = String(query.region_id)
    const handle = query.handle ? String(query.handle) : null
    const order = query.order ? String(query.order) : "-created_at"

    const queryParams = new URLSearchParams({
        fields: `+metadata,*variants.calculated_price,*variants.inventory_quantity`,
        region_id: regionId,
        order
    })

    if (handle) queryParams.set("handle", handle)
    if (categoryId) queryParams.set("category_id", categoryId)

    try {
        const response = await fetch(
            `${config.public.MEDUSA_URL}/store/products?${queryParams.toString()}&limit=${limit}&offset=${offset}`,
            {
                method: "GET",
                headers: {
                    "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                    "Content-Type": "application/json"
                }
            }
        )

        if (!response.ok) {
            createError({
                statusCode: response.status,
                statusMessage: `Failed to fetch products: ${response.statusText}`
            })
        }

        setHeader(event, "Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=86400")

        return await response.json()
    } catch (err) {
        console.error("Error fetching products:", err)
        setHeader(event, "Cache-Control", "no-store")
        throw err
    }
})
