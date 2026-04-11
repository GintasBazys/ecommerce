import { retrieveExpandedCart, syncCartCountry } from "#server/utils/cart"
import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    const cartId = getRouterParam(event, "cartId")
    const lineItemId = getRouterParam(event, "lineItemId")
    const countryCode = getCookie(event, "country_code") || null

    if (!cartId || !lineItemId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Missing required parameters: cartId and lineItemId"
        })
    }

    try {
        await fetchMedusaJson(event, `/store/carts/${cartId}/line-items/${lineItemId}`, {
            method: "DELETE"
        })

        const updatedCart = await retrieveExpandedCart(event, cartId)

        return {
            success: true,
            cart: await syncCartCountry(event, updatedCart, countryCode)
        }
    } catch (error: unknown) {
        throw toUpstreamError(error, "Failed to remove item from cart")
    }
})
