import { isPoisonedPaymentSessionError, recoverPoisonedCart, retrieveExpandedCart, syncCartCountry } from "#server/utils/cart"
import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    const cartId = getRouterParam(event, "cartId")
    const lineItemId = getRouterParam(event, "lineItemId")
    const countryCode = getCookie(event, "country_code") || null
    let currentCart: Awaited<ReturnType<typeof retrieveExpandedCart>> | null = null

    if (!cartId || !lineItemId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Missing required parameters: cartId and lineItemId"
        })
    }

    try {
        currentCart = await retrieveExpandedCart(event, cartId)

        await fetchMedusaJson(event, `/store/carts/${cartId}/line-items/${lineItemId}`, {
            method: "DELETE"
        })

        const updatedCart = await retrieveExpandedCart(event, cartId)

        return {
            success: true,
            cart: await syncCartCountry(event, updatedCart, countryCode)
        }
    } catch (error: unknown) {
        if (isPoisonedPaymentSessionError(error)) {
            currentCart = currentCart ?? await retrieveExpandedCart(event, cartId)
            const nextItems = (currentCart.items ?? []).filter((item) => item.id !== lineItemId)

            const recoveredCart = await recoverPoisonedCart({
                event,
                currentCart,
                nextItems,
                countryCode,
                emptyMessage: "Your previous checkout payment session could not be cleared, so we started a fresh cart for you.",
                preservedMessage: "Your previous checkout payment session could not be cleared, so we moved your remaining items into a fresh cart."
            })

            if (recoveredCart) {
                return recoveredCart
            }
        }

        throw toUpstreamError(error, "Failed to remove item from cart")
    }
})
