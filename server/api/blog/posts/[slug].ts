import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"
import {
    createBlogCategoryMap,
    normalizeBlogCategory,
    normalizeBlogPost,
    type StoreBlogCategoriesResponse,
    type StoreBlogPostResponse
} from "#server/utils/blog"

export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, "slug")?.trim()

    if (!slug) {
        throw createError({ statusCode: 400, statusMessage: "slug is required" })
    }

    try {
        const [categoriesPayload, payload] = await Promise.all([
            fetchMedusaJson<StoreBlogCategoriesResponse>(event, "/store/blog/categories?limit=100&offset=0", {
                method: "GET"
            }),
            fetchMedusaJson<StoreBlogPostResponse>(event, `/store/blog/posts/${encodeURIComponent(slug)}`, {
                method: "GET"
            })
        ])

        const categories = (categoriesPayload.categories || [])
            .map(normalizeBlogCategory)
            .filter((category): category is NonNullable<typeof category> => Boolean(category))
        const post = payload.post ? normalizeBlogPost(payload.post, createBlogCategoryMap(categories)) : null

        if (!post) {
            throw createError({ statusCode: 404, statusMessage: "Blog post not found" })
        }

        setHeader(event, "Cache-Control", "no-store")

        return {
            post
        }
    } catch (error: unknown) {
        setHeader(event, "Cache-Control", "no-store")
        throw toUpstreamError(error, "Failed to fetch blog post")
    }
})
