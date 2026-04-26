<script setup lang="ts">
import type { SchemaNode } from "~/composables/useStructuredData"
import type { BlogPost, BlogPostResponse, BlogPostsResponse } from "~/types/blog"

import BlogCard from "~/components/Blog/BlogCard.vue"
import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"
import NuxtImage from "~/components/Shared/NuxtImage.vue"
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
    title: `${currentPost.value?.title ?? "Shop"} | Medusa Commerce`,
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
    <main class="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-14 sm:py-20">
        <div class="relative z-10 mx-auto w-full max-w-7xl">
            <section class="mb-8 flex justify-center">
                <div class="w-full max-w-4xl text-center">
                    <AppBreadcrumbs :items="breadcrumbItems" class="mx-auto mb-4" />
                    <h1
                        class="mx-auto mb-4 max-w-3xl text-4xl leading-tight font-bold tracking-tight text-slate-950 sm:text-5xl xl:text-6xl"
                    >
                        {{ currentPost?.title }}
                    </h1>
                    <div class="flex flex-wrap justify-center gap-x-5 gap-y-2">
                        <span v-if="publishedDate" class="inline-flex items-center text-sm text-slate-500">{{ publishedDate }}</span>
                        <span v-if="currentPost?.author" class="inline-flex items-center text-sm text-slate-500">{{
                            currentPost.author
                        }}</span>
                    </div>
                    <p v-if="currentPost?.excerpt" class="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-600">
                        {{ currentPost.excerpt }}
                    </p>
                </div>
            </section>

            <section class="mx-auto mb-12 max-w-5xl">
                <NuxtImage
                    v-if="currentPost?.thumbnail"
                    :src="currentPost.thumbnail"
                    :alt="currentPost.title"
                    format="webp"
                    width="1600"
                    height="900"
                    sizes="100vw md:960px"
                    densities="x1 x2"
                    class="rounded-panel mb-6 w-full object-cover"
                />

                <div class="rounded-panel shadow-panel border border-white/80 bg-white/90 p-5 text-slate-700 sm:p-8">
                    <!-- eslint-disable vue/no-v-html -->
                    <!-- The Medusa blog API returns sanitized HTML for post bodies. -->
                    <div class="blog-richtext" v-html="currentPost?.html"></div>
                    <!-- eslint-enable vue/no-v-html -->
                </div>

                <div v-if="!currentPost?.html" class="mt-4 text-center text-sm text-slate-600">This article does not have content yet.</div>
            </section>

            <section v-if="relatedPosts.length" class="mt-4">
                <div class="mb-6 grid gap-2 text-center">
                    <span class="text-label-sm tracking-label text-amber-800 uppercase">More to read</span>
                    <h2 class="text-3xl leading-tight font-bold text-slate-950 sm:text-4xl">Related posts</h2>
                </div>
                <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    <article v-for="article in relatedPosts" :key="article.id">
                        <BlogCard :article="article" compact />
                    </article>
                </div>
            </section>

            <div v-else class="text-center text-sm leading-7 text-slate-600">No related posts found.</div>

            <div class="mt-8 flex justify-center">
                <NuxtLink
                    :to="BLOG_HANDLE"
                    class="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white/95 px-5 text-sm font-semibold text-slate-800 no-underline transition hover:border-amber-200 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
                >
                    Back to all posts
                </NuxtLink>
            </div>
        </div>
    </main>
</template>
