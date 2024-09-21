import { serverMedusaClient } from "#medusa/server"
export default eventHandler(async (event) => {
    const client = serverMedusaClient(event)
    const cartId = getCookie(event, "cart_id") || null
    if (!cartId) {
        const { cart } = await client.carts.create()
        setCookie(event, "cart_id", cart.id)
        return { cart }
    } else {
        const { cart } = await client.carts.retrieve(cartId)
        return { cart }
    }
})
