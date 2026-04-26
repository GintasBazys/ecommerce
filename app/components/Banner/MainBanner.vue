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
            width="1280"
            height="753"
            sizes="(max-width: 767px) 100vw, 1280px"
            densities="x1 x2"
            format="webp"
            quality="50"
            loading="eager"
            :preload="{ fetchPriority: 'high' }"
            decoding="async"
            class="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div class="absolute inset-0 z-0 bg-slate-950/46 sm:bg-linear-to-r sm:from-slate-950/88 sm:via-slate-950/68 sm:to-slate-950/30"></div>

        <div
            class="relative z-10 mx-auto flex h-full w-full max-w-7xl items-end px-4 pt-22 pb-10 sm:px-6 sm:pb-14 md:pt-28 md:pb-16 lg:pt-32 lg:pb-20"
        >
            <div
                class="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950/28 p-5 text-white shadow-xl sm:max-w-3xl sm:rounded-4xl sm:bg-white/10 sm:p-8 sm:shadow-2xl sm:backdrop-blur-md lg:p-10"
            >
                <h1 class="mt-3 max-w-md text-[2.6rem] leading-[0.94] font-semibold tracking-[-0.04em] text-white sm:mt-5 sm:max-w-lg sm:text-5xl sm:leading-none sm:font-bold sm:tracking-tighter lg:text-7xl">
                    A cleaner,
                    <span class="text-accent-300 block font-medium tracking-tight italic"> more thoughtful </span>
                    online store experience.
                </h1>

                <p class="mt-4 max-w-lg text-[0.95rem] leading-6 text-slate-100/88 sm:mt-5 sm:max-w-xl sm:text-lg sm:leading-8 sm:text-slate-100/92">
                    {{ heroContent.description }}
                </p>

                <div class="mt-6 flex flex-wrap items-center gap-2.5 sm:mt-7 sm:gap-3">
                    <NuxtLink :to="heroContent.ctaTo" class="ui-btn-accent px-6 text-sm sm:px-7 sm:text-base">
                        {{ heroContent.ctaLabel }}
                    </NuxtLink>
                    <NuxtLink
                        :to="heroContent.secondaryTo"
                        class="inline-flex min-h-11 items-center justify-center rounded-full border border-white/18 bg-white/6 px-4 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/12 sm:px-5"
                    >
                        {{ heroContent.secondaryLabel }}
                    </NuxtLink>
                </div>

                <p class="mt-3 text-xs text-slate-200/82 sm:mt-4 sm:text-sm sm:text-slate-200/90">
                    {{ heroContent.detail }}
                </p>

                <ul class="mt-5 hidden flex-wrap gap-2.5 sm:flex" aria-label="Hero benefits">
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
