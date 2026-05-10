export const COOKIE_CONSENT_COOKIE_KEY = "cookie_consent"

export type CookieConsentStatus = "accepted" | "declined"

const cookieConsentOptions = {
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 180
}

export function useCookieConsent() {
    const consentCookie = useCookie<CookieConsentStatus | null>(COOKIE_CONSENT_COOKIE_KEY, cookieConsentOptions)
    const isBannerOpen = useState<boolean>("cookie-consent-banner-open", () => false)

    const status = computed<CookieConsentStatus | null>(() => consentCookie.value ?? null)
    const hasAnswered = computed<boolean>(() => status.value !== null)
    const analyticsAllowed = computed<boolean>(() => status.value === "accepted")
    const isBannerVisible = computed<boolean>(() => isBannerOpen.value || !hasAnswered.value)

    function accept(): void {
        consentCookie.value = "accepted"
        isBannerOpen.value = false
    }

    function decline(): void {
        consentCookie.value = "declined"
        isBannerOpen.value = false
    }

    function openBanner(): void {
        isBannerOpen.value = true
    }

    return {
        status,
        hasAnswered,
        analyticsAllowed,
        isBannerVisible,
        accept,
        decline,
        openBanner
    }
}
