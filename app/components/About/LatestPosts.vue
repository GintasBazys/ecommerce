<script setup lang="ts">
import type { BlogPostsResponse } from "~/types/blog"

import BlogCard from "~/components/Blog/BlogCard.vue"
import { BLOG_HANDLE } from "~/utils/consts"

const { data: latestPostsData, error: latestPostsError } = await useAsyncData("latest-blog-posts", () =>
    $fetch<BlogPostsResponse>("/api/blog/posts", {
        query: {
            limit: 3,
            offset: 0
        }
    })
)

const latestPosts = computed(() => latestPostsData.value?.posts || [])
</script>

<template>
    <section class="overflow-hidden bg-linear-to-b from-slate-50 to-slate-100 py-16 sm:py-20 lg:py-24">
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div class="max-w-3xl">
                    <span
                        class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                    >
                        Journal
                    </span>
                    <h2 class="mt-4 max-w-lg text-4xl leading-tight font-bold tracking-tighter text-slate-950 sm:text-5xl lg:text-6xl">
                        Journal posts with the same premium tone as the storefront.
                    </h2>
                    <p class="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                        Editorial updates, product context, and commerce guidance surfaced in a calmer, more refined reading layout.
                    </p>
                </div>

                <NuxtLink
                    :to="BLOG_HANDLE"
                    class="shadow-card inline-flex min-h-11 items-center justify-center self-start rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden lg:self-auto"
                >
                    Browse all posts
                </NuxtLink>
            </div>

            <div v-if="latestPosts.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div v-for="article in latestPosts" :key="article.id" class="min-w-0">
                    <BlogCard :article="article" />
                </div>
            </div>

            <div
                v-else-if="latestPostsError"
                class="shadow-card rounded-3xl border border-slate-200 bg-white px-6 py-8 text-center text-slate-600"
            >
                Something went wrong while loading the journal. Please try again.
            </div>

            <div v-else class="shadow-card rounded-3xl border border-slate-200 bg-white px-6 py-8 text-center text-slate-600">
                No blog posts published yet.
            </div>
        </div>
    </section>
</template>
