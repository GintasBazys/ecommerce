import type { H3Event } from "h3"
import type { AppLocale } from "~~/shared/route-slugs"

export {
    DEFAULT_LOCALE,
    NON_DEFAULT_LOCALES,
    SUPPORTED_LOCALES,
    canonicalizePath,
    expandLocalizedPaths,
    getCanonicalRouteParam,
    getPathLocale,
    localizePath,
    localizeRoutePatternPath,
    normalizeLocale,
    stripLocalePrefix,
    type AppLocale,
    type RouteSlugKey
} from "~~/shared/route-slugs"

import { DEFAULT_LOCALE, getPathLocale, normalizeLocale } from "~~/shared/route-slugs"

export const LOCALE_COOKIE_NAME = "locale"

const MEDUSA_LOCALES: Record<AppLocale, string> = {
    en: "en-US",
    lt: "lt-LT"
}

export function getRequestLocale(event: H3Event): AppLocale {
    return getPathLocale(getRequestURL(event).pathname) ?? normalizeLocale(getCookie(event, LOCALE_COOKIE_NAME)) ?? DEFAULT_LOCALE
}

export function getMedusaLocale(locale: AppLocale): string {
    return MEDUSA_LOCALES[locale]
}

export function getRequestMedusaLocale(event: H3Event, locale?: unknown): string {
    return getMedusaLocale(normalizeLocale(locale) ?? getRequestLocale(event))
}
