<script setup lang="ts">
import { ALL_PRODUCTS_URL_HANDLE } from "~/utils/consts"

const heroContent = {
    eyebrow: "New Season Edit",
    title: "A cleaner, more thoughtful online store experience.",
    description:
        "Discover curated essentials with reliable delivery and practical support, all designed to make each purchase feel straightforward from first scroll to checkout.",
    detail: "Designed for fast browsing, simple decisions, and dependable delivery.",
    ctaLabel: "Shop now",
    ctaTo: "/special-offers",
    secondaryLabel: "Browse all products",
    secondaryTo: ALL_PRODUCTS_URL_HANDLE,
    image: "/images/hero-main.jpg",
    alt: "Lifestyle ecommerce hero image with curated home products"
} as const

const heroHighlights = ["Fast shipping", "Secure checkout", "Support from real people"] as const
</script>

<template>
    <section class="site-hero relative isolate overflow-hidden bg-slate-950">
        <NuxtImg
            :src="heroContent.image"
            :alt="heroContent.alt"
            width="2400"
            height="1411"
            sizes="(max-width: 767px) 100vw, (max-width: 1280px) 100vw, (max-width: 1920px) 100vw, 1920px"
            format="webp"
            quality="72"
            loading="eager"
            fetchpriority="high"
            decoding="async"
            preload
            class="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div class="absolute inset-0 bg-gradient-to-r from-[#051349]/90 via-[#051349]/62 to-[#051349]/15"></div>
        <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#030d33]/70 via-[#030d33]/25 to-transparent"></div>

        <div
            class="relative z-10 mx-auto flex h-full w-full max-w-7xl items-end px-4 pb-12 pt-24 sm:px-6 sm:pb-14 md:pb-16 md:pt-28 lg:pb-20 lg:pt-32"
        >
            <div class="w-full max-w-3xl text-white">
                <span
                    class="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-100"
                >
                    {{ heroContent.eyebrow }}
                </span>

                <h1 class="mt-4 max-w-[14ch] text-4xl font-bold leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                    {{ heroContent.title }}
                </h1>

                <p class="mt-4 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
                    {{ heroContent.description }}
                </p>

                <div class="mt-7 flex flex-wrap items-center gap-3">
                    <NuxtLink :to="heroContent.ctaTo" class="ui-btn-primary px-7 text-base">
                        {{ heroContent.ctaLabel }}
                    </NuxtLink>
                    <NuxtLink
                        :to="heroContent.secondaryTo"
                        class="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 px-5 text-sm font-semibold text-white transition hover:border-white/50"
                    >
                        {{ heroContent.secondaryLabel }}
                    </NuxtLink>
                </div>

                <p class="mt-4 text-sm text-white/85">
                    {{ heroContent.detail }}
                </p>

                <ul class="mt-5 flex flex-wrap gap-2" aria-label="Hero benefits">
                    <li
                        v-for="item in heroHighlights"
                        :key="item"
                        class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-blue-50"
                    >
                        <span class="h-1.5 w-1.5 rounded-full bg-cyan-300" aria-hidden="true"></span>
                        {{ item }}
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>

<style scoped>
.site-hero {
    min-height: calc(100vh - var(--site-header-offset, 98px));
}

@supports (height: 100svh) {
    .site-hero {
        min-height: calc(100svh - var(--site-header-offset, 98px));
    }
}
</style>
