import { assertCartOwnership } from "#server/utils/cart"
import { fetchMedusaJson } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    const { cart_id: cartId, option_id: optionId } = await readBody<{
        cart_id?: string
        option_id?: string
    }>(event)

    if (!cartId || !optionId) {
        throw createError({
            statusCode: 400,
            statusMessage: "`cart_id` and `option_id` are required"
        })
    }

    const trustedCartId = assertCartOwnership(event, cartId)

    return fetchMedusaJson(
        event,
        `/store/carts/${trustedCartId}/shipping-methods`,
        {
            method: "POST",
            body: JSON.stringify({ option_id: optionId })
        },
        "Could not update the shipping method."
    )
})
