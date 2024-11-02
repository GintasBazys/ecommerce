export default eventHandler(async (event) => {
    const cartId = getCookie(event, "cart_id") || null
    const config = useRuntimeConfig()

    try {
        let cart

        if (!cartId) {
            const regionResponse = await fetch(`${config.public.MEDUSA_URL}/store/regions`, {
                method: "GET",
                headers: {
                    "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                    "Content-Type": "application/json"
                }
            })

            if (!regionResponse.ok) {
                throw new Error(`Failed to fetch regions: ${regionResponse.statusText}`)
            }

            const regionsData = await regionResponse.json()
            const regionId = regionsData?.regions?.[0]?.id

            if (!regionId) {
                throw new Error("No valid region ID found")
            }

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
            setCookie(event, "cart_id", cart.id)
        } else {
            const response = await fetch(`${config.public.MEDUSA_URL}/store/carts/${cartId}`, {
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

        return { cart }
    } catch (error) {
        console.error("Error in cart operation:", error)
        throw error
    }
})
