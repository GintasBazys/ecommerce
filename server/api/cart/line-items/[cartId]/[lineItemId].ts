export default defineEventHandler(async (event) => {
    const params = event.context.params as Record<string, string> | undefined
    const { cartId, lineItemId } = params ?? {}
    const body = await readBody(event)
    const { quantity, variant_id } = body

    if (!cartId || !lineItemId || quantity == null) {
        event.node.res.statusCode = 400
        return { success: false, error: "Missing parameters" }
    }

    const config = useRuntimeConfig()

    try {
        const deleteRes = await fetch(`${config.public.MEDUSA_URL}/store/carts/${cartId}/line-items/${lineItemId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
            },
        })

        if (!deleteRes.ok) {
            const errText = await deleteRes.text()
            throw new Error(`Failed to delete line item: ${errText}`)
        }

        const addRes = await fetch(`${config.public.MEDUSA_URL}/store/carts/${cartId}/line-items`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
            },
            body: JSON.stringify({
                variant_id,
                quantity,
            }),
        })

        if (!addRes.ok) {
            const errText = await addRes.text()
            throw new Error(`Failed to re-add line item: ${errText}`)
        }

        const updatedCart = await addRes.json()
        return { success: true, cart: updatedCart.cart }
    } catch (err) {
        console.error("Error updating cart:", err)
        event.node.res.statusCode = 500
        return { success: false, error: "Unable to update line item" }
    }
})
