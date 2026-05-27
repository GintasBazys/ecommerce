import type { H3Event } from "h3"

type TurnstileVerificationResponse = {
    success: boolean
    action?: string
}

function getTurnstileSecretKey(event: H3Event) {
    const runtimeConfig = useRuntimeConfig(event)

    return (
        (typeof runtimeConfig.turnstileSecretKey === "string" ? runtimeConfig.turnstileSecretKey : "") ||
        process.env.NUXT_TURNSTILE_SECRET_KEY ||
        process.env.TURNSTILE_SECRET_KEY ||
        ""
    )
}

function getRequestRemoteIp(event: H3Event) {
    return (
        getHeader(event, "cf-connecting-ip") ||
        getHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() ||
        getRequestIP(event, { xForwardedFor: true }) ||
        undefined
    )
}

export async function verifyTurnstileToken(event: H3Event, token: string, allowedActions: Set<string>) {
    const turnstileSecretKey = getTurnstileSecretKey(event)

    if (!turnstileSecretKey) {
        throw createError({
            statusCode: 500,
            statusMessage: "Turnstile secret key is missing. Set NUXT_TURNSTILE_SECRET_KEY and restart the Nuxt server."
        })
    }

    const verificationBody = new URLSearchParams({
        secret: turnstileSecretKey,
        response: token
    })
    const remoteIp = getRequestRemoteIp(event)

    if (remoteIp) {
        verificationBody.set("remoteip", remoteIp)
    }

    let verificationResult: TurnstileVerificationResponse

    try {
        verificationResult = await $fetch<TurnstileVerificationResponse>("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            body: verificationBody
        })
    } catch (error) {
        console.error("Turnstile verification request failed", error)
        throw createError({ statusCode: 502, statusMessage: "Security verification failed" })
    }

    if (!verificationResult.success || (verificationResult.action && !allowedActions.has(verificationResult.action))) {
        throw createError({ statusCode: 400, statusMessage: "Security verification failed" })
    }
}
