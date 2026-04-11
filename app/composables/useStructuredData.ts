import { computed, toValue } from "vue"
import type { ComputedRef, MaybeRefOrGetter } from "vue"

type SchemaPrimitive = string | number | boolean | null

export type SchemaValue = SchemaPrimitive | SchemaObject | SchemaValue[]

export interface SchemaObject {
    [key: string]: SchemaValue | undefined
}

export interface SchemaNode extends SchemaObject {
    "@type": string
    "@id"?: string
}

type MaybeSchema = SchemaNode | null | undefined | false

export interface BreadcrumbItem {
    name: string
    path: string
}

const SCHEMA_CONTEXT = "https://schema.org"

function normalizeSiteUrl(url: string): string {
    return url.replace(/\/+$/, "")
}

function buildAbsoluteUrl(siteUrl: string, path = ""): string {
    if (!path) {
        return siteUrl
    }

    if (/^https?:\/\//.test(path)) {
        return path
    }

    return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`
}

function stripContext(schema: SchemaNode): SchemaNode {
    const { ["@context"]: _context, ...rest } = schema as SchemaNode & { "@context"?: string }
    return rest
}

export function normalizeSchemaDate(value?: string | null): string | undefined {
    if (!value) {
        return undefined
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return undefined
    }

    return date.toISOString()
}

export function useSiteIdentity(): {
    siteName: ComputedRef<string>
    siteUrl: ComputedRef<string>
    organizationId: ComputedRef<string>
    websiteId: ComputedRef<string>
    absoluteUrl: (path?: string) => string
    organizationSchema: ComputedRef<SchemaNode>
    websiteSchema: ComputedRef<SchemaNode>
} {
    const config = useRuntimeConfig()
    const requestUrl = useRequestURL()

    const siteName = computed<string>(() => {
        const configuredSiteName = config.public.SITE_NAME
        return typeof configuredSiteName === "string" && configuredSiteName.trim() ? configuredSiteName : "Ecommerce"
    })

    const siteUrl = computed<string>(() => {
        const configuredSiteUrl = config.public.SITE_URL

        if (typeof configuredSiteUrl === "string" && configuredSiteUrl.trim()) {
            return normalizeSiteUrl(configuredSiteUrl)
        }

        return normalizeSiteUrl(requestUrl.origin)
    })

    const organizationId = computed<string>(() => `${siteUrl.value}/#organization`)
    const websiteId = computed<string>(() => `${siteUrl.value}/#website`)

    const absoluteUrl = (path = ""): string => buildAbsoluteUrl(siteUrl.value, path)

    const organizationSchema = computed<SchemaNode>(() => ({
        "@type": "OnlineStore",
        "@id": organizationId.value,
        name: siteName.value,
        url: siteUrl.value,
        logo: {
            "@type": "ImageObject",
            url: absoluteUrl("/android-chrome-512x512.png")
        }
    }))

    const websiteSchema = computed<SchemaNode>(() => ({
        "@type": "WebSite",
        "@id": websiteId.value,
        name: siteName.value,
        url: siteUrl.value,
        publisher: {
            "@id": organizationId.value
        }
    }))

    return {
        siteName,
        siteUrl,
        organizationId,
        websiteId,
        absoluteUrl,
        organizationSchema,
        websiteSchema
    }
}

export function createBreadcrumbSchema(items: BreadcrumbItem[], absoluteUrl: (path?: string) => string): SchemaNode {
    return {
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: absoluteUrl(item.path)
        }))
    }
}

export function useStructuredData(schemas: MaybeRefOrGetter<MaybeSchema | MaybeSchema[]>, key = "structured-data"): void {
    const graph = computed<SchemaObject | null>(() => {
        const resolved = toValue(schemas)
        const list = (Array.isArray(resolved) ? resolved : [resolved]).filter((item): item is SchemaNode => Boolean(item))

        if (!list.length) {
            return null
        }

        return {
            "@context": SCHEMA_CONTEXT,
            "@graph": list.map(stripContext)
        }
    })

    useHead(() => ({
        script: graph.value
            ? [
                  {
                      type: "application/ld+json",
                      innerHTML: JSON.stringify(graph.value),
                      key,
                      tagPosition: "head"
                  }
              ]
            : []
    }))
}
