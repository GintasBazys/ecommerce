export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody<{ cartId: string; promoCode: string }>(event)

    if (!body.cartId || !body.promoCode) {
        throw createError({ statusCode: 400, statusMessage: "Missing cart ID or promo code" })
    }

    const headers = {
        "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
        "Content-Type": "application/json"
    }

    const response = await $fetch(`${config.public.MEDUSA_URL}/store/carts/${body.cartId}/promotions`, {
        method: "POST",
        headers,
        body: {
            promo_codes: [body.promoCode]
        }
    })

    return response
})
