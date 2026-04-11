import type { CustomerDTO } from "@medusajs/types"

import {
    assertMedusaResponse,
    fetchMedusaJson,
    fetchMedusaResponse,
    forwardSetCookies,
    getIncomingCookie,
    getSetCookieHeaders,
    mergeCookieHeader,
    toUpstreamError
} from "#server/utils/medusa-proxy"

type LoginBody = {
    email?: string
    password?: string
}

type AuthTokenResponse = {
    token?: string
}

type CustomerResponse = {
    customer?: CustomerDTO | null
}

export default defineEventHandler(async (event) => {
    const body = await readBody<LoginBody>(event)

    if (!body?.email || !body?.password) {
        throw createError({ statusCode: 400, statusMessage: "Email and password are required" })
    }

    try {
        const tokenData = await fetchMedusaJson<AuthTokenResponse>(event, "/auth/customer/emailpass", {
            method: "POST",
            includePublishableKey: false,
            body: JSON.stringify({ email: body.email, password: body.password })
        })

        if (!tokenData.token) {
            throw createError({ statusCode: 401, statusMessage: "Invalid credentials" })
        }

        const incomingCookie = getIncomingCookie(event)
        const sessionResponse = await fetchMedusaResponse(event, "/auth/session", {
            method: "POST",
            includePublishableKey: false,
            cookie: incomingCookie,
            headers: {
                Authorization: `Bearer ${tokenData.token}`
            }
        })

        const setCookieHeaders = getSetCookieHeaders(sessionResponse)
        forwardSetCookies(event, setCookieHeaders)
        await assertMedusaResponse(sessionResponse, "Could not start session")

        const customerData = await fetchMedusaJson<CustomerResponse>(event, "/store/customers/me", {
            method: "GET",
            cookie: mergeCookieHeader(incomingCookie, setCookieHeaders)
        })

        return {
            success: true,
            customer: customerData.customer ?? null
        }
    } catch (error: unknown) {
        throw toUpstreamError(error, "Login failed")
    }
})
