export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)

    const regionId = String(query.region_id || "")
    if (!regionId) {
        throw createError({ statusCode: 400, statusMessage: "Region ID is required" })
    }

    const forceNew = query.force_new === "1"
    const cartId = forceNew ? null : getCookie(event, "cart_id") || null

    const cookieOptions = { path: "/", sameSite: "lax" as const, secure: process.env.NODE_ENV === "production" }

    if (!cartId) {
        const medusaRes = await fetch(`${config.public.MEDUSA_URL}/store/carts`, {
            method: "POST",
            headers: {
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                "Content-Type": "application/json",
                cookie: getHeader(event, "cookie") ?? ""
            },
            body: JSON.stringify({ region_id: regionId })
        })

        const data = await medusaRes.json()
        const cart = data.cart ?? data

        setCookie(event, "cart_id", cart.id, cookieOptions)

        return { cart, regionId }
    }

    const medusaRes = await fetch(`${config.public.MEDUSA_URL}/store/carts/${cartId}?fields=*items`, {
        method: "GET",
        headers: {
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
            "Content-Type": "application/json",
            cookie: getHeader(event, "cookie") ?? ""
        }
    })

    if (!medusaRes.ok) {
        setCookie(event, "cart_id", "", { ...cookieOptions, maxAge: 0 })
        const createRes = await fetch(`${config.public.MEDUSA_URL}/store/carts`, {
            method: "POST",
            headers: {
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                "Content-Type": "application/json",
                cookie: getHeader(event, "cookie") ?? ""
            },
            body: JSON.stringify({ region_id: regionId })
        })
        const data = await createRes.json()
        const cart = data.cart ?? data
        setCookie(event, "cart_id", cart.id, cookieOptions)
        return { cart, regionId }
    }

    const data = await medusaRes.json()
    return { cart: data.cart ?? data, regionId }
})