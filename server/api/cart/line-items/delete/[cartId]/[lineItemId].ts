export default defineEventHandler(async (event) => {
    const cartId = getRouterParam(event, "cartId")
    const lineItemId = getRouterParam(event, "lineItemId")
    const config = useRuntimeConfig()

    if (!cartId || !lineItemId) {
        throw createError({
            statusCode: 400,
            message: "Missing required parameters: cartId and lineItemId"
        })
    }

    try {
        const response = await fetch(`${config.public.MEDUSA_URL}/store/carts/${cartId}/line-items/${lineItemId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY
            }
        })

        const result = await response.json()

        if (response.ok) {
            return {
                success: true,
                cart: result
            }
        } 
            throw new Error(result.message || "Failed to delete line item")
        
    } catch (error) {
        console.error("Error deleting line item:", error)
        throw createError({
            statusCode: 500,
            message: "Failed to remove item from cart"
        })
    }
})
