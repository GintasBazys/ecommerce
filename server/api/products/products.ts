import { LIMIT } from "@/utils/consts"

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)

    const limit = query.limit !== undefined && query.limit !== null ? String(query.limit) : LIMIT
    const offset = query.offset !== undefined && query.offset !== null ? String(query.offset) : "0"
    const regionId = String(query.region_id)
    const handle = query.handle ? String(query.handle) : null

    const queryParams = new URLSearchParams({
        fields: `*variants.calculated_price,*variants.inventory_quantity`,
        region_id: regionId
    })

    if (handle) {
        queryParams.set("handle", handle)
    }

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
            throw new Error(`Failed to fetch products: ${response.statusText}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error("Error fetching products:", error)
        return { error: "Failed to fetch products" }
    }
})
