export default defineEventHandler(async (event) => {
    const params = event.context.params as Record<string, string> | undefined

    if (!params || !params.cartId || !params.lineItemId) {
        event.node.res.statusCode = 400
        return {
            success: false,
            error: "Invalid parameters: cartId and lineItemId are required."
        }
    }

    const { cartId, lineItemId } = params

    const body = await readBody(event)
    const { quantity } = body

    if (quantity == null) {
        event.node.res.statusCode = 400
        return {
            success: false,
            error: "Invalid parameters: quantity is required."
        }
    }

    const config = useRuntimeConfig()
    try {
        const cartResponse = await fetch(`${config.public.MEDUSA_URL}/store/carts/${cartId}/line-items/${lineItemId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY
            },
            body: JSON.stringify({ quantity })
        })

        if (!cartResponse.ok) {
            const errorText = await cartResponse.text()
            throw new Error(`Failed to update cart: ${cartResponse.status} ${errorText}`)
        }

        const updatedCart = await cartResponse.json()
        return { success: true, cart: updatedCart.cart }
    } catch (error) {
        console.error("Error updating cart:", error)
        event.node.res.statusCode = 500
        return { success: false, error: "An unknown error occurred" }
    }
})
