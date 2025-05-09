import type { FetchError } from "ofetch"
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

    const cookies = parseCookies(event)
    const cartId = cookies.cart_id || cookies.cartId
    if (!cartId) {
        throw createError({ statusCode: 400, statusMessage: "Cart ID not found in cookies or request" })
    }

    const config = useRuntimeConfig()

    try {
        const medusaResponse = await $fetch(`${config.public.MEDUSA_URL}/store/carts/${cartId}`, {
            method: "POST",
            headers: {
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                "Content-Type": "application/json"
            },
            body: {
                billing_address,
                ...(shipping_address ? { shipping_address } : {})
            }
        })

        return medusaResponse
    } catch (error: unknown) {
        const err = error as FetchError
        console.error("Medusa cart update failed:", error)
        throw createError({ statusCode: err.statusCode || 500, statusMessage: err.message })
    }
})
