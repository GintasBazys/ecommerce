<script setup lang="ts">
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
        <NuxtImg
            :src="heroContent.image"
            :alt="heroContent.alt"
            width="2400"
            height="1411"
            sizes="(max-width: 767px) 100vw, (max-width: 1280px) 100vw, (max-width: 1920px) 100vw, 1920px"
            format="webp"
            quality="72"
            loading="eager"
            :preload="{ fetchPriority: 'high' }"
            decoding="async"
            class="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div class="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.92)_0%,rgba(2,6,23,0.72)_42%,rgba(2,6,23,0.28)_100%)]"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.18),transparent_24%)]"></div>
        <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#020617]/78 via-[#020617]/30 to-transparent"></div>

        <div
            class="relative z-10 mx-auto flex h-full w-full max-w-7xl items-end px-4 pb-12 pt-24 sm:px-6 sm:pb-14 md:pb-16 md:pt-28 lg:pb-20 lg:pt-32"
        >
            <div
                class="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-white/6 p-6 text-white shadow-[0_30px_90px_rgba(2,6,23,0.28)] backdrop-blur-[10px] sm:p-8 lg:p-10"
            >
                <h1
                    class="site-hero__title mt-5 max-w-[13ch] text-4xl font-bold leading-[0.95] tracking-[-0.05em] text-white sm:text-5xl lg:text-[4.25rem]"
                >
                    A cleaner,
                    <span class="block font-medium italic tracking-[-0.03em] text-[#e8c98d]"> more thoughtful </span>
                    online store experience.
                </h1>

                <p class="site-hero__description mt-5 max-w-[36rem] text-base leading-7 text-slate-100/92 sm:text-lg sm:leading-8">
                    {{ heroContent.description }}
                </p>

                <div class="site-hero__actions mt-7 flex flex-wrap items-center gap-3">
                    <NuxtLink
                        :to="heroContent.ctaTo"
                        class="inline-flex min-h-11 items-center justify-center rounded-full bg-[#cda45e] px-7 text-base font-semibold text-slate-950 transition hover:bg-[#d8b57a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8c98d]"
                    >
                        {{ heroContent.ctaLabel }}
                    </NuxtLink>
                    <NuxtLink
                        :to="heroContent.secondaryTo"
                        class="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 bg-white/8 px-5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/12"
                    >
                        {{ heroContent.secondaryLabel }}
                    </NuxtLink>
                </div>

                <p class="site-hero__detail mt-4 text-sm text-slate-200/90">
                    {{ heroContent.detail }}
                </p>

                <ul class="site-hero__highlights mt-6 flex flex-wrap gap-2.5" aria-label="Hero benefits">
                    <li
                        v-for="item in heroHighlights"
                        :key="item"
                        class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold tracking-[0.08em] text-slate-100"
                    >
                        <span class="h-1.5 w-1.5 rounded-full bg-[#e8c98d]" aria-hidden="true"></span>
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

.site-hero__title,
.site-hero__description,
.site-hero__actions,
.site-hero__detail,
.site-hero__highlights {
    opacity: 0;
    animation: hero-rise 0.8s ease forwards;
}

.site-hero__title {
    animation-delay: 0.08s;
}

.site-hero__description {
    animation-delay: 0.16s;
}

.site-hero__actions {
    animation-delay: 0.24s;
}

.site-hero__detail {
    animation-delay: 0.32s;
}

.site-hero__highlights {
    animation-delay: 0.4s;
}

@keyframes hero-rise {
    from {
        opacity: 0;
        transform: translateY(22px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@supports (height: 100svh) {
    .site-hero {
        min-height: calc(100svh - var(--site-header-offset, 98px));
    }
}

@media (prefers-reduced-motion: reduce) {
    .site-hero__title,
    .site-hero__description,
    .site-hero__actions,
    .site-hero__detail,
    .site-hero__highlights {
        opacity: 1;
        animation: none;
    }
}
</style>
