export {
    DEFAULT_LOCALE,
    NON_DEFAULT_LOCALES,
    SUPPORTED_LOCALES,
    canonicalizePath,
    expandLocalizedPaths,
    getCanonicalRouteParam,
    getCanonicalRouteName,
    getPathLocale,
    localizePath,
    localizeRoutePatternPath,
    normalizeLocale,
    stripLocalePrefix,
    type AppLocale,
    type RouteSlugKey
} from "~~/shared/route-slugs"

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, canonicalizePath, localizePath } from "~~/shared/route-slugs"

export const LOCALE_COOKIE_NAME = "locale"

export type HeadLink = {
    rel: string
    href: string
    hreflang?: string
}

export function createLocalizedAlternateLinks(path: string, absoluteUrl: (_path: string) => string): HeadLink[] {
    const canonicalPath = canonicalizePath(path)

    return [
        ...SUPPORTED_LOCALES.map((locale) => ({
            rel: "alternate",
            hreflang: locale,
            href: absoluteUrl(localizePath(canonicalPath, locale))
        })),
        { rel: "alternate", hreflang: "x-default", href: absoluteUrl(localizePath(canonicalPath, DEFAULT_LOCALE)) }
    ]
}
