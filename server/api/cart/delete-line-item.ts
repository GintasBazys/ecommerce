import { serverMedusaClient } from "#medusa/server"

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { cartId, lineItemId } = body

    if (!cartId || !lineItemId) {
        return {
            success: false,
            error: "Invalid parameters: cartId and lineItemId are required."
        }
    }

    const client = serverMedusaClient(event)

    try {
        const updatedCartData = await client.carts.lineItems.delete(cartId, lineItemId)

        const { items, total, subtotal, ...rest } = updatedCartData.cart
        return { success: true, cart: { items, total, subtotal, ...rest } }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return { success: false, error: errorMessage }
    }
})
