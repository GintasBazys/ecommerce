<script setup lang="ts">
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
    <section
        :class="extraSpacerClass"
        class="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.12),transparent_22%),linear-gradient(180deg,#fcfdff_0%,#f6f8fc_100%)] py-14 sm:py-16 lg:py-20"
    >
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div class="grid items-center gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:gap-10 pb-8">
                <div class="xl:pr-4">
                    <div
                        class="relative rounded-[1.6rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] p-3 pb-20 shadow-[0_28px_80px_rgba(8,27,90,0.12)] backdrop-blur sm:rounded-[2.2rem] sm:p-4 sm:pb-24"
                    >
                        <div
                            class="absolute inset-x-6 top-6 h-24 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.22),transparent_72%)] blur-2xl sm:inset-x-10"
                            aria-hidden="true"
                        ></div>
                        <div
                            class="relative overflow-hidden rounded-[1.35rem] bg-[linear-gradient(160deg,rgba(15,23,42,0.06),rgba(148,163,184,0.08))] sm:rounded-[1.85rem]"
                        >
                            <NuxtImage
                                src="/images/hero-main.jpg"
                                alt="Editorial lifestyle arrangement of curated home products"
                                width="1200"
                                height="1411"
                                sizes="100vw lg:45vw"
                                format="webp"
                                quality="72"
                                loading="lazy"
                                decoding="async"
                                class="block aspect-[1.08] w-full object-cover object-center"
                            />
                            <div class="absolute inset-0 bg-gradient-to-tr from-[#020617]/28 via-transparent to-white/10"></div>
                        </div>
                        <div
                            class="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 py-2 text-[0.78rem] font-semibold tracking-[0.08em] text-slate-950 shadow-[0_12px_32px_rgba(8,27,90,0.16)] sm:left-5 sm:top-5"
                        >
                            <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                            Trusted since 2012
                        </div>
                        <div
                            class="absolute inset-x-3 bottom-3 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.94),rgba(15,23,42,0.92))] p-4 text-white shadow-[0_16px_44px_rgba(2,6,23,0.3)] backdrop-blur-xl sm:inset-x-5 sm:bottom-5 sm:p-5"
                        >
                            <div class="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <span class="text-[0.73rem] font-bold uppercase tracking-[0.14em] text-amber-200"
                                    >Trusted ecommerce</span
                                    >
                                    <div class="mt-2 flex items-end gap-2">
                                        <strong class="text-3xl leading-none sm:text-[2rem]">12+ years</strong>
                                        <span class="pb-0.5 text-sm text-slate-200">of curated retail experience</span>
                                    </div>
                                </div>
                                <span
                                    class="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100"
                                >
                                    Based in Vilnius
                                </span>
                            </div>
                            <p class="mt-3 max-w-[26rem] text-sm leading-6 text-slate-100 sm:text-[0.95rem]">
                                Building a smoother shopping experience with dependable products, practical service, and faster decisions at
                                every step.
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    class="rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-6 shadow-[0_28px_80px_rgba(8,27,90,0.08)] backdrop-blur sm:p-8 xl:p-10"
                >
                    <span
                        class="inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-amber-900"
                    >
                        Who We Are
                    </span>
                    <h2
                        class="mt-4 max-w-[10ch] text-[clamp(1.9rem,8vw,2.6rem)] font-bold leading-[1] tracking-[-0.06rem] text-slate-950 md:text-[clamp(2.25rem,4vw,3.6rem)] md:leading-[0.95]"
                    >
                        A cleaner,
                        <span class="block font-medium italic tracking-[-0.04rem] text-[#8a6a2f]">
                            more thoughtful
                        </span>
                        online store experience.
                    </h2>
                    <p class="mt-4 max-w-[34rem] text-[1rem] leading-[1.8] text-slate-700 sm:text-[1.05rem] sm:leading-8">
                        Since 2012, we have focused on combining dependable products, fast fulfillment, and a storefront that feels easy to
                        browse from the first scroll.
                    </p>

                    <div class="mt-8 grid gap-3 xl:grid-cols-3">
                        <article
                            v-for="(item, index) in highlights"
                            :key="item.title"
                            class="rounded-[1.25rem] border border-slate-200/80 bg-white p-4 shadow-[0_12px_30px_rgba(8,27,90,0.04)] transition hover:border-amber-200 hover:shadow-[0_18px_42px_rgba(8,27,90,0.1)] motion-reduce:transition-none"
                        >
                            <div class="flex items-center gap-3">
                                <div
                                    class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-sm font-bold text-amber-900 ring-1 ring-amber-100"
                                >
                                    0{{ index + 1 }}
                                </div>
                                <h3 class="text-base font-semibold leading-6 text-slate-950">{{ item.title }}</h3>
                            </div>
                            <p class="mt-3 text-[0.95rem] leading-7 text-slate-700">{{ item.text }}</p>
                        </article>
                    </div>

                    <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-slate-200/80 pt-6">
                        <p class="min-w-0 flex-1 basis-[22rem] text-[1rem] leading-[1.8] text-slate-700 sm:text-base sm:leading-8">
                            We curate a broad range of products and support customers worldwide with a practical, friendly approach. The
                            goal is simple: make shopping feel confident, calm, and efficient.
                        </p>
                        <NuxtLink v-if="linkShown" to="/about" class="ui-btn-primary min-w-[12rem] px-6">Learn about our approach</NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
