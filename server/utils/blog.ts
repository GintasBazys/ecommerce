type StoreBlogPost = {
    id?: string | null
    title?: string | null
    slug?: string | null
    excerpt?: string | null
    content_html?: string | null
    thumbnail?: string | null
    published_at?: string | null
    author_id?: string | null
    category_id?: string | null
    created_at?: string | null
    updated_at?: string | null
}

type StoreBlogCategory = {
    id?: string | null
    name?: string | null
    slug?: string | null
    description?: string | null
}

export type StoreBlogPostsResponse = {
    posts?: StoreBlogPost[]
    count?: number
    limit?: number
    offset?: number
}

export type StoreBlogPostResponse = {
    post?: StoreBlogPost | null
}

export type StoreBlogCategoriesResponse = {
    categories?: StoreBlogCategory[]
    count?: number
    limit?: number
    offset?: number
}

export type NormalizedBlogCategory = {
    id: string
    name: string
    slug: string
    description: string | null
}

export type NormalizedBlogPostSummary = {
    id: string
    title: string
    slug: string
    excerpt: string | null
    thumbnail: string | null
    publishedAt: string | null
    author: string | null
    category: NormalizedBlogCategory | null
    createdAt: string | null
    updatedAt: string | null
}

export type NormalizedBlogPost = NormalizedBlogPostSummary & {
    html: string
}

function cleanText(value: unknown) {
    if (typeof value !== "string") {
        return null
    }

    const normalizedValue = value.trim()
    return normalizedValue ? normalizedValue : null
}

function normalizeDate(value: unknown) {
    const normalizedValue = cleanText(value)
    if (!normalizedValue) {
        return null
    }

    const date = new Date(normalizedValue)
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export function normalizeBlogCategory(rawCategory: StoreBlogCategory): NormalizedBlogCategory | null {
    const id = cleanText(rawCategory.id)
    const name = cleanText(rawCategory.name)
    const slug = cleanText(rawCategory.slug)

    if (!id || !name || !slug) {
        return null
    }

    return {
        id,
        name,
        slug,
        description: cleanText(rawCategory.description)
    }
}

export function createBlogCategoryMap(categories: NormalizedBlogCategory[]) {
    return new Map(categories.map((category) => [category.id, category]))
}

export function normalizeBlogPostSummary(
    rawPost: StoreBlogPost,
    categoryMap: Map<string, NormalizedBlogCategory>
): NormalizedBlogPostSummary | null {
    const id = cleanText(rawPost.id)
    const slug = cleanText(rawPost.slug)

    if (!id || !slug) {
        return null
    }

    const title = cleanText(rawPost.title) || "Untitled article"
    const categoryId = cleanText(rawPost.category_id)

    return {
        id,
        title,
        slug,
        excerpt: cleanText(rawPost.excerpt),
        thumbnail: cleanText(rawPost.thumbnail),
        publishedAt: normalizeDate(rawPost.published_at) || normalizeDate(rawPost.created_at),
        author: null,
        category: categoryId ? categoryMap.get(categoryId) || null : null,
        createdAt: normalizeDate(rawPost.created_at),
        updatedAt: normalizeDate(rawPost.updated_at)
    }
}

export function normalizeBlogPost(rawPost: StoreBlogPost, categoryMap: Map<string, NormalizedBlogCategory>): NormalizedBlogPost | null {
    const summary = normalizeBlogPostSummary(rawPost, categoryMap)

    if (!summary) {
        return null
    }

    return {
        ...summary,
        html: cleanText(rawPost.content_html) || ""
    }
}
