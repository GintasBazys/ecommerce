import { LIMIT } from "@/utils/consts"

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)

    const limit = query.limit != null ? String(query.limit) : LIMIT
    const offset = query.offset != null ? String(query.offset) : "0"
    const regionId = String(query.region_id)

    const params = {
        fields: `*variants.calculated_price,*variants.inventory_quantity`,
        region_id: regionId,
        tag_id: process.env.MEDUSA_API_TAG || "",
        limit,
        offset
    }

    try {
        const data = await $fetch(`${config.public.MEDUSA_URL}/store/products`, {
            method: "GET",
            headers: {
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY
            },
            params
        })

        return data
    } catch (error) {
        console.error("Error fetching products:", error)
        return { error: "Failed to fetch products" }
    }
})
