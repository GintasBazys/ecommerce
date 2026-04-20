<script setup lang="ts">
import type { SchemaNode } from "~/composables/useStructuredData"
import type { BlogCategoriesResponse, BlogCategory, BlogPostSummary, BlogPostsResponse } from "~/types/blog"

import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"
import { BLOG_HANDLE } from "~/utils/consts"

const route = useRoute()
const { siteName, absoluteUrl } = useSiteIdentity()

const limit = 6

function parsePage(value: unknown) {
    const parsedValue = Number.parseInt(String(value || "1"), 10)
    return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 1
}

function buildQuery(page: number, category: string | null = currentCategory.value || null) {
    const query: Record<string, string> = {}

    if (page > 1) {
        query.page = String(page)
    }

    if (category) {
        query.category = category
    }

    return query
}

const currentPage = computed<number>(() => parsePage(route.query.page))
const currentCategory = computed<string>(() => (typeof route.query.category === "string" ? route.query.category.trim() : ""))
const offset = computed<number>(() => (currentPage.value - 1) * limit)

const { data: categoriesData } = await useAsyncData("blog-categories", () => $fetch<BlogCategoriesResponse>("/api/blog/categories"))

const {
    data: blogData,
    pending,
    error
} = await useAsyncData(
    "blog-posts",
    () =>
        $fetch<BlogPostsResponse>("/api/blog/posts", {
            query: {
                limit,
                offset: offset.value,
                category: currentCategory.value || undefined
            }
        }),
    {
        watch: [currentPage, currentCategory]
    }
)

const categories = computed<BlogCategory[]>(() => categoriesData.value?.categories || [])
const articles = computed<BlogPostSummary[]>(() => blogData.value?.posts || [])
const total = computed<number>(() => blogData.value?.count || 0)
const totalPages = computed<number>(() => Math.max(1, Math.ceil(total.value / limit)))
const activeCategory = computed<BlogCategory | null>(() => {
    if (!currentCategory.value) {
        return null
    }

    return categories.value.find((category) => category.slug === currentCategory.value) || null
})
const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: "Blog" }])
const pageTitle = computed<string>(() => (activeCategory.value ? `${activeCategory.value.name} Blog | Ecommerce` : "Blog | Ecommerce"))
const pageDescription = computed<string>(() =>
    activeCategory.value
        ? `Browse published articles in ${activeCategory.value.name} with a premium editorial layout.`
        : "Editorial stories, ecommerce guidance, and product-focused insights from the store."
)

useHead(() => ({
    title: pageTitle.value,
    meta: [{ name: "description", content: pageDescription.value }]
}))

const blogSchema = computed<SchemaNode>(() => ({
    "@type": "Blog",
    "@id": `${absoluteUrl(route.path)}#blog`,
    name: `${siteName.value} Blog`,
    description: pageDescription.value,
    url: absoluteUrl(route.path)
}))

const blogListSchema = computed<SchemaNode | null>(() => {
    if (!articles.value.length) {
        return null
    }

    return {
        "@type": "ItemList",
        itemListElement: articles.value.map((article, index) => ({
            "@type": "ListItem",
            position: offset.value + index + 1,
            url: absoluteUrl(`${BLOG_HANDLE}/${article.slug}`),
            name: article.title
        }))
    }
})

const breadcrumbSchema = computed<SchemaNode>(() =>
    createBreadcrumbSchema(
        [
            { name: "Home", path: "/" },
            { name: "Blog", path: route.path }
        ],
        absoluteUrl
    )
)

useStructuredData(() => [blogSchema.value, blogListSchema.value, breadcrumbSchema.value], "blog-index-structured-data")
</script>

<template>
    <main class="blog-index">
        <div class="blog-index__container">
            <section class="blog-index__hero">
                <div class="blog-index__hero-copy">
                    <AppBreadcrumbs :items="breadcrumbItems" class="blog-index__breadcrumbs" />
                    <h1 class="blog-index__title">Product stories, store notes, and cleaner editorial reading.</h1>
                    <p class="blog-index__description">
                        Explore published articles, product context, and editorial notes in a calmer layout with cleaner hierarchy and
                        easier browsing on mobile.
                    </p>
                </div>
            </section>

            <section class="blog-index__filters" aria-label="Blog categories">
                <NuxtLink
                    :to="{ query: buildQuery(1, null) }"
                    class="blog-index__chip"
                    :class="{ 'blog-index__chip--active': !activeCategory }"
                >
                    All posts
                </NuxtLink>
                <NuxtLink
                    v-for="category in categories"
                    :key="category.id"
                    :to="{ query: buildQuery(1, category.slug) }"
                    class="blog-index__chip"
                    :class="{ 'blog-index__chip--active': activeCategory?.slug === category.slug }"
                >
                    {{ category.name }}
                </NuxtLink>
            </section>

            <section v-if="articles.length" class="blog-index__grid">
                <article v-for="article in articles" :key="article.id" class="blog-index__col">
                    <BlogCard :article="article" />
                </article>
            </section>

            <section v-else-if="pending" class="blog-index__state-grid" aria-label="Loading posts">
                <div v-for="item in 3" :key="item" class="blog-index__skeleton"></div>
            </section>

            <div v-else-if="error" class="blog-index__state">Something went wrong while loading blog posts. Please try again.</div>

            <div v-else-if="!articles" class="blog-index__state">No blog posts found. Try removing a filter or check back soon.</div>

            <nav v-if="articles && totalPages > 1" class="blog-index__pagination" aria-label="Blog pagination">
                <NuxtLink v-if="currentPage > 1" :to="{ query: buildQuery(currentPage - 1) }" class="blog-index__pagination-btn">
                    Previous
                </NuxtLink>
                <span v-else class="blog-index__pagination-btn blog-index__pagination-btn--disabled">Previous</span>

                <span class="blog-index__pagination-label">Page {{ currentPage }} of {{ totalPages }}</span>

                <NuxtLink v-if="currentPage < totalPages" :to="{ query: buildQuery(currentPage + 1) }" class="blog-index__pagination-btn">
                    Next
                </NuxtLink>
                <span v-else class="blog-index__pagination-btn blog-index__pagination-btn--disabled">Next</span>
            </nav>
        </div>
    </main>
</template>

<style scoped>
.blog-index {
    min-height: 100vh;
    padding: clamp(3.5rem, 6vw, 6rem) 1rem;
    background:
        radial-gradient(circle at top left, rgba(202, 138, 4, 0.08), transparent 24%), linear-gradient(180deg, #fcfdff 0%, #f6f8fc 100%);
}

.blog-index__container {
    position: relative;
    z-index: 1;
    margin: 0 auto;
    width: 100%;
    max-width: 80rem;
}

.blog-index__hero {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
}

.blog-index__hero-copy {
    width: 100%;
    max-width: 60rem;
    text-align: center;
}

.blog-index__breadcrumbs {
    margin: 0 auto 1rem;
}

.blog-index__breadcrumbs:deep(nav) {
    border-color: rgba(253, 230, 138, 0.72);
    background: rgba(255, 251, 235, 0.92);
    color: #92400e;
    box-shadow: 0 14px 36px rgba(202, 138, 4, 0.12);
}

.blog-index__breadcrumbs:deep(a) {
    color: #a16207;
}

.blog-index__breadcrumbs:deep(a:hover) {
    color: #78350f;
}

.blog-index__breadcrumbs:deep(span.font-semibold) {
    color: #451a03;
}

.blog-index__filters {
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    margin-bottom: 1.5rem;
    scrollbar-width: none;
}

.blog-index__filters::-webkit-scrollbar {
    display: none;
}

.blog-index__chip {
    display: inline-flex;
    min-height: 2.75rem;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    border-radius: 999px;
    border: 1px solid rgba(226, 232, 240, 0.9);
    background: rgba(255, 255, 255, 0.88);
    padding: 0.75rem 1rem;
    color: #475569;
    font-size: 0.92rem;
    font-weight: 700;
    text-decoration: none;
    transition:
        border-color 0.2s ease,
        background-color 0.2s ease,
        color 0.2s ease;
}

.blog-index__chip--active {
    border-color: rgba(202, 138, 4, 0.24);
    background: rgba(255, 251, 235, 0.9);
    color: #78350f;
}

.blog-index__title {
    max-width: 18ch;
    margin: 0 auto 1rem;
    color: #08173f;
    font-size: clamp(2.6rem, 6vw, 4.5rem);
    line-height: 0.94;
    letter-spacing: -0.07rem;
    text-wrap: balance;
}

.blog-index__description {
    max-width: 48rem;
    margin: 0 auto;
    color: #53607b;
    font-size: 1.04rem;
    line-height: 1.75;
}

.blog-index__featured {
    margin-bottom: 1.5rem;
}

.featured-post {
    display: grid;
    align-items: stretch;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.84);
    border-radius: 2rem;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95));
    box-shadow: 0 20px 48px rgba(8, 27, 90, 0.08);
}

.featured-post__media-link {
    display: block;
    min-width: 0;
    aspect-ratio: 16 / 11;
    overflow: hidden;
    background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
}

.featured-post__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.featured-post__content {
    display: grid;
    min-width: 0;
    gap: 1rem;
    padding: 1.5rem;
}

.featured-post__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.65rem;
}

.featured-post__category {
    display: inline-flex;
    min-height: 2rem;
    align-items: center;
    border-radius: 999px;
    border: 1px solid rgba(253, 230, 138, 0.8);
    background: rgba(254, 243, 199, 0.72);
    padding: 0.35rem 0.8rem;
    color: #78350f;
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.featured-post__meta-item {
    color: #64748b;
    font-size: 0.9rem;
}

.featured-post__title-link {
    color: inherit;
    text-decoration: none;
}

.featured-post__title {
    margin: 0;
    max-width: 14ch;
    color: #0f172a;
    font-size: clamp(2rem, 5vw, 3.5rem);
    line-height: 0.96;
    letter-spacing: -0.05em;
}

.featured-post__excerpt {
    margin: 0;
    max-width: 42rem;
    color: #475569;
    font-size: 1rem;
    line-height: 1.8;
}

.featured-post__cta {
    display: inline-flex;
    min-height: 2.9rem;
    width: fit-content;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: #cda45e;
    padding: 0.8rem 1.25rem;
    color: #0f172a;
    font-size: 0.94rem;
    font-weight: 700;
    text-decoration: none;
    transition: background-color 0.2s ease;
}

.featured-post__cta:hover {
    background: #d8b57a;
}

.blog-index__grid {
    display: grid;
    gap: 1.25rem;
}

.blog-index__state-grid {
    display: grid;
    gap: 1.25rem;
}

.blog-index__skeleton,
.blog-index__state {
    border-radius: 1.6rem;
    border: 1px solid rgba(226, 232, 240, 0.9);
    background: rgba(255, 255, 255, 0.88);
    box-shadow: 0 16px 42px rgba(8, 27, 90, 0.06);
}

.blog-index__skeleton {
    min-height: 18rem;
    background: linear-gradient(90deg, rgba(241, 245, 249, 0.9), rgba(248, 250, 252, 1), rgba(241, 245, 249, 0.9));
}

.blog-index__state {
    padding: 1.5rem;
    color: #475569;
    text-align: center;
}

.blog-index__pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    animation-delay: 0.18s;
}

.blog-index__pagination-label {
    color: #53607b;
    font-size: 0.95rem;
    line-height: 1.4;
}

.blog-index__pagination-btn {
    display: inline-flex;
    min-height: 2.9rem;
    min-width: 6.75rem;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 1px solid rgba(203, 213, 225, 1);
    background: rgba(255, 255, 255, 0.92);
    padding: 0.8rem 1.15rem;
    color: #1e293b;
    font-size: 0.92rem;
    font-weight: 700;
    text-decoration: none;
}

.blog-index__pagination-btn--disabled {
    opacity: 0.45;
}

@keyframes blog-index-rise {
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
    .blog-index__title {
        max-width: 100%;
    }

    .blog-index__pagination {
        flex-wrap: wrap;
    }
}

@media screen and (min-width: 768px) {
    .blog-index__grid,
    .blog-index__state-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media screen and (min-width: 1024px) {
    .featured-post {
        grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    }

    .featured-post__media-link {
        aspect-ratio: auto;
        min-height: 100%;
    }

    .featured-post__content {
        padding: 2rem;
    }
}

@media screen and (min-width: 1200px) {
    .blog-index__grid,
    .blog-index__state-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}
</style>
