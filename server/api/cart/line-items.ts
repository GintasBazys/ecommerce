import { retrieveExpandedCart, syncCartCountry } from "#server/utils/cart"

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { cartId, variant_id, quantity } = body

    if (!cartId || !variant_id || quantity == null) {
        event.node.res.statusCode = 400
        return {
            success: false,
            error: "Invalid parameters: cartId, variant_id, and quantity are required."
        }
    }

    const config = useRuntimeConfig()
    const countryCode = getCookie(event, "country_code") || null
    try {
        const cartResponse = await fetch(`${config.public.MEDUSA_URL}/store/carts/${cartId}/line-items`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY
            },
            body: JSON.stringify({ variant_id, quantity })
        })

        if (!cartResponse.ok) {
            const errorText = await cartResponse.text()
            throw new Error(`Failed to update cart: ${cartResponse.status} ${errorText}`)
        }

        await cartResponse.json()
        const updatedCart = await retrieveExpandedCart(event, config.public.MEDUSA_URL, config.public.PUBLISHABLE_KEY, cartId)

        return {
            success: true,
            cart: await syncCartCountry(event, config.public.MEDUSA_URL, config.public.PUBLISHABLE_KEY, updatedCart, countryCode)
        }
    } catch (error) {
        console.error("Error updating cart:", error)
        event.node.res.statusCode = 500
        return { success: false, error: "An unknown error occurred" }
    }
})
