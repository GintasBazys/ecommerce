import { assertCartOwnership, isPoisonedPaymentSessionError, recoverPoisonedCart, retrieveExpandedCart, syncCartCountry } from "#server/utils/cart"
import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"

type UpdateLineItemBody = {
    quantity?: number
    variant_id?: string
}

export default defineEventHandler(async (event) => {
    const cartId = getRouterParam(event, "cartId")
    const lineItemId = getRouterParam(event, "lineItemId")
    const body = await readBody<UpdateLineItemBody>(event)
    const { quantity, variant_id } = body

    if (!cartId || !lineItemId || !variant_id || typeof quantity !== "number" || quantity <= 0) {
        throw createError({ statusCode: 400, statusMessage: "cartId, lineItemId, variant_id, and a positive quantity are required" })
    }

    const trustedCartId = assertCartOwnership(event, cartId)

    const countryCode = getCookie(event, "country_code") || null

    try {
        await fetchMedusaJson(
            event,
            `/store/carts/${trustedCartId}/line-items/${lineItemId}`,
            { method: "DELETE" },
            "Could not update this cart."
        )

        await fetchMedusaJson(
            event,
            `/store/carts/${trustedCartId}/line-items`,
            {
                method: "POST",
                body: JSON.stringify({
                    variant_id,
                    quantity
                })
            },
            "Could not update this cart."
        )

        const updatedCart = await retrieveExpandedCart(event, trustedCartId)

        return {
            success: true,
            cart: await syncCartCountry(event, updatedCart, countryCode)
        }
    } catch (error: unknown) {
        if (isPoisonedPaymentSessionError(error)) {
            const currentCart = await retrieveExpandedCart(event, trustedCartId)
            const currentItems = currentCart.items ?? []
            const existingItem = currentItems.find((item) => item.id === lineItemId)

            const nextItems = existingItem
                ? currentItems.map((item) => item.id === lineItemId ? { ...item, variant_id, quantity } : item)
                : [...currentItems, { id: `pending-${variant_id}`, variant_id, quantity }]

            const recoveredCart = await recoverPoisonedCart({
                event,
                currentCart,
                nextItems,
                countryCode,
                emptyMessage: "Your previous checkout payment session could not be cleared, so we started a fresh cart and reapplied your quantity change.",
                preservedMessage: "Your previous checkout payment session could not be cleared, so we moved your cart into a fresh cart and reapplied your quantity change."
            })

            if (recoveredCart) {
                return recoveredCart
            }
        }

        throw toUpstreamError(error, "Unable to update line item")
    }
})
