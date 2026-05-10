<script setup lang="ts">
import type { BlogPost, BlogPostSummary } from "~/types/blog"
import type { BreadcrumbItem } from "~/types/breadcrumbs"

import BlogCard from "~/components/islands/BlogCard.vue"
import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"
import NuxtImage from "~/components/Shared/NuxtImage.vue"
import { BLOG_HANDLE } from "~/utils/consts"

defineProps<{
    currentPost: BlogPost
    publishedDate: string
    breadcrumbItems: BreadcrumbItem[]
    relatedPosts: BlogPostSummary[]
}>()
</script>

<template>
    <main class="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 px-4 py-14 sm:py-20">
        <div class="relative z-10 mx-auto w-full max-w-7xl">
            <section class="mb-8 flex justify-center">
                <div class="w-full max-w-4xl text-center">
                    <AppBreadcrumbs :items="breadcrumbItems" class="mx-auto mb-4" />
                    <h1 class="mx-auto mb-4 max-w-3xl text-4xl leading-tight font-bold tracking-tight text-slate-950 sm:text-5xl xl:text-6xl">
                        {{ currentPost.title }}
                    </h1>
                    <div class="flex flex-wrap justify-center gap-x-5 gap-y-2">
                        <span v-if="publishedDate" class="inline-flex items-center text-sm text-slate-500">{{ publishedDate }}</span>
                        <span v-if="currentPost.author" class="inline-flex items-center text-sm text-slate-500">{{ currentPost.author }}</span>
                    </div>
                    <p v-if="currentPost.excerpt" class="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-600">
                        {{ currentPost.excerpt }}
                    </p>
                </div>
            </section>

            <section class="mx-auto mb-12 max-w-5xl">
                <NuxtImage
                    v-if="currentPost.thumbnail"
                    :src="currentPost.thumbnail"
                    :alt="currentPost.title"
                    format="webp"
                    width="1600"
                    height="900"
                    sizes="100vw md:960px"
                    densities="x1 x2"
                    loading="eager"
                    fetchpriority="high"
                    preload
                    class="rounded-panel mb-6 w-full object-cover"
                />

                <div class="rounded-panel shadow-panel border border-white/80 bg-white/90 p-5 text-slate-700 sm:p-8">
                    <!-- eslint-disable vue/no-v-html -->
                    <!-- Blog HTML is sanitized in the server blog normalizer before rendering. -->
                    <div class="blog-richtext" v-html="currentPost.html"></div>
                    <!-- eslint-enable vue/no-v-html -->
                </div>

                <div v-if="!currentPost.html" class="mt-4 text-center text-sm text-slate-600">This article does not have content yet.</div>
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
