import { assertCartOwnership, getSessionCartId } from "#server/utils/cart"
import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"

interface GuestBody {
    email: string
    first_name: string
    last_name: string
    phone?: string
}

export default defineEventHandler(async (event) => {
    const body = await readBody<GuestBody>(event)

    const cartId = getSessionCartId(event)
    if (!cartId) {
        throw createError({ statusCode: 400, statusMessage: "Cart ID not found in cookies" })
    }

    const trustedCartId = assertCartOwnership(event, cartId)

    try {
        return await fetchMedusaJson(
            event,
            `/store/carts/${trustedCartId}`,
            {
                method: "POST",
                body: JSON.stringify({
                    email: body.email,
                    additional_data: {
                        guest: {
                            first_name: body.first_name,
                            last_name: body.last_name,
                            phone: body.phone || ""
                        }
                    },
                    metadata: {
                        guest: {
                            first_name: body.first_name,
                            last_name: body.last_name,
                            phone: body.phone || ""
                        }
                    }
                })
            },
            "Could not update this cart."
        )
    } catch (error: unknown) {
        throw toUpstreamError(error, "Could not update this cart.")
    }
})
