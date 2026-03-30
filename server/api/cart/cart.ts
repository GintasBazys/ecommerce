import { retrieveExpandedCart, syncCartCountry } from "#server/utils/cart"

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)

    const regionId = String(query.region_id || "")
    if (!regionId) {
        throw createError({ statusCode: 400, statusMessage: "Region ID is required" })
    }

    const forceNew = query.force_new === "1"
    const cartId = forceNew ? null : getCookie(event, "cart_id") || null
    const countryCode = getCookie(event, "country_code") || null

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
        const cart = await syncCartCountry(event, config.public.MEDUSA_URL, config.public.PUBLISHABLE_KEY, data.cart ?? data, countryCode)

        setCookie(event, "cart_id", cart.id, cookieOptions)

        return { cart, regionId }
    }

    const medusaRes = await fetch(`${config.public.MEDUSA_URL}/store/carts/${cartId}?fields=%2Bitems.*,%2Bshipping_methods.*`, {
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
        const cart = await syncCartCountry(event, config.public.MEDUSA_URL, config.public.PUBLISHABLE_KEY, data.cart ?? data, countryCode)
        setCookie(event, "cart_id", cart.id, cookieOptions)
        return { cart, regionId }
    }

    const cart = await retrieveExpandedCart(event, config.public.MEDUSA_URL, config.public.PUBLISHABLE_KEY, cartId)
    return { cart: await syncCartCountry(event, config.public.MEDUSA_URL, config.public.PUBLISHABLE_KEY, cart, countryCode), regionId }
})
