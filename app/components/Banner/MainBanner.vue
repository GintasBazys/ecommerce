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

const heroInlineCss = `.home-hero{position:relative;isolation:isolate;min-height:100vh;overflow:hidden;background:#020617}.home-hero__image{position:absolute;inset:0;height:100%;width:100%;object-fit:cover;object-position:center}.home-hero__overlay{position:absolute;inset:0;z-index:0;background:rgba(2,6,23,.46)}.home-hero__inner{position:relative;z-index:10;margin-inline:auto;display:flex;height:100%;width:100%;max-width:80rem;align-items:flex-end;padding:5.5rem 1rem 2.5rem}.home-hero__panel{width:100%;max-width:42rem;border:1px solid rgba(255,255,255,.1);border-radius:1.5rem;background:rgba(2,6,23,.28);padding:1.25rem;color:#fff;box-shadow:0 20px 25px -5px rgba(0,0,0,.24),0 8px 10px -6px rgba(0,0,0,.24)}.home-hero__title{margin-top:.75rem;max-width:28rem;font-size:2.25rem;line-height:1;font-weight:600;letter-spacing:-.025em;color:#fff}.home-hero__accent{display:block;color:#fcd34d;font-weight:500;font-style:italic;letter-spacing:-.025em}.home-hero__copy{margin-top:1rem;max-width:32rem;font-size:1rem;line-height:1.5rem;color:rgba(241,245,249,.88)}.home-hero__actions{margin-top:1.5rem;display:flex;flex-wrap:wrap;align-items:center;gap:.625rem}.home-hero__secondary{display:inline-flex;min-height:2.75rem;align-items:center;justify-content:center;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);padding-inline:1rem;font-size:.875rem;font-weight:600;color:#fff}.home-hero__detail{margin-top:.75rem;font-size:.75rem;color:rgba(226,232,240,.82)}@media (min-width:640px){.home-hero__overlay{background:linear-gradient(90deg,rgba(2,6,23,.88),rgba(2,6,23,.68),rgba(2,6,23,.3))}.home-hero__inner{padding:7rem 1.5rem 3.5rem}.home-hero__panel{max-width:48rem;border-radius:2rem;background:rgba(255,255,255,.1);padding:2rem;backdrop-filter:blur(12px)}.home-hero__title{margin-top:1.25rem;max-width:32rem;font-size:3rem;font-weight:700;letter-spacing:-.05em}.home-hero__copy{margin-top:1.25rem;max-width:36rem;font-size:1.125rem;line-height:2rem;color:rgba(241,245,249,.92)}.home-hero__actions{margin-top:1.75rem;gap:.75rem}.home-hero__detail{margin-top:1rem;font-size:.875rem;color:rgba(226,232,240,.9)}}@media (min-width:1024px){.home-hero__inner{padding-top:8rem;padding-bottom:5rem}.home-hero__panel{padding:2.5rem}.home-hero__title{font-size:4.5rem}}`

useHead({
    style: [{ key: "home-hero-inline-css", textContent: heroInlineCss }]
})
</script>

<template>
    <section class="home-hero relative isolate min-h-screen overflow-hidden bg-slate-950">
        <NuxtImage
            :src="heroContent.image"
            :alt="heroContent.alt"
            width="1280"
            height="753"
            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 100vw, 1280px"
            format="webp"
            quality="50"
            loading="eager"
            fetchpriority="high"
            :preload="{ fetchPriority: 'high' }"
            decoding="async"
            class="home-hero__image absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
            class="home-hero__overlay absolute inset-0 z-0 bg-slate-950/46 sm:bg-linear-to-r sm:from-slate-950/88 sm:via-slate-950/68 sm:to-slate-950/30"
        ></div>

        <div
            class="home-hero__inner relative z-10 mx-auto flex h-full w-full max-w-7xl items-end px-4 pt-22 pb-10 sm:px-6 sm:pb-14 md:pt-28 md:pb-16 lg:pt-32 lg:pb-20"
        >
            <div
                class="home-hero__panel w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950/28 p-5 text-white shadow-xl sm:max-w-3xl sm:rounded-4xl sm:bg-white/10 sm:p-8 sm:shadow-2xl sm:backdrop-blur-md lg:p-10"
            >
                <h1
                    class="home-hero__title mt-3 max-w-md text-4xl leading-none font-semibold tracking-tight text-white sm:mt-5 sm:max-w-lg sm:text-5xl sm:font-bold sm:tracking-tighter lg:text-7xl"
                >
                    A cleaner,
                    <span class="home-hero__accent text-accent-300 block font-medium tracking-tight italic"> more thoughtful </span>
                    online store experience.
                </h1>

                <p
                    class="home-hero__copy mt-4 max-w-lg text-base leading-6 text-slate-100/88 sm:mt-5 sm:max-w-xl sm:text-lg sm:leading-8 sm:text-slate-100/92"
                >
                    {{ heroContent.description }}
                </p>

                <div class="home-hero__actions mt-6 flex flex-wrap items-center gap-2.5 sm:mt-7 sm:gap-3">
                    <NuxtLink :to="heroContent.ctaTo" class="ui-btn-accent px-6 text-sm sm:px-7 sm:text-base">
                        {{ heroContent.ctaLabel }}
                    </NuxtLink>
                    <NuxtLink
                        :to="heroContent.secondaryTo"
                        class="home-hero__secondary inline-flex min-h-11 items-center justify-center rounded-full border border-white/18 bg-white/6 px-4 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/12 sm:px-5"
                    >
                        {{ heroContent.secondaryLabel }}
                    </NuxtLink>
                </div>

                <p class="home-hero__detail mt-3 text-xs text-slate-200/82 sm:mt-4 sm:text-sm sm:text-slate-200/90">
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
