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

type TurnstileVerificationResponse = {
    success: boolean
    action?: string
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
        throw createError({ statusCode: 400, statusMessage: "Verification is required" })
    }

    try {
        const runtimeConfig = useRuntimeConfig(event)
        const turnstileSecretKey =
            (typeof runtimeConfig.turnstileSecretKey === "string" ? runtimeConfig.turnstileSecretKey : "") ||
            process.env.NUXT_TURNSTILE_SECRET_KEY ||
            process.env.TURNSTILE_SECRET_KEY ||
            ""

        if (!turnstileSecretKey) {
            throw createError({
                statusCode: 500,
                statusMessage: "Turnstile secret key is missing. Set NUXT_TURNSTILE_SECRET_KEY and restart the Nuxt server."
            })
        }

        const remoteIp =
            getHeader(event, "cf-connecting-ip") ||
            getHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() ||
            getRequestIP(event, { xForwardedFor: true }) ||
            undefined

        const verificationBody = new URLSearchParams({
            secret: turnstileSecretKey,
            response: turnstileToken
        })

        if (remoteIp) {
            verificationBody.set("remoteip", remoteIp)
        }

        const verificationResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            body: verificationBody
        })

        if (!verificationResponse.ok) {
            throw createError({ statusCode: 502, statusMessage: "Verification failed" })
        }

        const verificationResult = (await verificationResponse.json()) as TurnstileVerificationResponse

        if (!verificationResult.success || (verificationResult.action && !ALLOWED_TURNSTILE_ACTIONS.has(verificationResult.action))) {
            throw createError({ statusCode: 400, statusMessage: "Verification failed" })
        }

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
