import { assertCartOwnership } from "#server/utils/cart"
import { fetchMedusaJson } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    const body = await readBody<{ cartId: string }>(event)

    if (!body?.cartId) {
        throw createError({ statusCode: 400, statusMessage: "cartId is required" })
    }

    const trustedCartId = assertCartOwnership(event, body.cartId)

    return await fetchMedusaJson(
        event,
        `/store/carts/${trustedCartId}/customer`,
        { method: "POST" },
        "Could not assign this customer to the cart."
    )
})
