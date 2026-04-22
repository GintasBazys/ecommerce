import type { HttpTypes, ProductCategoryDTO } from "@medusajs/types"
import type { H3Event } from "h3"

import { fetchMedusaJson } from "#server/utils/medusa-proxy"
import type { StoreBlogPostsResponse } from "#server/utils/blog"
import { fetchAllStoreProducts } from "#server/utils/products"

type SitemapProduct = Pick<HttpTypes.StoreProduct, "handle" | "updated_at">
type SitemapCategory = Pick<ProductCategoryDTO, "handle" | "updated_at">

type SitemapEntry = {
    loc: string
    lastmod?: string
}

function toLastmod(value: string | Date | null | undefined): string | undefined {
    if (!value) {
        return undefined
    }

    return value instanceof Date ? value.toISOString() : value
}

async function fetchBlogPosts(event: H3Event) {
    const firstPage = await fetchMedusaJson<StoreBlogPostsResponse>(event, "/store/blog/posts?limit=100&offset=0", {
        method: "GET"
    })

    const posts = Array.isArray(firstPage.posts) ? [...firstPage.posts] : []
    const count = Number(firstPage.count ?? posts.length)

    for (let offset = posts.length; offset < count; offset += 100) {
        const page = await fetchMedusaJson<StoreBlogPostsResponse>(event, `/store/blog/posts?limit=100&offset=${offset}`, {
            method: "GET"
        })

        if (!Array.isArray(page.posts) || !page.posts.length) {
            break
        }

        posts.push(...page.posts)
    }

    return posts
}

export default defineSitemapEventHandler(async (event) => {
    const searchParams = new URLSearchParams({
        fields: "handle,updated_at",
        order: "handle"
    })

    const [{ products }, { product_categories }, blogPosts] = await Promise.all([
        fetchAllStoreProducts<SitemapProduct>(event, searchParams),
        fetchMedusaJson<{ product_categories: SitemapCategory[] }>(
            event,
            "/store/product-categories?fields=handle,updated_at&limit=500&offset=0",
            {
                method: "GET"
            }
        ),
        fetchBlogPosts(event)
    ])

    const productEntries: SitemapEntry[] = products
        .filter(
            (product): product is SitemapProduct & { handle: string } => typeof product.handle === "string" && product.handle.length > 0
        )
        .map((product) => ({
            loc: `/product/${product.handle}`,
            lastmod: toLastmod(product.updated_at)
        }))

    const categoryEntries: SitemapEntry[] = (product_categories || [])
        .filter(
            (category): category is SitemapCategory & { handle: string } =>
                typeof category.handle === "string" && category.handle.length > 0
        )
        .map((category) => ({
            loc: `/category/${category.handle}`,
            lastmod: toLastmod(category.updated_at)
        }))

    const blogEntries: SitemapEntry[] = blogPosts
        .filter((post): post is { slug: string; updated_at?: string | null; published_at?: string | null; created_at?: string | null } => {
            return typeof post?.slug === "string" && post.slug.length > 0
        })
        .map((post) => ({
            loc: `/blog/${post.slug}`,
            lastmod: toLastmod(post.updated_at ?? post.published_at ?? post.created_at)
        }))

    const entries: SitemapEntry[] = [{ loc: "/category/all-products" }, ...categoryEntries, ...productEntries, ...blogEntries]

    const dedupedEntries = new Map<string, SitemapEntry>()

    for (const entry of entries) {
        dedupedEntries.set(entry.loc, entry)
    }

    return [...dedupedEntries.values()]
})
