<script setup lang="ts">
import type { SchemaNode } from "~/composables/useStructuredData"
import type { BlogPost, BlogPostResponse, BlogPostsResponse } from "~/types/blog"

import { BLOG_HANDLE } from "~/utils/consts"
import { formatDate } from "~/utils/formatDate"

const route = useRoute()
const { organizationId, absoluteUrl } = useSiteIdentity()

const slug = computed<string>(() => {
    const routeSlug = route.params.slug

    if (Array.isArray(routeSlug)) {
        return routeSlug[routeSlug.length - 1] || ""
    }

    if (typeof routeSlug === "string") {
        return routeSlug
    }

    const parts = route.path.split("/").filter(Boolean)
    return parts[parts.length - 1] || ""
})

const { data: postResponse } = await useAsyncData(`blog-post-${slug.value}`, () =>
    $fetch<BlogPostResponse>(`/api/blog/posts/${slug.value}`)
)

const currentPost = computed<BlogPost | null>(() => postResponse.value?.post || null)

if (!currentPost.value) {
    throw createError({ statusCode: 404, statusMessage: "Blog post not found" })
}

const publishedDate = computed<string>(() => formatDate(currentPost.value?.publishedAt))

const { data: relatedPostsData } = await useAsyncData(`related-${slug.value}`, async () => {
    const primaryResponse = await $fetch<BlogPostsResponse>("/api/blog/posts", {
        query: {
            limit: 6,
            offset: 0,
            category: currentPost.value?.category?.slug || undefined
        }
    })

    const primaryPosts = primaryResponse.posts.filter((post) => post.slug !== slug.value)
    if (primaryPosts.length >= 3 || !currentPost.value?.category?.slug) {
        return primaryPosts.slice(0, 3)
    }

    const fallbackResponse = await $fetch<BlogPostsResponse>("/api/blog/posts", {
        query: {
            limit: 6,
            offset: 0
        }
    })

    const combinedPosts = [...primaryPosts]

    for (const post of fallbackResponse.posts) {
        if (post.slug === slug.value || combinedPosts.some((item) => item.id === post.id)) {
            continue
        }

        combinedPosts.push(post)
    }

    return combinedPosts.slice(0, 3)
})

const relatedPosts = computed(() => relatedPostsData.value || [])

useHead(() => ({
    title: `${currentPost.value?.title ?? "Shop"} | Ecommerce`,
    meta: [
        {
            name: "description",
            content: currentPost.value?.excerpt || "Read the latest journal post from the storefront."
        }
    ]
}))

const articleUrl = computed<string>(() => absoluteUrl(route.path))
const breadcrumbItems = computed(() => [
    { label: "Home", to: "/" },
    { label: "Blog", to: "/blog" },
    { label: currentPost.value?.title || "Article" }
])

const articleSchema = computed<SchemaNode | null>(() => {
    if (!currentPost.value?.title) {
        return null
    }

    const image = currentPost.value.thumbnail ? absoluteUrl(currentPost.value.thumbnail) : undefined

    return {
        "@type": "BlogPosting",
        "@id": `${articleUrl.value}#article`,
        headline: currentPost.value.title,
        description: currentPost.value.excerpt || undefined,
        url: articleUrl.value,
        mainEntityOfPage: articleUrl.value,
        image: image ? [image] : undefined,
        datePublished: normalizeSchemaDate(currentPost.value.publishedAt),
        dateModified: normalizeSchemaDate(currentPost.value.updatedAt || currentPost.value.publishedAt),
        author: {
            "@type": "Person",
            name: currentPost.value.author || "Editorial team"
        },
        publisher: {
            "@id": organizationId.value
        }
    }
})

const breadcrumbSchema = computed<SchemaNode | null>(() => {
    if (!currentPost.value?.title) {
        return null
    }

    return createBreadcrumbSchema(
        [
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: currentPost.value.title, path: route.path }
        ],
        absoluteUrl
    )
})

useStructuredData(() => [articleSchema.value, breadcrumbSchema.value], "blog-post-structured-data")
</script>

<template>
    <main class="blog-post">
        <div class="blog-post__container">
            <section class="blog-post__hero">
                <div class="blog-post__hero-copy">
                    <AppBreadcrumbs :items="breadcrumbItems" class="blog-post__breadcrumbs" />
                    <h1 class="blog-post__title">{{ currentPost?.title }}</h1>
                    <div class="blog-post__meta">
                        <span v-if="publishedDate" class="blog-post__meta-item">{{ publishedDate }}</span>
                        <span v-if="currentPost?.author" class="blog-post__meta-item">{{ currentPost.author }}</span>
                    </div>
                    <p v-if="currentPost?.excerpt" class="blog-post__excerpt">{{ currentPost.excerpt }}</p>
                </div>
            </section>
            <section class="blog-post__article">
                <NuxtImg
                    v-if="currentPost?.thumbnail"
                    :src="currentPost.thumbnail"
                    :alt="currentPost.title"
                    format="webp"
                    width="1600"
                    height="900"
                    sizes="100vw md:960px"
                    densities="x1 x2"
                    class="blog-post__image"
                />
                <!-- eslint-disable vue/no-v-html -->
                <!-- The Medusa blog API returns sanitized HTML for post bodies. -->
                <div class="blog-post__content" v-html="currentPost?.html"></div>
                <!-- eslint-enable vue/no-v-html -->
                <div v-if="!currentPost?.html" class="blog-post__empty-copy">This article does not have content yet.</div>
            </section>
            <section v-if="relatedPosts.length" class="blog-post__related">
                <div class="blog-post__related-intro">
                    <span class="blog-post__related-kicker">More to read</span>
                    <h2 class="blog-post__related-title">Related posts</h2>
                </div>
                <div class="blog-post__related-grid">
                    <article v-for="article in relatedPosts" :key="article.id" class="blog-post__related-col">
                        <BlogCard :article="article" compact />
                    </article>
                </div>
            </section>

            <div v-else class="blog-post__empty">No related posts found.</div>

            <div class="blog-post__footer-link-wrap">
                <NuxtLink :to="BLOG_HANDLE" class="blog-post__footer-link">Back to all posts</NuxtLink>
            </div>
        </div>
    </main>
</template>

<style scoped>
.blog-post {
    min-height: 100vh;
    padding: clamp(3.5rem, 6vw, 6rem) 1rem;
    background:
        radial-gradient(circle at top left, rgba(202, 138, 4, 0.08), transparent 24%), linear-gradient(180deg, #fcfdff 0%, #f6f8fc 100%);
}

.blog-post__container {
    position: relative;
    z-index: 1;
    margin: 0 auto;
    width: 100%;
    max-width: 80rem;
}

.blog-post__hero {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
}

.blog-post__hero-copy,
.blog-post__article,
.blog-post__related-col {
    animation: blog-post-rise 0.78s ease both;
}

.blog-post__hero-copy {
    width: 100%;
    max-width: 56rem;
    text-align: center;
}

.blog-post__breadcrumbs {
    margin: 0 auto 1rem;
}

.blog-post__title {
    max-width: 14ch;
    margin: 0 auto 1rem;
    color: #08173f;
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    line-height: 0.94;
    letter-spacing: -0.07rem;
    text-wrap: balance;
}

.blog-post__meta {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.85rem 1.15rem;
}

.blog-post__meta-item {
    display: inline-flex;
    align-items: center;
    color: #6a758f;
    font-size: 0.92rem;
    line-height: 1.4;
}

.blog-post__excerpt {
    max-width: 46rem;
    margin: 1rem auto 0;
    color: #475569;
    font-size: 1.04rem;
    line-height: 1.8;
}

.blog-post__article {
    max-width: 960px;
    margin: 0 auto 3rem;
}

.blog-post__image {
    width: 100%;
    height: auto;
    margin-bottom: 1.5rem;
    border-radius: 1.75rem;
}

.blog-post__content {
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.82);
    border-radius: 1.75rem;
    background: rgba(255, 255, 255, 0.9);
    color: #2f3c59;
    line-height: 1.8;
    box-shadow: 0 18px 44px rgba(8, 27, 90, 0.08);
}

.blog-post__empty-copy {
    margin-top: 1rem;
    color: #53607b;
    text-align: center;
}

.blog-post__related {
    margin-top: 1rem;
}

.blog-post__related-intro {
    display: grid;
    gap: 0.45rem;
    margin-bottom: 1.5rem;
    text-align: center;
}

.blog-post__related-kicker {
    color: #8a6a2f;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.blog-post__related-title {
    margin: 0;
    color: #08173f;
    font-size: 2.3rem;
    line-height: 1.1;
}

.blog-post__related-grid {
    display: grid;
    gap: 1.25rem;
}

.blog-post__related-col:nth-child(2) {
    animation-delay: 0.08s;
}

.blog-post__related-col:nth-child(3) {
    animation-delay: 0.14s;
}

.blog-post__empty {
    color: #53607b;
    text-align: center;
    font-size: 0.98rem;
    line-height: 1.6;
}

.blog-post__footer-link-wrap {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
}

.blog-post__footer-link {
    display: inline-flex;
    min-height: 2.9rem;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 1px solid rgba(203, 213, 225, 1);
    background: rgba(255, 255, 255, 0.92);
    padding: 0.8rem 1.2rem;
    color: #1e293b;
    font-size: 0.92rem;
    font-weight: 700;
    text-decoration: none;
}

:deep(.blog-post__content h2),
:deep(.blog-post__content h3),
:deep(.blog-post__content h4) {
    color: #08173f;
    margin-top: 1.7rem;
    margin-bottom: 0.8rem;
}

:deep(.blog-post__content a) {
    color: #8a6a2f;
    text-decoration: none;
}

:deep(.blog-post__content a:hover) {
    text-decoration: underline;
}

:deep(.blog-post__content p),
:deep(.blog-post__content li) {
    color: #42506b;
    font-size: 1.02rem;
    line-height: 1.85;
}

:deep(.blog-post__content img) {
    margin: 1.25rem 0;
    border-radius: 1rem;
}

:deep(.blog-post__content ul),
:deep(.blog-post__content ol) {
    margin: 1rem 0;
    padding-left: 1.2rem;
}

:deep(.blog-post__content ul) {
    list-style: disc;
}

:deep(.blog-post__content ol) {
    list-style: decimal;
}

@keyframes blog-post-rise {
    from {
        opacity: 0;
        transform: translateY(24px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (max-width: 767px) {
    .blog-post__title {
        max-width: 100%;
    }

    .blog-post__content {
        padding: 1.25rem;
    }
}

@media screen and (min-width: 768px) {
    .blog-post__related-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media screen and (min-width: 1200px) {
    .blog-post__related-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (prefers-reduced-motion: reduce) {
    .blog-post__hero-copy,
    .blog-post__article,
    .blog-post__related-col {
        animation: none;
    }
}
</style>
