import type { CartResponse } from "@/stores/product"

export default eventHandler(async (event) => {
    const cartId = getCookie(event, "cart_id") || null
    const config = useRuntimeConfig()
    const query = getQuery(event)

    try {
        const regionId = query.region_id || null

        if (!regionId) {
            throw createError({ statusCode: 400, statusMessage: "Region ID is required" })
        }

        let cart

        if (!cartId) {
            const { cart: newCart } = await $fetch<CartResponse>(`${config.public.MEDUSA_URL}/store/carts`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                    "Content-Type": "application/json"
                },
                body: { region_id: regionId }
            })
            cart = newCart
        } else {
            const { cart: existingCart } = await $fetch<CartResponse>(`${config.public.MEDUSA_URL}/store/carts/${cartId}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                    "Content-Type": "application/json"
                },
                params: {
                    fields: "*items"
                }
            })
            cart = existingCart
        }

        return { cart, regionId }
    } catch (error) {
        console.error("Error in cart operation:", error)
        throw error
    }
})
