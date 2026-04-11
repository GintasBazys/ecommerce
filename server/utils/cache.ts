import type { H3Event } from "h3"

export function getQueryCacheKey(event: H3Event, prefix: string) {
    const query = getQuery(event)
    const searchParams = new URLSearchParams()

    for (const [key, rawValue] of Object.entries(query).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))) {
        if (Array.isArray(rawValue)) {
            for (const value of rawValue.map(String).sort()) {
                searchParams.append(key, value)
            }
            continue
        }

        if (rawValue !== undefined) {
            searchParams.set(key, String(rawValue))
        }
    }

    return `${prefix}:${searchParams.toString()}`
}
