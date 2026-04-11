import { retrieveExpandedCart, syncCartCountry } from "#server/utils/cart"
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

    try {
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
        throw toUpstreamError(error, "Unable to update line item")
    }
})
