import enMessages from "../messages/en.json"
import ltMessages from "../messages/lt.json"

export const DEFAULT_LOCALE = "en"
export const SUPPORTED_LOCALES = ["en", "lt"] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]
export const NON_DEFAULT_LOCALES = SUPPORTED_LOCALES.filter(
    (locale): locale is Exclude<AppLocale, typeof DEFAULT_LOCALE> => locale !== DEFAULT_LOCALE
)

type RouteMessages = typeof enMessages.routes
export type RouteSlugKey = keyof RouteMessages

type SplitPath = {
    pathname: string
    suffix: string
}

const messagesByLocale: Record<AppLocale, RouteMessages> = {
    en: enMessages.routes,
    lt: ltMessages.routes
}

const accountChildKeys = new Set<RouteSlugKey>(["profile", "wishlist", "address", "orders"])
const dynamicParentKeys = new Set<RouteSlugKey>(["product", "blog", "orderStatus", "orders"])

function isSupportedLocale(value: unknown): value is AppLocale {
    return typeof value === "string" && SUPPORTED_LOCALES.includes(value as AppLocale)
}

export function normalizeLocale(value: unknown): AppLocale | null {
    if (typeof value !== "string") {
        return null
    }

    const normalized = value.trim().toLowerCase()
    return isSupportedLocale(normalized) ? normalized : null
}

function splitPath(path: string): SplitPath {
    const suffixIndex = path.search(/[?#]/)

    if (suffixIndex === -1) {
        return { pathname: path || "/", suffix: "" }
    }

    return {
        pathname: path.slice(0, suffixIndex) || "/",
        suffix: path.slice(suffixIndex)
    }
}

function isExternalPath(path: string): boolean {
    return /^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(path) || /^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith("#")
}

function splitSegments(pathname: string): string[] {
    return pathname.split("/").filter(Boolean)
}

function joinSegments(segments: string[]): string {
    return segments.length ? `/${segments.join("/")}` : "/"
}

function isRouteToken(segment: string): boolean {
    return segment.startsWith(":") || segment === "*" || segment === "**"
}

function getSlugKey(segment: string, locale: AppLocale): RouteSlugKey | null {
    const entry = Object.entries(messagesByLocale[locale]).find(([, slug]) => slug === segment)
    return entry ? (entry[0] as RouteSlugKey) : null
}

function getDefaultSlugKey(segment: string): RouteSlugKey | null {
    return getSlugKey(segment, DEFAULT_LOCALE)
}

function getCanonicalSlugKey(segment: string, locale: AppLocale): RouteSlugKey | null {
    return getSlugKey(segment, locale) ?? getDefaultSlugKey(segment)
}

function isAllProductsSegment(segment: string, locale: AppLocale): boolean {
    return segment === messagesByLocale[locale].allProducts || segment === messagesByLocale[DEFAULT_LOCALE].allProducts
}

function canonicalizeStaticSegment(segment: string, locale: AppLocale): string {
    if (isRouteToken(segment)) {
        return segment
    }

    const key = getCanonicalSlugKey(segment, locale)
    return key ? messagesByLocale[DEFAULT_LOCALE][key] : segment
}

function isDynamicSegment(segment: string, previousKey: RouteSlugKey | null, locale: AppLocale): boolean {
    if (!previousKey) {
        return false
    }

    if (dynamicParentKeys.has(previousKey)) {
        return true
    }

    return previousKey === "category" && !isAllProductsSegment(segment, locale)
}

function translateCanonicalSegments(segments: string[], locale: AppLocale): string[] {
    const result: string[] = []

    for (let index = 0; index < segments.length; index += 1) {
        const segment = segments[index] ?? ""
        const previousKey = getDefaultSlugKey(segments[index - 1] ?? "")

        if (isDynamicSegment(segment, previousKey, DEFAULT_LOCALE)) {
            result.push(segment)
            continue
        }

        const key = getDefaultSlugKey(segment)
        if (key && (index === 0 || previousKey === "account" || previousKey === "category" || accountChildKeys.has(key))) {
            result.push(messagesByLocale[locale][key])
            continue
        }

        result.push(segment)
    }

    return result
}

function canonicalizeSegments(segments: string[], locale: AppLocale): string[] {
    const result: string[] = []

    for (let index = 0; index < segments.length; index += 1) {
        const segment = segments[index] ?? ""
        const previousKey = getDefaultSlugKey(result[index - 1] ?? "")

        if (isDynamicSegment(segment, previousKey, locale)) {
            result.push(segment)
            continue
        }

        result.push(canonicalizeStaticSegment(segment, locale))
    }

    return result
}

export function getPathLocale(path: string): AppLocale | null {
    if (isExternalPath(path)) {
        return null
    }

    const { pathname } = splitPath(path)
    const segment = splitSegments(pathname)[0]
    return normalizeLocale(segment)
}

export function stripLocalePrefix(path: string): string {
    if (isExternalPath(path)) {
        return path
    }

    const { pathname, suffix } = splitPath(path)
    const locale = getPathLocale(path)
    const segments = splitSegments(pathname)

    if (locale) {
        segments.shift()
    }

    return `${joinSegments(segments)}${suffix}`
}

export function canonicalizePath(path: string): string {
    if (isExternalPath(path)) {
        return path
    }

    const { pathname, suffix } = splitPath(path)
    const locale = getPathLocale(path) ?? DEFAULT_LOCALE
    const segments = splitSegments(pathname)

    if (locale && segments[0] === locale) {
        segments.shift()
    }

    return `${joinSegments(canonicalizeSegments(segments, locale))}${suffix}`
}

export function localizePath(path: string, locale: AppLocale): string {
    if (isExternalPath(path)) {
        return path
    }

    const { pathname, suffix } = splitPath(canonicalizePath(path))
    const localizedPath = joinSegments(translateCanonicalSegments(splitSegments(pathname), locale))

    if (locale === DEFAULT_LOCALE) {
        return `${localizedPath}${suffix}`
    }

    return `/${locale}${localizedPath === "/" ? "" : localizedPath}${suffix}`
}

export function localizeRoutePatternPath(path: string, locale: AppLocale): string {
    return localizePath(path, locale)
}

export function getCanonicalRouteParam(
    value: unknown,
    options: { parentKey?: RouteSlugKey; locale?: AppLocale } = {}
): string {
    const rawValue = Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").join("/") : value

    if (typeof rawValue !== "string") {
        return ""
    }

    const segment = rawValue.trim()
    if (!segment) {
        return ""
    }

    if (options.parentKey === "category" && isAllProductsSegment(segment, options.locale ?? DEFAULT_LOCALE)) {
        return messagesByLocale[DEFAULT_LOCALE].allProducts
    }

    return segment
}

export function getCanonicalRouteName(name: unknown): string {
    if (typeof name !== "string") {
        return ""
    }

    const localePrefix = NON_DEFAULT_LOCALES.find((locale) => name.startsWith(`${locale}-`))
    return localePrefix ? name.slice(localePrefix.length + 1) : name
}

export function expandLocalizedPaths(path: string): string[] {
    return SUPPORTED_LOCALES.map((locale) => localizePath(path, locale))
}
