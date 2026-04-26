<script setup lang="ts">
import type { BlogPostSummary } from "~/types/blog"

import NuxtImage from "~/components/Shared/NuxtImage.vue"
import { BLOG_HANDLE } from "~/utils/consts"
import { formatDate } from "~/utils/formatDate"

const FALLBACK_IMAGE = "/images/about/about-premium.jpg"

const { article, compact = false } = defineProps<{
    article: BlogPostSummary
    compact?: boolean
}>()

const articleHref = computed<string>(() => `${BLOG_HANDLE}/${article.slug}`)
const articleImage = computed<string>(() => article.thumbnail || FALLBACK_IMAGE)
const articleDate = computed<string>(() => formatDate(article.publishedAt))
</script>

<template>
    <article
        class="group rounded-card shadow-card hover:shadow-elevated grid h-full overflow-hidden border border-slate-200/90 bg-linear-to-b from-white to-slate-50 transition duration-300 hover:-translate-y-1 hover:border-amber-200 motion-reduce:transition-none"
    >
        <NuxtLink :to="articleHref" class="block text-inherit no-underline">
            <div
                class="relative overflow-hidden bg-linear-to-b from-slate-50 to-slate-200"
                :class="compact ? 'aspect-square' : 'aspect-video'"
            >
                <NuxtImage
                    :src="articleImage"
                    :alt="article.title"
                    format="webp"
                    width="960"
                    height="640"
                    sizes="320px md:50vw xl:33vw"
                    densities="x1 x2"
                    class="h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none"
                />
                <div class="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-slate-950/18 to-transparent"></div>
            </div>
        </NuxtLink>

        <div class="grid gap-4 p-5" :class="compact ? 'p-4' : ''">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span
                    v-if="article.category"
                    class="text-label-xs tracking-label-tight inline-flex min-h-8 items-center rounded-full border border-amber-200/80 bg-amber-100/70 px-3 py-1 font-bold text-amber-900 uppercase"
                >
                    {{ article.category.name }}
                </span>
                <span v-if="articleDate" class="inline-flex items-center gap-1.5 text-xs leading-5 text-slate-500">
                    <span class="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true"></span>
                    {{ articleDate }}
                </span>
                <span v-if="article.author" class="inline-flex items-center gap-1.5 text-xs leading-5 text-slate-500">
                    <span class="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true"></span>
                    {{ article.author }}
                </span>
            </div>

            <NuxtLink :to="articleHref" class="text-inherit no-underline">
                <h3 class="line-clamp-2 text-xl leading-7 font-semibold text-slate-950 sm:text-2xl">{{ article.title }}</h3>
            </NuxtLink>

            <p class="line-clamp-3 text-sm leading-7 text-slate-600 sm:min-h-16">
                {{ article.excerpt || "Read the latest journal entry from the storefront." }}
            </p>

            <NuxtLink
                :to="articleHref"
                class="mt-auto inline-flex w-fit items-center gap-2 text-sm font-bold text-amber-800 transition hover:text-amber-900"
            >
                <span>Read article</span>
                <span aria-hidden="true">→</span>
            </NuxtLink>
        </div>
    </article>
</template>
