import type { LocationItem } from "~/types/navigation"
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, normalizeLocale, type AppLocale } from "~/utils/locale"

export const useLocaleStore = defineStore("localeStore", () => {
    const cookieOptions = {
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365
    }

    const localeCookie = useCookie<AppLocale>(LOCALE_COOKIE_NAME, cookieOptions)
    const currentLocale = ref<AppLocale>(normalizeLocale(localeCookie.value) ?? DEFAULT_LOCALE)

    const languageLabel = computed<string>(() => (currentLocale.value === "lt" ? "Kalba" : "Language"))

    const languageItems = computed<LocationItem[]>(() => [
        { title: "EN", value: "en" },
        { title: "LT", value: "lt" }
    ])

    function setLocale(locale: AppLocale): void {
        currentLocale.value = locale
        localeCookie.value = locale
    }

    return { currentLocale, languageLabel, languageItems, setLocale }
})
