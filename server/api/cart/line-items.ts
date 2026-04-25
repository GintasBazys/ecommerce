import { isPoisonedPaymentSessionError, recoverPoisonedCart, retrieveExpandedCart, syncCartCountry } from "#server/utils/cart"
import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"

type CreateLineItemBody = {
    cartId?: string
    variant_id?: string
    quantity?: number
}

export default defineEventHandler(async (event) => {
    const body = await readBody<CreateLineItemBody>(event)
    const { cartId, variant_id, quantity } = body

    if (!cartId || !variant_id || typeof quantity !== "number" || quantity <= 0) {
        throw createError({ statusCode: 400, statusMessage: "cartId, variant_id, and a positive quantity are required" })
    }

    const countryCode = getCookie(event, "country_code") || null
    try {
        await fetchMedusaJson(event, `/store/carts/${cartId}/line-items`, {
            method: "POST",
            body: JSON.stringify({ variant_id, quantity })
        })

        const updatedCart = await retrieveExpandedCart(event, cartId)

        return {
            success: true,
            cart: await syncCartCountry(event, updatedCart, countryCode)
        }
    } catch (error: unknown) {
        if (isPoisonedPaymentSessionError(error)) {
            const currentCart = await retrieveExpandedCart(event, cartId)
            const existingItem = (currentCart.items ?? []).find((item) => item.variant_id === variant_id)
            const nextItems = existingItem
                ? (currentCart.items ?? []).map((item) =>
                    item.id === existingItem.id
                        ? { ...item, quantity: Number(item.quantity ?? 0) + quantity }
                        : item
                )
                : [...(currentCart.items ?? []), { id: `pending-${variant_id}`, variant_id, quantity }]

            const recoveredCart = await recoverPoisonedCart({
                event,
                currentCart,
                nextItems,
                countryCode,
                emptyMessage: "Your previous checkout payment session could not be cleared, so we started a fresh cart and added this item again.",
                preservedMessage: "Your previous checkout payment session could not be cleared, so we moved your cart into a fresh cart and kept this item update."
            })

            if (recoveredCart) {
                return recoveredCart
            }
        }

        throw toUpstreamError(error, "Failed to update cart")
    }
})
