import { createCartForRegion, retrieveExpandedCart, syncCartCountry } from "#server/utils/cart"
import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"

type CartWithItems = {
    id: string
    region_id?: string | null
    items?: Array<{ id: string }> | null
}

type ErrorWithStatusMessage = {
    statusMessage?: string
}

function isPaymentSessionDeletionError(error: unknown): error is ErrorWithStatusMessage {
    return typeof error === "object"
        && error !== null
        && "statusMessage" in error
        && typeof (error as ErrorWithStatusMessage).statusMessage === "string"
        && (error as ErrorWithStatusMessage).statusMessage!.toLowerCase().includes("delete payment sessions")
}

export default defineEventHandler(async (event) => {
    const cartId = getRouterParam(event, "cartId")
    const lineItemId = getRouterParam(event, "lineItemId")
    const countryCode = getCookie(event, "country_code") || null
    let currentCart: CartWithItems | null = null

    if (!cartId || !lineItemId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Missing required parameters: cartId and lineItemId"
        })
    }

    try {
        currentCart = await retrieveExpandedCart(event, cartId) as CartWithItems

        await fetchMedusaJson(event, `/store/carts/${cartId}/line-items/${lineItemId}`, {
            method: "DELETE"
        })

        const updatedCart = await retrieveExpandedCart(event, cartId)

        return {
            success: true,
            cart: await syncCartCountry(event, updatedCart, countryCode)
        }
    } catch (error: unknown) {
        if (isPaymentSessionDeletionError(error)) {
            currentCart = currentCart ?? await retrieveExpandedCart(event, cartId) as CartWithItems
            const isRemovingLastItem = (currentCart.items?.length ?? 0) <= 1

            if (isRemovingLastItem && currentCart.region_id) {
                const replacementCart = await createCartForRegion(event, currentCart.region_id, countryCode)
                setCookie(event, "cart_id", replacementCart.id, {
                    path: "/",
                    sameSite: "lax",
                    secure: process.env.NODE_ENV === "production"
                })

                return {
                    success: true,
                    cart: replacementCart,
                    recovered: true,
                    recoveryMessage: "Your previous checkout payment session could not be cleared, so we started a fresh cart for you."
                }
            }
        }

        throw toUpstreamError(error, "Failed to remove item from cart")
    }
})
