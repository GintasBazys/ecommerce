<script setup lang="ts">
import NuxtImage from "~/components/Shared/NuxtImage.vue"

const approachSteps = [
    {
        title: "Curate with restraint",
        text: "We prioritize products that feel useful, durable, and easy to understand without overwhelming the shopper."
    },
    {
        title: "Present with clarity",
        text: "Product content, pricing, and delivery information are structured so decisions stay simple and confident."
    },
    {
        title: "Support beyond checkout",
        text: "Order updates, delivery details, and customer care remain part of the same polished shopping experience."
    }
]
</script>

<template>
    <section class="overflow-hidden bg-linear-to-b from-white via-brand-50/60 to-white py-13 sm:py-14 lg:py-22">
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div class="mx-auto mb-8 max-w-215 text-center">
                <span class="ui-badge-brand">
                    Our Approach
                </span>
                <h2
                    class="mx-auto mt-4 max-w-full text-3xl leading-none font-bold tracking-tighter text-slate-950 sm:text-4xl md:max-w-100 md:text-5xl lg:max-w-200 xl:text-6xl"
                >
                    Premium retail standards, applied to every step of the journey.
                </h2>
                <p class="mx-auto mt-4 max-w-195 text-base leading-7 text-slate-600">
                    Our operating model is simple: curate with care, communicate clearly, and keep every step from product discovery to
                    post-purchase support easy to trust.
                </p>
            </div>

            <div class="grid items-stretch gap-5 lg:grid-cols-2 xl:gap-10">
                <div class="relative">
                    <div class="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-accent-300/20 blur-2xl"></div>
                    <NuxtImage
                        src="/images/about/about-premium.jpg"
                        alt="Elegant modern living room with premium furniture and styling"
                        width="1800"
                        height="1200"
                        format="webp"
                        sizes="(max-width: 1023px) 92vw, 620px"
                        densities="x1"
                        quality="70"
                        class="relative rounded-card max-h-105 w-full border border-white shadow-elevated object-cover lg:h-full lg:max-h-none"
                    />
                </div>

                <div class="rounded-card grid content-start gap-5 border border-slate-200/80 bg-white/95 p-5 shadow-panel sm:p-6 lg:p-8">
                    <div>
                        <span class="text-label-xs tracking-label font-bold text-accent-700 uppercase">Inside the store</span>
                        <h3 class="mt-2 text-2xl leading-8 font-semibold text-slate-950 sm:text-3xl">How we work</h3>
                    </div>
                    <p class="text-base leading-7 text-slate-600">
                        We balance product quality, transparent pricing, and fast execution. That balance shapes every category, campaign, and
                        customer flow in the store.
                    </p>

                    <div class="grid gap-3">
                        <article
                            v-for="(step, index) in approachSteps"
                            :key="step.title"
                            class="flex gap-3 rounded-2xl border border-slate-200 bg-linear-to-br from-white to-slate-50 p-4 shadow-card"
                        >
                            <span
                                class="text-label-xs inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 font-bold tracking-widest text-accent-100"
                            >
                                0{{ index + 1 }}
                            </span>
                            <div class="min-w-0">
                                <h4 class="text-base leading-6 font-semibold text-slate-950">{{ step.title }}</h4>
                                <p class="mt-1 text-sm leading-6 text-slate-500">{{ step.text }}</p>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
