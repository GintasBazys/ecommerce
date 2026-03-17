function getSetCookies(res: Response): string[] {
    if (typeof res.headers.getSetCookie === "function") return res.headers.getSetCookie()
    const single = res.headers.get("set-cookie")
    return single ? [single] : []
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const { cartId } = await readBody(event)

    if (!cartId) throw createError({ statusCode: 400, statusMessage: "Cart ID is required." })

    const medusaRes = await fetch(`${config.public.MEDUSA_URL}/store/carts/${cartId}/complete`, {
        method: "POST",
        headers: {
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
            "Content-Type": "application/json",
            cookie: getHeader(event, "cookie") ?? ""
        }
    })

    for (const c of getSetCookies(medusaRes)) appendHeader(event, "set-cookie", c)

    if (!medusaRes.ok) {
        const errorText = await medusaRes.text().catch(() => "")
        throw createError({ statusCode: medusaRes.status, statusMessage: `Cart completion failed: ${errorText}` })
    }

    deleteCookie(event, "cart_id", { path: "/" })

    return await medusaRes.json()
})
