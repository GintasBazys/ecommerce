export default defineEventHandler(async (event) => {
    const { cart_id: cartId, option_id: optionId } = await readBody<{
        cart_id?: string
        option_id?: string
    }>(event)

    if (!cartId || !optionId) {
        throw createError({
            statusCode: 400,
            statusMessage: "`cart_id` and `option_id` are required"
        })
    }

    const config = useRuntimeConfig()
    const url = `${config.public.MEDUSA_URL}/store/carts/${cartId}/shipping-methods`

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ option_id: optionId })
    })

    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw createError({ statusCode: res.status, statusMessage: text })
    }

    return res.json()
})
