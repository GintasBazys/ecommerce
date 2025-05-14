import { LIMIT } from "@/utils/consts"

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)

    const productId = query.product_id
    const limit = query.limit !== undefined && query.limit !== null ? String(query.limit) : String(LIMIT)
    const offset = query.offset !== undefined && query.offset !== null ? String(query.offset) : "0"

    if (!productId) {
        return {
            error: true,
            message: "Missing required query parameter: product_id"
        }
    }

    const queryParams = new URLSearchParams({
        limit,
        offset
    })

    try {
        const response = await fetch(`${config.public.MEDUSA_URL}/store/products/${productId}/reviews?${queryParams.toString()}`, {
            method: "GET",
            headers: {
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                "Content-Type": "application/json"
            }
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch product reviews: ${response.statusText}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error("Error fetching product reviews:", error)
        return { error: true, message: "Failed to fetch product reviews" }
    }
})
