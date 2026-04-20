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
import { useServerPostHog } from "../../utils/posthog"

type RegisterBody = {
    email?: string
    password?: string
    first_name?: string
    last_name?: string
}

type AuthTokenResponse = {
    token?: string
}

type CustomerResponse = {
    customer?: CustomerDTO | null
}

export default defineEventHandler(async (event) => {
    const body = await readBody<RegisterBody>(event)

    if (!body?.email || !body?.password || !body?.first_name || !body?.last_name) {
        throw createError({ statusCode: 400, statusMessage: "Missing registration fields" })
    }

    try {
        await fetchMedusaJson(event, "/store/customers", {
            method: "POST",
            body: JSON.stringify({
                email: body.email,
                password: body.password,
                first_name: body.first_name,
                last_name: body.last_name
            })
        })

        const tokenData = await fetchMedusaJson<AuthTokenResponse>(event, "/auth/customer/emailpass", {
            method: "POST",
            includePublishableKey: false,
            body: JSON.stringify({ email: body.email, password: body.password })
        })

        if (!tokenData.token) {
            throw createError({ statusCode: 401, statusMessage: "Could not login after registration" })
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

        const sessionId = getHeader(event, "x-posthog-session-id")
        const distinctId = getHeader(event, "x-posthog-distinct-id")

        if (distinctId) {
            const posthog = useServerPostHog()
            posthog.capture({
                distinctId,
                event: "server_user_registered",
                properties: {
                    $session_id: sessionId,
                    email: body.email
                }
            })
        }

        return {
            success: true,
            customer: customerData.customer ?? null
        }
    } catch (error: unknown) {
        throw toUpstreamError(error, "Registration failed")
    }
})
