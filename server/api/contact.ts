import type { H3Event } from "h3"

type ContactBody = {
    subject?: string
    email?: string
    phone?: string
    orderNumber?: string
    message?: string
    turnstileToken?: string
}

type TurnstileVerificationResponse = {
    success: boolean
    action?: string
}

const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ea50e93bb59d60512a0ab63ded1f9169"
const ALLOWED_TURNSTILE_ACTIONS = new Set(["contact", "test"])
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function toTrimmedString(value: unknown, maxLength: number): string {
    if (typeof value !== "string") {
        return ""
    }

    return value.trim().slice(0, maxLength)
}

async function verifyTurnstile(event: H3Event, token: string): Promise<void> {
    const runtimeConfig = useRuntimeConfig(event)
    const turnstileSecretKey =
        (typeof runtimeConfig.turnstileSecretKey === "string" ? runtimeConfig.turnstileSecretKey : "") ||
        process.env.NUXT_TURNSTILE_SECRET_KEY ||
        process.env.TURNSTILE_SECRET_KEY ||
        ""

    if (!turnstileSecretKey) {
        throw createError({ statusCode: 500, statusMessage: "Security verification is not configured." })
    }

    const remoteIp =
        getHeader(event, "cf-connecting-ip") ||
        getHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() ||
        getRequestIP(event, { xForwardedFor: true }) ||
        undefined

    const verificationBody = new URLSearchParams({
        secret: turnstileSecretKey,
        response: token
    })

    if (remoteIp) {
        verificationBody.set("remoteip", remoteIp)
    }

    const verificationResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: verificationBody
    })

    if (!verificationResponse.ok) {
        throw createError({ statusCode: 502, statusMessage: "Security verification failed." })
    }

    const verificationResult = (await verificationResponse.json()) as TurnstileVerificationResponse

    if (!verificationResult.success || (verificationResult.action && !ALLOWED_TURNSTILE_ACTIONS.has(verificationResult.action))) {
        throw createError({ statusCode: 400, statusMessage: "Security verification failed." })
    }
}

export default defineEventHandler(async (event) => {
    const body = await readBody<ContactBody>(event)
    const subject = toTrimmedString(body?.subject, 140)
    const email = toTrimmedString(body?.email, 254)
    const phone = toTrimmedString(body?.phone, 40)
    const orderNumber = toTrimmedString(body?.orderNumber, 80)
    const message = toTrimmedString(body?.message, 4000)
    const turnstileToken = toTrimmedString(body?.turnstileToken, 2048)

    if (!subject || !email || !message) {
        throw createError({ statusCode: 400, statusMessage: "Subject, email, and message are required." })
    }

    if (!EMAIL_PATTERN.test(email)) {
        throw createError({ statusCode: 400, statusMessage: "Please enter a valid email address." })
    }

    if (!turnstileToken) {
        throw createError({ statusCode: 400, statusMessage: "Security verification is required." })
    }

    await verifyTurnstile(event, turnstileToken)

    const formBody = new URLSearchParams({
        _subject: "New contact form submission",
        subject,
        email,
        message
    })

    if (phone) {
        formBody.set("phone", phone)
    }

    if (orderNumber) {
        formBody.set("orderNumber", orderNumber)
    }

    const response = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json"
        },
        body: formBody
    })

    if (!response.ok) {
        console.error("Contact form submission failed", await response.text().catch(() => response.statusText))
        throw createError({ statusCode: 502, statusMessage: "Could not send your message. Please try again." })
    }

    return { success: true }
})
