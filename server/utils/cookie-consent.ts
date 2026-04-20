import type { H3Event } from "h3"

const COOKIE_CONSENT_COOKIE_KEY = "cookie_consent"

export function hasAnalyticsConsent(event: H3Event): boolean {
    return getCookie(event, COOKIE_CONSENT_COOKIE_KEY) === "accepted"
}
