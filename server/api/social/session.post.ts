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

type SessionBody = {
    token?: string
}

type CustomerResponse = {
    customer?: CustomerDTO | null
}

export default defineEventHandler(async (event) => {
    const body = await readBody<SessionBody>(event)

    if (!body?.token) {
        throw createError({ statusCode: 400, statusMessage: "Authentication token is required" })
    }

    try {
        const incomingCookie = getIncomingCookie(event)

        const sessionResponse = await fetchMedusaResponse(event, "/auth/session", {
            method: "POST",
            includePublishableKey: false,
            cookie: incomingCookie,
            headers: {
                Authorization: `Bearer ${body.token}`
            }
        })

        const setCookieHeaders = getSetCookieHeaders(sessionResponse)
        forwardSetCookies(event, setCookieHeaders)
        await assertMedusaResponse(sessionResponse, "Could not establish authenticated session")

        const customerData = await fetchMedusaJson<CustomerResponse>(event, "/store/customers/me", {
            method: "GET",
            cookie: mergeCookieHeader(incomingCookie, setCookieHeaders)
        })

        return {
            success: true,
            customer: customerData.customer ?? null
        }
    } catch (error: unknown) {
        throw toUpstreamError(error, "Social session failed")
    }
})
