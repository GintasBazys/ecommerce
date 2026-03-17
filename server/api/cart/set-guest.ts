import type { FetchError } from "ofetch"

interface GuestBody {
    email: string
    first_name: string
    last_name: string
    phone?: string
}

export default defineEventHandler(async (event) => {
    const body = await readBody<GuestBody>(event)

    const cookies = parseCookies(event)
    const cartId = cookies.cart_id || cookies.cartId
    if (!cartId) {
        throw createError({ statusCode: 400, statusMessage: "Cart ID not found in cookies" })
    }

    const config = useRuntimeConfig()

    try {
        return await $fetch(`${config.public.MEDUSA_URL}/store/carts/${cartId}`, {
            method: "POST",
            headers: {
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                "Content-Type": "application/json"
            },
            body: {
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
            }
        })
    } catch (error: unknown) {
        const err = error as FetchError
        throw createError({ statusCode: err.statusCode || 500, statusMessage: err.message })
    }
})
