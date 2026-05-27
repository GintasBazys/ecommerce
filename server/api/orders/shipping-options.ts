import { assertCartOwnership } from "#server/utils/cart"
import { fetchMedusaJson } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    const { cart_id: cartId } = await readBody<{ cart_id?: string }>(event)

    if (!cartId) {
        throw createError({ statusCode: 400, statusMessage: "`cart_id` is required" })
    }

    const trustedCartId = assertCartOwnership(event, cartId)

    const data = await fetchMedusaJson<{ shipping_options?: unknown }>(
        event,
        `/store/shipping-options?cart_id=${encodeURIComponent(trustedCartId)}`,
        { method: "GET" },
        "Could not load shipping options."
    )

    if (!Array.isArray(data.shipping_options)) {
        throw createError({ statusCode: 502, statusMessage: "Could not load shipping options." })
    }

    return data.shipping_options
})
