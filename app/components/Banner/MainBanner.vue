<script setup lang="ts">
import NuxtImage from "~/components/Shared/NuxtImage.vue"
import { ALL_PRODUCTS_URL_HANDLE } from "~/utils/consts"

const heroContent = {
    title: "A cleaner, more thoughtful online store experience.",
    description:
        "Discover curated essentials with reliable delivery and practical support, all designed to make each purchase feel straightforward from first scroll to checkout.",
    detail: "Designed for fast browsing, simple decisions, and dependable delivery.",
    ctaLabel: "Shop now",
    ctaTo: "/special-offers",
    secondaryLabel: "Browse all products",
    secondaryTo: ALL_PRODUCTS_URL_HANDLE,
    image: "/images/hero-premium-1600.jpg",
    alt: "Premium modern interior with marble and wood details"
} as const

const heroHighlights = ["Fast shipping", "Secure checkout", "Support from real people"] as const
</script>

<template>
    <section class="relative isolate min-h-screen overflow-hidden bg-slate-950">
        <NuxtImage
            :src="heroContent.image"
            :alt="heroContent.alt"
            width="1600"
            height="941"
            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 100vw, 1280px"
            format="webp"
            quality="56"
            loading="eager"
            :preload="{ fetchPriority: 'high' }"
            decoding="async"
            class="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div class="absolute inset-0 z-0 bg-linear-to-r from-slate-950/90 via-slate-950/70 to-slate-950/30"></div>

        <div
            class="relative z-10 mx-auto flex h-full w-full max-w-7xl items-end px-4 pt-24 pb-12 sm:px-6 sm:pb-14 md:pt-28 md:pb-16 lg:pt-32 lg:pb-20"
        >
            <div
                class="w-full max-w-3xl rounded-4xl border border-white/10 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-md sm:p-8 lg:p-10"
            >
                <h1 class="mt-5 max-w-lg text-4xl leading-none font-bold tracking-tighter text-white sm:text-5xl lg:text-7xl">
                    A cleaner,
                    <span class="text-accent-300 block font-medium tracking-tight italic"> more thoughtful </span>
                    online store experience.
                </h1>

                <p class="mt-5 max-w-xl text-base leading-7 text-slate-100/92 sm:text-lg sm:leading-8">
                    {{ heroContent.description }}
                </p>

                <div class="mt-7 flex flex-wrap items-center gap-3">
                    <NuxtLink :to="heroContent.ctaTo" class="ui-btn-accent px-7 text-base">
                        {{ heroContent.ctaLabel }}
                    </NuxtLink>
                    <NuxtLink
                        :to="heroContent.secondaryTo"
                        class="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 bg-white/8 px-5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/12"
                    >
                        {{ heroContent.secondaryLabel }}
                    </NuxtLink>
                </div>

                <p class="mt-4 text-sm text-slate-200/90">
                    {{ heroContent.detail }}
                </p>

                <ul class="mt-6 flex flex-wrap gap-2.5" aria-label="Hero benefits">
                    <li
                        v-for="item in heroHighlights"
                        :key="item"
                        class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold tracking-widest text-slate-100"
                    >
                        <span class="bg-accent-300 h-1.5 w-1.5 rounded-full" aria-hidden="true"></span>
                        {{ item }}
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>
