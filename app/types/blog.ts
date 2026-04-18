export interface BlogCategory {
    id: string
    name: string
    slug: string
    description: string | null
}

export interface BlogPostSummary {
    id: string
    title: string
    slug: string
    excerpt: string | null
    thumbnail: string | null
    publishedAt: string | null
    author: string | null
    category: BlogCategory | null
    createdAt: string | null
    updatedAt: string | null
}

export interface BlogPost extends BlogPostSummary {
    html: string
}

export interface BlogPostsResponse {
    posts: BlogPostSummary[]
    count: number
    limit: number
    offset: number
}

export interface BlogPostResponse {
    post: BlogPost
}

export interface BlogCategoriesResponse {
    categories: BlogCategory[]
    count: number
    limit: number
    offset: number
}
