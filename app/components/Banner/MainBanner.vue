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
    image: "/images/hero-premium.jpg",
    alt: "Premium modern interior with marble and wood details"
} as const

const heroHighlights = ["Fast shipping", "Secure checkout", "Support from real people"] as const
</script>

<template>
    <section class="site-hero relative isolate overflow-hidden bg-slate-950">
        <NuxtImage
            :src="heroContent.image"
            :alt="heroContent.alt"
            width="2400"
            height="1411"
            sizes="(max-width: 767px) 100vw, (max-width: 1280px) 100vw, (max-width: 1920px) 100vw, 1920px"
            format="webp"
            quality="64"
            loading="eager"
            :preload="{ fetchPriority: 'high' }"
            decoding="async"
            class="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div
            class="relative z-10 mx-auto flex h-full w-full max-w-7xl items-end px-4 pt-24 pb-12 sm:px-6 sm:pb-14 md:pt-28 md:pb-16 lg:pt-32 lg:pb-20"
        >
            <div class="site-hero__panel w-full max-w-3xl rounded-4xl p-6 text-white sm:p-8 lg:p-10">
                <h1 class="mt-5 max-w-[13ch] text-4xl leading-[0.95] font-bold tracking-[-0.05em] text-white sm:text-5xl lg:text-[4.25rem]">
                    A cleaner,
                    <span class="text-accent-300 block font-medium tracking-[-0.03em] italic"> more thoughtful </span>
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
                        class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold tracking-[0.08em] text-slate-100"
                    >
                        <span class="bg-accent-300 h-1.5 w-1.5 rounded-full" aria-hidden="true"></span>
                        {{ item }}
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>

<style scoped lang="scss">
.site-hero {
    min-height: calc(100vh - var(--site-header-offset, 98px));
}

.site-hero::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    background: linear-gradient(90deg, rgba(2, 6, 23, 0.92) 0%, rgba(2, 6, 23, 0.72) 42%, rgba(2, 6, 23, 0.28) 100%);
}

.site-hero__panel {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 20px 48px rgba(2, 6, 23, 0.2);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

@supports (height: 100svh) {
    .site-hero {
        min-height: calc(100svh - var(--site-header-offset, 98px));
    }
}
</style>
