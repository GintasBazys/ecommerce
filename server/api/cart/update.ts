import { assertCartOwnership, getSessionCartId, retrieveExpandedCart } from "#server/utils/cart"
import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"

interface Address {
    first_name: string
    last_name: string
    address_1: string
    address_2?: string
    city: string
    province?: string
    postal_code: string
    country_code: string
    phone?: string
}

interface UpdateCartRequestBody {
    billing_address: Address
    shipping_address?: Address
}

export default defineEventHandler(async (event) => {
    const body = await readBody<UpdateCartRequestBody>(event)
    const { billing_address, shipping_address } = body

    const cartId = getSessionCartId(event)
    if (!cartId) {
        throw createError({ statusCode: 400, statusMessage: "Cart ID not found in cookies or request" })
    }

    const trustedCartId = assertCartOwnership(event, cartId)

    try {
        await fetchMedusaJson(
            event,
            `/store/carts/${trustedCartId}`,
            {
                method: "POST",
                body: JSON.stringify({
                    billing_address,
                    ...(shipping_address ? { shipping_address } : {})
                })
            },
            "Could not update this cart."
        )

        return {
            cart: await retrieveExpandedCart(event, trustedCartId)
        }
    } catch (error: unknown) {
        throw toUpstreamError(error, "Failed to update cart")
    }
})
