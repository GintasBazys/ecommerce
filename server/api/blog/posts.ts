import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"
import {
    createBlogCategoryMap,
    normalizeBlogCategory,
    normalizeBlogPostSummary,
    type StoreBlogCategoriesResponse,
    type StoreBlogPostsResponse
} from "#server/utils/blog"

function parsePositiveInteger(value: unknown, fallbackValue: number) {
    const parsedValue = Number(value)

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
        return fallbackValue
    }

    return Math.floor(parsedValue)
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const limit = parsePositiveInteger(query.limit, 9)
    const offset = parsePositiveInteger(query.offset, 0)
    const categorySlug = typeof query.category === "string" ? query.category.trim() : ""

    try {
        const categoriesPayload = await fetchMedusaJson<StoreBlogCategoriesResponse>(event, "/store/blog/categories?limit=100&offset=0", {
            method: "GET"
        })

        const categories = (categoriesPayload.categories || [])
            .map(normalizeBlogCategory)
            .filter((category): category is NonNullable<typeof category> => Boolean(category))
        const categoryMap = createBlogCategoryMap(categories)
        const selectedCategory = categorySlug ? categories.find((category) => category.slug === categorySlug) || null : null

        if (categorySlug && !selectedCategory) {
            setHeader(event, "Cache-Control", "no-store")

            return {
                posts: [],
                count: 0,
                limit,
                offset
            }
        }

        const searchParams = new URLSearchParams({
            limit: String(limit),
            offset: String(offset)
        })

        if (selectedCategory) {
            searchParams.set("category_id", selectedCategory.id)
        }

        const payload = await fetchMedusaJson<StoreBlogPostsResponse>(event, `/store/blog/posts?${searchParams.toString()}`, {
            method: "GET"
        })

        setHeader(event, "Cache-Control", "no-store")

        return {
            posts: (payload.posts || [])
                .map((post) => normalizeBlogPostSummary(post, categoryMap))
                .filter((post): post is NonNullable<typeof post> => Boolean(post)),
            count: payload.count ?? 0,
            limit: payload.limit ?? limit,
            offset: payload.offset ?? offset
        }
    } catch (error: unknown) {
        setHeader(event, "Cache-Control", "no-store")
        throw toUpstreamError(error, "Failed to fetch blog posts")
    }
})
