export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody<{ email?: string; password?: string }>(event)

    if (!body?.email || !body?.password) {
        throw createError({ statusCode: 400, statusMessage: "Email and password are required" })
    }

    const tokenRes = await fetch(`${config.public.MEDUSA_URL}/auth/customer/emailpass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: body.email, password: body.password })
    })

    if (!tokenRes.ok) {
        const err = await safeJson(tokenRes)
        throw createError({
            statusCode: tokenRes.status,
            statusMessage: err?.message || "Invalid credentials"
        })
    }

    const tokenData = (await tokenRes.json()) as { token?: string }
    if (!tokenData.token) {
        throw createError({ statusCode: 401, statusMessage: "Invalid credentials" })
    }

    const incomingCookie = getIncomingCookie(event)

    const sessionRes = await fetch(`${config.public.MEDUSA_URL}/auth/session`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenData.token}`,
            cookie: incomingCookie
        }
    })

    const setCookies = getSetCookieHeaders(sessionRes)
    forwardSetCookies(event, setCookies)

    if (!sessionRes.ok) {
        const err = await safeJson(sessionRes)
        throw createError({
            statusCode: sessionRes.status,
            statusMessage: err?.message || "Could not start session"
        })
    }

    const mergedCookie = mergeCookieHeader(incomingCookie, setCookies)

    const meRes = await fetch(`${config.public.MEDUSA_URL}/store/customers/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
            cookie: mergedCookie
        }
    })

    if (!meRes.ok) {
        const err = await safeJson(meRes)
        throw createError({
            statusCode: meRes.status,
            statusMessage: err?.message || "Failed to fetch customer"
        })
    }

    const meData = (await meRes.json())

    return {
        success: true,
        customer: meData.customer ?? null
    }
})
