export default eventHandler(async (event) => {
    const cartId = getCookie(event, "cart_id") || null
    const config = useRuntimeConfig()
    const query = getQuery(event)

    try {
        const regionId = query.regionId || null

        if (!regionId) {
            throw new Error("Region ID is required")
        }

        let cart

        if (!cartId) {
            const response = await fetch(`${config.public.MEDUSA_URL}/store/carts`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ region_id: regionId })
            })

            if (!response.ok) {
                throw new Error(`Failed to create cart: ${response.statusText}`)
            }

            const data = await response.json()
            cart = data.cart
        } else {
            const response = await fetch(`${config.public.MEDUSA_URL}/store/carts/${cartId}?fields=*items`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                    "Content-Type": "application/json"
                }
            })

            if (!response.ok) {
                throw new Error(`Failed to retrieve cart: ${response.statusText}`)
            }

            const data = await response.json()
            cart = data.cart
        }

        return { cart, regionId }
    } catch (error) {
        console.error("Error in cart operation:", error)
        throw error
    }
})
