import { assertCartOwnership } from "#server/utils/cart"
import { fetchMedusaJson } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        cartId: string
        promo_codes: string[]
    }>(event)

    const { cartId, promo_codes } = body

    if (!cartId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Missing cartId"
        })
    }
    if (!promo_codes || promo_codes.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: "Missing promo_codes array"
        })
    }

    const trustedCartId = assertCartOwnership(event, cartId)

    await fetchMedusaJson(
        event,
        `/store/carts/${trustedCartId}/promotions`,
        {
            method: "DELETE",
            body: JSON.stringify({ promo_codes })
        },
        "Could not remove this promotion."
    )

    return { success: true }
})
