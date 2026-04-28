<script setup lang="ts">
import type { SchemaNode } from "~/composables/useStructuredData"
import type { BlogCategoriesResponse, BlogCategory, BlogPostSummary, BlogPostsResponse } from "~/types/blog"

import BlogCard from "~/components/Blog/BlogCard.vue"
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
const pageTitle = computed<string>(() =>
    activeCategory.value ? `${activeCategory.value.name} Blog | Medusa Commerce` : "Blog | Medusa Commerce"
)
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
    <main class="min-h-screen bg-linear-to-b from-white to-slate-100 px-4 py-14 sm:py-20 lg:py-24">
        <div class="relative z-10 mx-auto w-full max-w-7xl">
            <section class="mb-6 flex justify-center">
                <div class="w-full max-w-5xl text-center">
                    <AppBreadcrumbs :items="breadcrumbItems" class="mx-auto mb-4" />
                    <h1 class="mx-auto mb-4 max-w-4xl text-5xl leading-none font-bold tracking-tighter text-slate-950 sm:text-6xl xl:text-7xl">
                        Product stories, store notes, and cleaner editorial reading.
                    </h1>
                    <p class="mx-auto max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                        Explore published articles, product context, and editorial notes in a calmer layout with cleaner hierarchy and
                        easier browsing on mobile.
                    </p>
                </div>
            </section>

            <section class="mb-6 flex gap-3 overflow-x-auto pb-2" aria-label="Blog categories">
                <NuxtLink
                    :to="{ query: buildQuery(1, null) }"
                    class="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border px-4 py-3 text-sm font-bold no-underline transition"
                    :class="
                        !activeCategory
                            ? 'border-amber-300 bg-amber-50 text-amber-900'
                            : 'border-slate-200 bg-white/90 text-slate-600 hover:border-amber-200 hover:text-slate-950'
                    "
                >
                    All posts
                </NuxtLink>
                <NuxtLink
                    v-for="category in categories"
                    :key="category.id"
                    :to="{ query: buildQuery(1, category.slug) }"
                    class="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border px-4 py-3 text-sm font-bold no-underline transition"
                    :class="
                        activeCategory?.slug === category.slug
                            ? 'border-amber-300 bg-amber-50 text-amber-900'
                            : 'border-slate-200 bg-white/90 text-slate-600 hover:border-amber-200 hover:text-slate-950'
                    "
                >
                    {{ category.name }}
                </NuxtLink>
            </section>

            <section v-if="articles.length" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <article v-for="article in articles" :key="article.id" class="min-w-0">
                    <BlogCard :article="article" />
                </article>
            </section>

            <section v-else-if="pending" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading posts">
                <div v-for="item in 3" :key="item" class="min-h-72 animate-pulse rounded-panel border border-slate-200 bg-slate-100 shadow-card"></div>
            </section>

            <div v-else-if="error" class="rounded-panel border border-slate-200 bg-white/90 p-6 text-center text-slate-600 shadow-card">
                Something went wrong while loading blog posts. Please try again.
            </div>

            <div v-else class="rounded-panel border border-slate-200 bg-white/90 p-6 text-center text-slate-600 shadow-card">
                No blog posts found. Try removing a filter or check back soon.
            </div>

            <nav v-if="articles.length && totalPages > 1" class="mt-8 flex flex-wrap items-center justify-center gap-4" aria-label="Blog pagination">
                <NuxtLink
                    v-if="currentPage > 1"
                    :to="{ query: buildQuery(currentPage - 1) }"
                    class="inline-flex min-h-12 min-w-28 items-center justify-center rounded-full border border-slate-300 bg-white/95 px-5 text-sm font-bold text-slate-800 no-underline"
                >
                    Previous
                </NuxtLink>
                <span
                    v-else
                    class="inline-flex min-h-12 min-w-28 items-center justify-center rounded-full border border-slate-300 bg-white/95 px-5 text-sm font-bold text-slate-800 opacity-45"
                >
                    Previous
                </span>

                <span class="text-sm leading-6 text-slate-600">Page {{ currentPage }} of {{ totalPages }}</span>

                <NuxtLink
                    v-if="currentPage < totalPages"
                    :to="{ query: buildQuery(currentPage + 1) }"
                    class="inline-flex min-h-12 min-w-28 items-center justify-center rounded-full border border-slate-300 bg-white/95 px-5 text-sm font-bold text-slate-800 no-underline"
                >
                    Next
                </NuxtLink>
                <span
                    v-else
                    class="inline-flex min-h-12 min-w-28 items-center justify-center rounded-full border border-slate-300 bg-white/95 px-5 text-sm font-bold text-slate-800 opacity-45"
                >
                    Next
                </span>
            </nav>
        </div>
    </main>
</template>
