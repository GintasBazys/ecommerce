import { retrieveExpandedCart, syncCartCountry } from "#server/utils/cart"
import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"

type CreateLineItemBody = {
    cartId?: string
    variant_id?: string
    quantity?: number
}

export default defineEventHandler(async (event) => {
    const body = await readBody<CreateLineItemBody>(event)
    const { cartId, variant_id, quantity } = body

    if (!cartId || !variant_id || typeof quantity !== "number" || quantity <= 0) {
        throw createError({ statusCode: 400, statusMessage: "cartId, variant_id, and a positive quantity are required" })
    }

    const countryCode = getCookie(event, "country_code") || null
    try {
        await fetchMedusaJson(event, `/store/carts/${cartId}/line-items`, {
            method: "POST",
            body: JSON.stringify({ variant_id, quantity })
        })

        const updatedCart = await retrieveExpandedCart(event, cartId)

        return {
            success: true,
            cart: await syncCartCountry(event, updatedCart, countryCode)
        }
    } catch (error: unknown) {
        throw toUpstreamError(error, "Failed to update cart")
    }
})
