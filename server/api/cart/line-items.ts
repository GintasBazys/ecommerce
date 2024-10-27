import { serverMedusaClient } from "#medusa/server"

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { cartId, variant_id, quantity } = body

    if (!cartId || !variant_id || quantity == null) {
        return {
            success: false,
            error: "Invalid parameters: cartId, variantId, and quantity are required."
        }
    }

    const client = serverMedusaClient(event)

    try {
        const { cart } = await client.carts.retrieve(cartId)
        const existingItem = cart.items.find((item) => item.variant_id === variant_id)

        let updatedCartData
        if (existingItem) {
            updatedCartData = await client.carts.lineItems.update(cartId, existingItem.id, { quantity })
        } else {
            updatedCartData = await client.carts.lineItems.create(cartId, { variant_id, quantity })
        }

        const { items, total, subtotal, ...rest } = updatedCartData.cart
        return { success: true, cart: { items, total, subtotal, ...rest } }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return { success: false, error: errorMessage }
    }
})
