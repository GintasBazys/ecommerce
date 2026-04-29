type ContactRequestBody = {
    subject?: string
    email?: string
    phone?: string
    orderNumber?: string
    message?: string
    submissionSubject?: string
    turnstileToken?: string
}

type TurnstileVerificationResponse = {
    success: boolean
    action?: string
    hostname?: string
    ["error-codes"]?: string[]
}

type FormSubmitResponse = {
    success?: string | boolean
    message?: string
}

const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/ea50e93bb59d60512a0ab63ded1f9169"
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ALLOWED_TURNSTILE_ACTIONS = new Set(["contact", "test"])

function toTrimmedString(value: unknown): string {
    return typeof value === "string" ? value.trim() : ""
}

export default defineEventHandler(async (event) => {
    const body = await readBody<ContactRequestBody>(event)

    const subject = toTrimmedString(body?.subject)
    const email = toTrimmedString(body?.email)
    const phone = toTrimmedString(body?.phone)
    const orderNumber = toTrimmedString(body?.orderNumber)
    const message = toTrimmedString(body?.message)
    const submissionSubject = toTrimmedString(body?.submissionSubject)
    const turnstileToken = toTrimmedString(body?.turnstileToken)

    if (!subject || !email || !message) {
        throw createError({ statusCode: 400, statusMessage: "Missing required contact fields" })
    }

    if (!EMAIL_PATTERN.test(email)) {
        throw createError({ statusCode: 400, statusMessage: "Invalid email address" })
    }

    if (!turnstileToken) {
        throw createError({ statusCode: 400, statusMessage: "Verification is required" })
    }

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
        console.error("Turnstile verification request failed", { status: verificationResponse.status })
        throw createError({ statusCode: 502, statusMessage: "Verification failed" })
    }

    const verificationResult = (await verificationResponse.json()) as TurnstileVerificationResponse

    if (!verificationResult.success || (verificationResult.action && !ALLOWED_TURNSTILE_ACTIONS.has(verificationResult.action))) {
        console.warn("Turnstile verification rejected contact form", {
            action: verificationResult.action,
            errors: verificationResult["error-codes"]
        })
        throw createError({ statusCode: 400, statusMessage: "Verification failed" })
    }

    const outboundBody = new FormData()
    outboundBody.append("subject", subject)
    outboundBody.append("email", email)
    outboundBody.append("phone", phone)
    outboundBody.append("orderNumber", orderNumber)
    outboundBody.append("message", message)

    if (submissionSubject) {
        outboundBody.append("_subject", submissionSubject)
    }

    const requestUrl = getRequestURL(event)
    const forwardedOrigin = getHeader(event, "origin") || requestUrl.origin
    const forwardedReferer = getHeader(event, "referer") || `${requestUrl.origin}/contact`

    const submitResponse = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: {
            Accept: "application/json",
            Origin: forwardedOrigin,
            Referer: forwardedReferer
        },
        body: outboundBody
    })

    if (!submitResponse.ok) {
        console.error("FormSubmit contact request failed", { status: submitResponse.status })
        throw createError({ statusCode: 502, statusMessage: "Could not send your message" })
    }

    const submitResult = (await submitResponse.json()) as FormSubmitResponse
    const submitSucceeded = submitResult.success === true || submitResult.success === "true"

    if (!submitSucceeded) {
        console.error("FormSubmit rejected contact submission", { message: submitResult.message })
        throw createError({ statusCode: 502, statusMessage: "Could not send your message" })
    }

    return {
        success: true,
        message:
            typeof submitResult.message === "string" && submitResult.message.trim() ? submitResult.message : "Message sent successfully."
    }
})
