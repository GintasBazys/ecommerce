export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody<{ cartId: string }>(event)

    if (!body?.cartId) {
        throw createError({ statusCode: 400, statusMessage: "cartId is required" })
    }

    const res = await fetch(`${config.public.MEDUSA_URL}/store/carts/${body.cartId}/customer`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
            cookie: getHeader(event, "cookie") ?? ""
        }
    })

    if (!res.ok) {
        throw createError({ statusCode: res.status, statusMessage: await res.text() })
    }

    return await res.json()
})
