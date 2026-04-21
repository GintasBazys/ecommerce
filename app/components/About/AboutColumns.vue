<script setup lang="ts">
import NuxtImage from "~/components/Shared/NuxtImage.vue"

const approachSteps = [
    {
        title: "Select with intent",
        text: "We focus on products that are genuinely useful, durable, and easy to integrate into daily shopping habits."
    },
    {
        title: "Design for clarity",
        text: "Navigation, content, and checkout are structured so decisions feel simple and confidence stays high."
    },
    {
        title: "Support after checkout",
        text: "Delivery and service are treated as part of the product experience, not a separate afterthought."
    }
]
</script>

<template>
    <section
        class="overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(0,128,255,0.1),transparent_26%),linear-gradient(180deg,#ffffff_0%,#f6f9ff_100%)] py-[3.25rem] sm:py-14 lg:py-[5.5rem]"
    >
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div class="mx-auto mb-8 max-w-[53.75rem] text-center">
                <span
                    class="inline-flex min-h-[2.3rem] items-center rounded-full bg-brand-100 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-brand-700"
                >
                    Our Approach
                </span>
                <h2
                    class="mx-auto mt-4 max-w-full text-[clamp(1.85rem,7vw,2.75rem)] font-bold leading-[1] tracking-[-0.05rem] text-slate-950 md:max-w-[25rem] md:text-[clamp(2rem,3.7vw,3.55rem)] md:leading-[0.98] lg:max-w-[50rem]"
                >
                    A practical framework that keeps quality high and experience simple.
                </h2>
                <p class="mx-auto mt-4 max-w-[48.75rem] text-base leading-7 text-slate-600">
                    The way we operate is straightforward: curate better, communicate clearly, and keep every step from product discovery to
                    post-purchase support easy to trust.
                </p>
            </div>

            <div class="grid items-stretch gap-5 lg:grid-cols-2 xl:gap-10">
                <div>
                    <NuxtImage
                        src="/images/about-premium.jpg"
                        alt="Elegant modern living room with premium furniture and styling"
                        width="1800"
                        height="1200"
                        format="webp"
                        class="max-h-[420px] w-full rounded-[1.35rem] object-cover lg:h-full lg:max-h-none"
                    />
                </div>

                <div class="grid content-start gap-4 rounded-[1.35rem] border border-slate-200 bg-white/90 p-5 sm:p-6">
                    <h3 class="text-[1.45rem] font-semibold leading-8 text-slate-950">How we work</h3>
                    <p class="text-[0.98rem] leading-7 text-slate-600">
                        We balance product quality, transparent pricing, and speed of execution. That balance is what shapes every release,
                        campaign, and customer flow in the store.
                    </p>

                    <div class="grid gap-3">
                        <article
                            v-for="(step, index) in approachSteps"
                            :key="step.title"
                            class="grid grid-cols-[auto_1fr] gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5"
                        >
                            <span
                                class="inline-flex h-[2.1rem] w-[2.1rem] items-center justify-center rounded-full bg-[linear-gradient(135deg,#010c80_0%,#0056d6_100%)] text-[0.72rem] font-bold tracking-[0.08em] text-white"
                            >
                                0{{ index + 1 }}
                            </span>
                            <div class="min-w-0">
                                <h4 class="text-base font-semibold leading-6 text-slate-950">{{ step.title }}</h4>
                                <p class="mt-1 text-[0.92rem] leading-6 text-slate-500">{{ step.text }}</p>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
