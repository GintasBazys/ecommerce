export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    const body = await readBody<{
        cartId: string
        promo_codes: string[]
    }>(event)

    const { cartId, promo_codes } = body

    if (!cartId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Missing cartId"
        })
    }
    if (!promo_codes || promo_codes.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: "Missing promo_codes array"
        })
    }

    const headers = {
        "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
        "Content-Type": "application/json"
    }

    await $fetch(`${config.public.MEDUSA_URL}/store/carts/${cartId}/promotions`, {
        method: "DELETE",
        headers,
        body: {
            promo_codes
        }
    })

    return { success: true }
})
