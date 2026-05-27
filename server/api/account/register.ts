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
import { verifyTurnstileToken } from "#server/utils/turnstile"
import { canTrackServerAnalytics, useServerPostHog } from "../../utils/posthog"

type RegisterBody = {
    email?: string
    password?: string
    first_name?: string
    last_name?: string
    turnstileToken?: string
}

type AuthTokenResponse = {
    token?: string
}

type CustomerResponse = {
    customer?: CustomerDTO | null
}

const ALLOWED_TURNSTILE_ACTIONS = new Set(["register", "test"])

function toTrimmedString(value: unknown): string {
    return typeof value === "string" ? value.trim() : ""
}

export default defineEventHandler(async (event) => {
    const body = await readBody<RegisterBody>(event)

    const email = toTrimmedString(body?.email)
    const password = toTrimmedString(body?.password)
    const firstName = toTrimmedString(body?.first_name)
    const lastName = toTrimmedString(body?.last_name)
    const turnstileToken = toTrimmedString(body?.turnstileToken)

    if (!email || !password || !firstName || !lastName) {
        throw createError({ statusCode: 400, statusMessage: "Missing registration fields" })
    }

    if (!turnstileToken) {
        throw createError({ statusCode: 400, statusMessage: "Security verification is required" })
    }

    try {
        await verifyTurnstileToken(event, turnstileToken, ALLOWED_TURNSTILE_ACTIONS)

        await fetchMedusaJson(event, "/store/customers", {
            method: "POST",
            body: JSON.stringify({
                email,
                password,
                first_name: firstName,
                last_name: lastName
            })
        })

        const tokenData = await fetchMedusaJson<AuthTokenResponse>(event, "/auth/customer/emailpass", {
            method: "POST",
            includePublishableKey: false,
            body: JSON.stringify({ email, password })
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

        if (distinctId && canTrackServerAnalytics(event)) {
            const posthog = useServerPostHog()
            posthog?.capture({
                distinctId,
                event: "server_user_registered",
                properties: {
                    $session_id: sessionId,
                    email
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
