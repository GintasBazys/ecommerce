<script setup lang="ts">
import NuxtImage from "~/components/Shared/NuxtImage.vue"

defineProps<{
    linkShown?: boolean
    extraSpacerClass?: string
}>()

const highlights = [
    {
        title: "Curated since 2012",
        text: "Selected for quality, utility, and everyday appeal."
    },
    {
        title: "Global delivery",
        text: "International shipping with a smoother, lower-friction journey."
    },
    {
        title: "Human support",
        text: "Direct, practical help before and after purchase."
    }
]
</script>

<template>
    <section :class="extraSpacerClass" class="overflow-hidden bg-linear-to-b from-slate-50 to-slate-100 py-14 sm:py-16 lg:py-20">
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div class="grid items-center gap-8 pb-8 xl:grid-cols-2 xl:gap-10">
                <div class="xl:pr-4">
                    <div
                        class="relative rounded-3xl border border-white/80 bg-linear-to-b from-white/95 to-slate-50/90 p-3 pb-20 shadow-xl sm:rounded-4xl sm:p-4 sm:pb-24"
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
                            <div class="absolute inset-0 bg-linear-to-br from-slate-950/20 via-transparent to-white/10"></div>
                        </div>

                        <div
                            class="text-label-sm absolute top-3 left-3 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/95 px-4 py-2 font-semibold tracking-widest text-slate-950 shadow-lg sm:top-5 sm:left-5"
                        >
                            <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                            Trusted since 2012
                        </div>

                        <div
                            class="absolute inset-x-3 bottom-3 rounded-2xl border border-white/10 bg-slate-900/90 p-4 text-white shadow-xl sm:inset-x-5 sm:bottom-5 sm:p-5"
                        >
                            <div class="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <span class="text-label-eyebrow-sm tracking-label font-bold text-amber-200 uppercase">
                                        Trusted ecommerce
                                    </span>
                                    <div class="mt-2 flex items-end gap-2">
                                        <strong class="text-3xl leading-none sm:text-3xl">12+ years</strong>
                                        <span class="pb-0.5 text-sm text-slate-200">of curated retail experience</span>
                                    </div>
                                </div>
                                <span
                                    class="inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-slate-100"
                                >
                                    Based in Vilnius
                                </span>
                            </div>
                            <p class="mt-3 max-w-md text-sm leading-6 text-slate-100 sm:text-base">
                                Building a smoother shopping experience with dependable products, practical service, and faster decisions at
                                every step.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="rounded-3xl border border-white/80 bg-linear-to-b from-white/95 to-slate-50/90 p-6 shadow-xl sm:p-8 xl:p-10">
                    <span
                        class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                    >
                        Who We Are
                    </span>

                    <h2 class="mt-4 max-w-sm text-4xl leading-none font-bold tracking-tighter text-slate-950 sm:text-5xl md:text-6xl">
                        A cleaner,
                        <span class="text-accent-700 block font-medium tracking-tight italic"> more thoughtful </span>
                        online store experience.
                    </h2>

                    <p class="mt-4 max-w-2xl text-base leading-8 text-slate-700">
                        Since 2012, we have focused on combining dependable products, fast fulfillment, and a storefront that feels easy to
                        browse from the first scroll.
                    </p>

                    <div class="mt-8 grid gap-3 xl:grid-cols-3">
                        <article
                            v-for="(item, index) in highlights"
                            :key="item.title"
                            class="rounded-card-sm border border-slate-200/80 bg-white/90 p-4 transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-lg motion-reduce:transition-none"
                        >
                            <div class="flex items-center gap-3">
                                <div
                                    class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-sm font-bold text-amber-900 ring-1 ring-amber-100"
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
                            We curate a broad range of products and support customers worldwide with a practical, friendly approach. The
                            goal is simple: make shopping feel confident, calm, and efficient.
                        </p>
                        <NuxtLink v-if="linkShown" to="/about" class="ui-btn-primary min-w-48 px-6"> Learn about our approach </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
