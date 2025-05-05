import { defineEventHandler, createError, readBody } from "h3"

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const { cart_id: cartId } = await readBody<{ cart_id?: string }>(event)

    if (!cartId) {
        throw createError({ statusCode: 400, statusMessage: "`cart_id` is required" })
    }

    const url = new URL(`${config.public.MEDUSA_URL}/store/shipping-options`)
    url.searchParams.set("cart_id", cartId)

    const res = await fetch(url.toString(), {
        headers: {
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
            "Content-Type": "application/json"
        },
        credentials: "include"
    })

    if (!res.ok) {
        const body = await res.text().catch(() => res.statusText)
        throw createError({ statusCode: res.status, statusMessage: body })
    }

    const { shipping_options } = await res.json()
    if (!Array.isArray(shipping_options)) {
        throw createError({ statusCode: 502, statusMessage: "Invalid response from Medusa" })
    }

    return shipping_options
})
