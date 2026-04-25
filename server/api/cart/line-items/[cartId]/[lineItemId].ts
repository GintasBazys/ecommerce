import { isPoisonedPaymentSessionError, recoverPoisonedCart, retrieveExpandedCart, syncCartCountry } from "#server/utils/cart"
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

    const countryCode = getCookie(event, "country_code") || null
    let currentCart: Awaited<ReturnType<typeof retrieveExpandedCart>> | null = null

    try {
        currentCart = await retrieveExpandedCart(event, cartId)

        await fetchMedusaJson(event, `/store/carts/${cartId}/line-items/${lineItemId}`, {
            method: "DELETE"
        })

        await fetchMedusaJson(event, `/store/carts/${cartId}/line-items`, {
            method: "POST",
            body: JSON.stringify({
                variant_id,
                quantity
            })
        })

        const updatedCart = await retrieveExpandedCart(event, cartId)

        return {
            success: true,
            cart: await syncCartCountry(event, updatedCart, countryCode)
        }
    } catch (error: unknown) {
        if (isPoisonedPaymentSessionError(error)) {
            currentCart = currentCart ?? await retrieveExpandedCart(event, cartId)

            const nextItems = (currentCart.items ?? []).flatMap((item) => {
                if (item.id === lineItemId) {
                    return [{ ...item, variant_id, quantity }]
                }

                return [item]
            })

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
