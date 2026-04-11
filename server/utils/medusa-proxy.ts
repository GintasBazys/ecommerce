import type { H3Event } from "h3"

type ErrorPayload = {
    message?: string
    error?: string
    details?: string
}

type MedusaRequestOptions = Omit<RequestInit, "headers"> & {
    headers?: HeadersInit
    includePublishableKey?: boolean
    cookie?: string
    timeoutMs?: number
}

type ErrorWithCode = {
    statusCode?: number
    statusMessage?: string
    code?: string
    name?: string
    cause?: {
        code?: string
    }
}

export function getIncomingCookie(event: H3Event) {
    return event.node.req.headers.cookie || ""
}

export function getMedusaUrl(event: H3Event, path: string) {
    const runtimeConfig = useRuntimeConfig(event)
    return `${runtimeConfig.public.MEDUSA_URL}${path}`
}

export function createMedusaHeaders(event: H3Event, options: MedusaRequestOptions = {}) {
    const runtimeConfig = useRuntimeConfig(event)
    const headers = new Headers(options.headers)

    if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json")
    }

    if (options.includePublishableKey !== false && !headers.has("x-publishable-api-key")) {
        headers.set("x-publishable-api-key", runtimeConfig.public.PUBLISHABLE_KEY)
    }

    const cookieHeader = options.cookie ?? getIncomingCookie(event)
    if (cookieHeader && !headers.has("cookie")) {
        headers.set("cookie", cookieHeader)
    }

    return headers
}

export function getSetCookieHeaders(res: Response): string[] {
    const headers = res.headers

    if (typeof headers.getSetCookie === "function") {
        const setCookieHeaders = headers.getSetCookie() as string[]
        if (setCookieHeaders?.length) {
            return setCookieHeaders
        }
    }

    const single = res.headers.get("set-cookie")
    return single ? [single] : []
}

export function mergeCookieHeader(existing: string, setCookies: string[]) {
    const cookieJar = new Map<string, string>()

    existing
        .split(";")
        .map((segment) => segment.trim())
        .filter(Boolean)
        .forEach((pair) => {
            const separatorIndex = pair.indexOf("=")
            if (separatorIndex > 0) {
                cookieJar.set(pair.slice(0, separatorIndex), pair.slice(separatorIndex + 1))
            }
        })

    for (const setCookieHeader of setCookies) {
        const cookiePair = setCookieHeader.split(";")[0]
        const separatorIndex = cookiePair?.indexOf("=")
        if (separatorIndex && cookiePair && separatorIndex > 0) {
            cookieJar.set(cookiePair.slice(0, separatorIndex), cookiePair.slice(separatorIndex + 1))
        }
    }

    return [...cookieJar.entries()].map(([key, value]) => `${key}=${value}`).join("; ")
}

export function forwardSetCookies(event: H3Event, setCookies: string[]) {
    for (const setCookieHeader of setCookies) {
        appendHeader(event, "set-cookie", setCookieHeader)
    }
}

export async function safeJson<T>(res: Response): Promise<T | null> {
    try {
        return await res.json()
    } catch {
        return null
    }
}

function isHandledError(error: unknown): error is ErrorWithCode {
    return typeof error === "object" && error !== null && ("statusCode" in error || "statusMessage" in error)
}

function getErrorMessage(payload: ErrorPayload | null, fallbackMessage: string, response: Response) {
    return payload?.message || payload?.error || payload?.details || `${fallbackMessage}: ${response.status} ${response.statusText}`
}

export function toUpstreamError(error: unknown, fallbackMessage: string) {
    if (isHandledError(error)) {
        return error
    }

    const typedError = error as ErrorWithCode
    const code = typedError.cause?.code || typedError.code

    if (code === "ECONNREFUSED" || code === "ENOTFOUND" || typedError.name === "AbortError") {
        return createError({ statusCode: 503, statusMessage: "Medusa is unavailable" })
    }

    return createError({ statusCode: 500, statusMessage: fallbackMessage })
}

export async function assertMedusaResponse(response: Response, fallbackMessage: string) {
    if (response.ok) {
        return response
    }

    const payload = await safeJson<ErrorPayload>(response)

    throw createError({
        statusCode: response.status,
        statusMessage: getErrorMessage(payload, fallbackMessage, response)
    })
}

export async function fetchMedusaResponse(event: H3Event, path: string, options: MedusaRequestOptions = {}) {
    const { timeoutMs = 8000, ...requestOptions } = options
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), timeoutMs)

    try {
        return await fetch(getMedusaUrl(event, path), {
            ...requestOptions,
            headers: createMedusaHeaders(event, options),
            signal: abortController.signal
        })
    } catch (error: unknown) {
        throw toUpstreamError(error, "Failed to reach Medusa")
    } finally {
        clearTimeout(timeoutId)
    }
}

export async function fetchMedusaJson<T>(event: H3Event, path: string, options: MedusaRequestOptions = {}) {
    const response = await fetchMedusaResponse(event, path, options)
    await assertMedusaResponse(response, "Medusa request failed")

    const payload = await safeJson<T>(response)
    if (payload === null) {
        throw createError({ statusCode: 502, statusMessage: "Invalid Medusa response" })
    }

    return payload
}
