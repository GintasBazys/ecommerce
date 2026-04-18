import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"
import { normalizeBlogCategory, type StoreBlogCategoriesResponse } from "#server/utils/blog"

function parsePositiveInteger(value: unknown, fallbackValue: number) {
    const parsedValue = Number(value)

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
        return fallbackValue
    }

    return Math.floor(parsedValue)
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const limit = parsePositiveInteger(query.limit, 100)
    const offset = parsePositiveInteger(query.offset, 0)
    const searchParams = new URLSearchParams({
        limit: String(limit),
        offset: String(offset)
    })

    try {
        const payload = await fetchMedusaJson<StoreBlogCategoriesResponse>(event, `/store/blog/categories?${searchParams.toString()}`, {
            method: "GET"
        })

        setHeader(event, "Cache-Control", "no-store")

        return {
            categories: (payload.categories || [])
                .map(normalizeBlogCategory)
                .filter((category): category is NonNullable<typeof category> => Boolean(category)),
            count: payload.count ?? 0,
            limit: payload.limit ?? limit,
            offset: payload.offset ?? offset
        }
    } catch (error: unknown) {
        setHeader(event, "Cache-Control", "no-store")
        throw toUpstreamError(error, "Failed to fetch blog categories")
    }
})
