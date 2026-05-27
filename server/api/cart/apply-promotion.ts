import { assertCartOwnership } from "#server/utils/cart"
import { fetchMedusaJson } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    const body = await readBody<{ cartId: string; promoCode: string }>(event)

    if (!body.cartId || !body.promoCode) {
        throw createError({ statusCode: 400, statusMessage: "Missing cart ID or promo code" })
    }

    const trustedCartId = assertCartOwnership(event, body.cartId)

    return await fetchMedusaJson(
        event,
        `/store/carts/${trustedCartId}/promotions`,
        {
            method: "POST",
            body: JSON.stringify({
                promo_codes: [body.promoCode]
            })
        },
        "Could not apply this promotion."
    )
})
