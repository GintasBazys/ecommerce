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
    <section :class="extraSpacerClass" class="about-section overflow-hidden py-14 sm:py-16 lg:py-20">
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div class="grid items-center gap-8 pb-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:gap-10">
                <div class="xl:pr-4">
                    <div class="about-visual relative rounded-[1.6rem] p-3 pb-20 sm:rounded-[2rem] sm:p-4 sm:pb-24">
                        <div class="relative overflow-hidden rounded-[1.35rem] sm:rounded-[1.75rem]">
                            <NuxtImage
                                src="/images/hero-main.jpg"
                                alt="Editorial lifestyle arrangement of curated home products"
                                width="1200"
                                height="1411"
                                sizes="100vw lg:45vw"
                                format="webp"
                                quality="68"
                                loading="lazy"
                                decoding="async"
                                class="block aspect-[1.08] w-full object-cover object-center"
                            />
                            <div class="about-visual__overlay absolute inset-0"></div>
                        </div>

                        <div
                            class="about-badge text-label-sm absolute top-3 left-3 inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold tracking-[0.08em] text-slate-950 sm:top-5 sm:left-5"
                        >
                            <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                            Trusted since 2012
                        </div>

                        <div
                            class="about-summary absolute inset-x-3 bottom-3 rounded-[1.3rem] p-4 text-white sm:inset-x-5 sm:bottom-5 sm:p-5"
                        >
                            <div class="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <span class="text-label-eyebrow-sm tracking-label font-bold text-amber-200 uppercase">
                                        Trusted ecommerce
                                    </span>
                                    <div class="mt-2 flex items-end gap-2">
                                        <strong class="text-3xl leading-none sm:text-[2rem]">12+ years</strong>
                                        <span class="pb-0.5 text-sm text-slate-200">of curated retail experience</span>
                                    </div>
                                </div>
                                <span
                                    class="inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-slate-100"
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

                <div class="about-copy rounded-[1.8rem] p-6 sm:p-8 xl:p-10">
                    <span
                        class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                    >
                        Who We Are
                    </span>

                    <h2
                        class="mt-4 max-w-[10ch] text-[clamp(1.9rem,8vw,2.6rem)] leading-[1] font-bold tracking-[-0.06rem] text-slate-950 md:text-[clamp(2.25rem,4vw,3.6rem)] md:leading-[0.95]"
                    >
                        A cleaner,
                        <span class="block font-medium tracking-[-0.04rem] text-[#8a6a2f] italic"> more thoughtful </span>
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
                            class="about-highlight rounded-card-sm border border-slate-200/80 p-4 motion-reduce:transition-none"
                        >
                            <div class="flex items-center gap-3">
                                <div
                                    class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-sm font-bold text-amber-900 ring-1 ring-amber-100"
                                >
                                    0{{ index + 1 }}
                                </div>
                                <h3 class="text-base leading-6 font-semibold text-slate-950">{{ item.title }}</h3>
                            </div>
                            <p class="mt-3 text-[0.95rem] leading-7 text-slate-700">{{ item.text }}</p>
                        </article>
                    </div>

                    <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-slate-200/80 pt-6">
                        <p class="min-w-0 flex-1 basis-[22rem] text-[1rem] leading-[1.8] text-slate-700 sm:text-base sm:leading-8">
                            We curate a broad range of products and support customers worldwide with a practical, friendly approach. The
                            goal is simple: make shopping feel confident, calm, and efficient.
                        </p>
                        <NuxtLink v-if="linkShown" to="/about" class="ui-btn-primary min-w-[12rem] px-6">
                            Learn about our approach
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped lang="scss">
.about-section {
    background:
        radial-gradient(circle at top left, rgba(15, 23, 42, 0.05), transparent 22%), linear-gradient(180deg, #fcfdff 0%, #f6f8fc 100%);
}

.about-visual {
    border: 1px solid rgba(255, 255, 255, 0.8);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
    box-shadow: 0 14px 34px rgba(8, 27, 90, 0.08);
}

.about-visual__overlay {
    background: linear-gradient(135deg, rgba(2, 6, 23, 0.18), transparent 45%, rgba(255, 255, 255, 0.08));
}

.about-badge {
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 8px 20px rgba(8, 27, 90, 0.1);
}

.about-summary {
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: linear-gradient(180deg, rgba(2, 6, 23, 0.9), rgba(15, 23, 42, 0.9));
    box-shadow: 0 10px 26px rgba(2, 6, 23, 0.18);
}

.about-copy {
    border: 1px solid rgba(255, 255, 255, 0.82);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95));
    box-shadow: 0 14px 36px rgba(8, 27, 90, 0.06);
}

.about-highlight {
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 6px 18px rgba(8, 27, 90, 0.04);
    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        transform 0.2s ease;
}

.about-highlight:hover {
    border-color: rgb(253 230 138 / 0.9);
    box-shadow: 0 10px 24px rgba(8, 27, 90, 0.08);
    transform: translateY(-1px);
}

@media (hover: none), (pointer: coarse), (max-width: 1024px) {
    .about-section {
        background: linear-gradient(180deg, #fcfdff 0%, #f6f8fc 100%);
    }

    .about-visual,
    .about-copy {
        box-shadow: 0 8px 20px rgba(8, 27, 90, 0.05);
    }

    .about-badge,
    .about-summary,
    .about-highlight {
        box-shadow: none;
    }

    .about-highlight:hover {
        transform: none;
        box-shadow: none;
    }
}
</style>
