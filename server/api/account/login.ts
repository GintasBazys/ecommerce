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

type LoginBody = {
    email?: string
    password?: string
    turnstileToken?: string
}

type AuthTokenResponse = {
    token?: string
}

type CustomerResponse = {
    customer?: CustomerDTO | null
}

type HandledError = {
    statusCode?: number
    status?: number
    statusMessage?: string
    message?: string
}

const ALLOWED_TURNSTILE_ACTIONS = new Set(["login", "test"])
const INVALID_CREDENTIALS_MESSAGE = "Email or password is incorrect. Please check your details and try again."

function toTrimmedString(value: unknown): string {
    return typeof value === "string" ? value.trim() : ""
}

function isInvalidCredentialsError(error: unknown): boolean {
    if (!error || typeof error !== "object") {
        return false
    }

    const handledError = error as HandledError
    const statusCode = handledError.statusCode ?? handledError.status
    const message = `${handledError.statusMessage || ""} ${handledError.message || ""}`.toLowerCase()

    return statusCode === 401 || message.includes("invalid credentials") || message.includes("unauthorized")
}

export default defineEventHandler(async (event) => {
    const body = await readBody<LoginBody>(event)

    const email = toTrimmedString(body?.email)
    const password = toTrimmedString(body?.password)
    const turnstileToken = toTrimmedString(body?.turnstileToken)

    if (!email || !password) {
        throw createError({ statusCode: 400, statusMessage: "Email and password are required" })
    }

    if (!turnstileToken) {
        throw createError({ statusCode: 400, statusMessage: "Security verification is required" })
    }

    try {
        await verifyTurnstileToken(event, turnstileToken, ALLOWED_TURNSTILE_ACTIONS)

        const tokenData = await fetchMedusaJson<AuthTokenResponse>(event, "/auth/customer/emailpass", {
            method: "POST",
            includePublishableKey: false,
            body: JSON.stringify({ email, password })
        })

        if (!tokenData.token) {
            throw createError({ statusCode: 401, statusMessage: INVALID_CREDENTIALS_MESSAGE })
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
                event: "server_user_signed_in",
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
        if (isInvalidCredentialsError(error)) {
            throw createError({ statusCode: 401, statusMessage: INVALID_CREDENTIALS_MESSAGE })
        }

        throw toUpstreamError(error, "Login failed")
    }
})
