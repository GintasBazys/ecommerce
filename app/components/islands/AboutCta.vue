<script setup lang="ts">
import NuxtImage from "~/components/Shared/NuxtImage.vue"

defineProps<{
    linkShown?: boolean
    extraSpacerClass?: string
}>()

const highlights = [
    {
        title: "Editorial selection",
        text: "Assortments are narrowed with quality, usefulness, and long-term value in mind."
    },
    {
        title: "Clear purchase flow",
        text: "Product details, delivery expectations, and support paths stay easy to understand."
    },
    {
        title: "Premium support",
        text: "Human help is available before checkout and after the order leaves our store."
    }
]
</script>

<template>
    <section :class="extraSpacerClass" class="overflow-hidden bg-linear-to-b from-white via-slate-50 to-slate-100 py-14 sm:py-16 lg:py-22">
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div class="grid items-center gap-8 pb-8 xl:grid-cols-2 xl:gap-12">
                <div class="xl:pr-4">
                    <div
                        class="relative rounded-3xl border border-white/80 bg-linear-to-b from-white/95 to-slate-50/90 p-3 pb-22 shadow-elevated sm:rounded-4xl sm:p-4 sm:pb-24"
                    >
                        <div class="relative overflow-hidden rounded-2xl sm:rounded-3xl">
                            <NuxtImage
                                src="/images/hero-main.jpg"
                                alt="Editorial lifestyle arrangement of curated home products"
                                width="708"
                                height="708"
                                sizes="(max-width: 767px) 92vw, (max-width: 1279px) 708px, 560px"
                                densities="x1"
                                format="webp"
                                quality="60"
                                loading="lazy"
                                decoding="async"
                                class="block aspect-square w-full object-cover object-center"
                            />
                            <div class="absolute inset-0 bg-linear-to-br from-slate-950/28 via-transparent to-accent-100/10"></div>
                        </div>

                        <div
                            class="text-label-sm absolute top-3 left-3 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/95 px-4 py-2 font-semibold tracking-widest text-slate-950 shadow-lg sm:top-5 sm:left-5"
                        >
                            <span class="h-2 w-2 rounded-full bg-accent-500"></span>
                            Curated since 2012
                        </div>

                        <div
                            class="absolute inset-x-3 bottom-3 rounded-2xl border border-white/12 bg-slate-950/92 p-4 text-white shadow-xl backdrop-blur sm:inset-x-5 sm:bottom-5 sm:p-5"
                        >
                            <div class="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <span class="text-label-eyebrow-sm tracking-label font-bold text-amber-200 uppercase">
                                        Premium ecommerce
                                    </span>
                                    <div class="mt-2 flex items-end gap-2">
                                        <strong class="text-3xl leading-none sm:text-3xl">12+ years</strong>
                                        <span class="pb-0.5 text-sm text-slate-200">building confident shopping journeys</span>
                                    </div>
                                </div>
                                <span
                                    class="inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-slate-100"
                                >
                                    Based in Vilnius
                                </span>
                            </div>
                            <p class="mt-3 max-w-md text-sm leading-6 text-slate-100 sm:text-base">
                                A storefront shaped around calm discovery, dependable products, and practical service after checkout.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="rounded-3xl border border-white/80 bg-linear-to-b from-white/95 to-slate-50/95 p-6 shadow-elevated sm:p-8 xl:p-10">
                    <span
                        class="ui-badge-accent"
                    >
                        Who We Are
                    </span>

                    <h2 class="mt-4 max-w-xl text-4xl leading-none font-bold tracking-tighter text-slate-950 sm:text-5xl md:text-6xl">
                        A more refined way to discover everyday essentials.
                    </h2>

                    <p class="mt-4 max-w-2xl text-base leading-8 text-slate-700">
                        Since 2012, we have focused on combining dependable products, transparent information, and a storefront that respects
                        the shopper's time from the first scroll.
                    </p>

                    <div class="mt-8 grid gap-3 lg:grid-cols-3">
                        <article
                            v-for="(item, index) in highlights"
                            :key="item.title"
                            class="rounded-card-sm border border-slate-200/80 bg-white/90 p-4 shadow-card transition hover:-translate-y-0.5 hover:border-accent-300 hover:shadow-lg motion-reduce:transition-none"
                        >
                            <div class="flex items-center gap-3">
                                <div
                                    class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-50 text-sm font-bold text-accent-900 ring-1 ring-accent-100"
                                >
                                    0{{ index + 1 }}
                                </div>
                                <h3 class="text-base leading-6 font-semibold text-slate-950">{{ item.title }}</h3>
                            </div>
                            <p class="mt-3 text-base leading-7 text-slate-700">{{ item.text }}</p>
                        </article>
                    </div>

                    <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-slate-200/80 pt-6">
                        <p class="min-w-0 flex-1 basis-80 text-base leading-8 text-slate-700">
                            We curate a broad range of products and support customers worldwide with a practical, premium approach. The goal is
                            simple: make shopping feel confident, calm, and efficient.
                        </p>
                        <NuxtLink v-if="linkShown" to="/about" class="ui-btn-primary min-w-48 px-6"> Learn about our approach </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
