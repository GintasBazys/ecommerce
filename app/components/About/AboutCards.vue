<script setup lang="ts">
import NuxtImage from "~/components/Shared/NuxtImage.vue"

const storePillars = [
    {
        image: "/images/about_store-curated.svg",
        title: "Curated selection",
        description: "We pick practical, design-forward products that are easy to mix into daily routines."
    },
    {
        image: "/images/about_store-value.svg",
        title: "Clear value",
        description: "Every item is priced with transparent value in mind, with no clutter around the buying flow."
    },
    {
        image: "/images/about_store-delivery.svg",
        title: "Reliable delivery",
        description: "Orders move quickly, updates stay clear, and support is available when details matter."
    }
]
</script>

<template>
    <section
        class="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(1,12,128,0.07),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] py-13 sm:py-14 lg:py-22"
    >
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div class="mx-auto max-w-210 text-center">
                <span
                    class="inline-flex min-h-[2.3rem] items-center rounded-full bg-brand-100 px-4 py-2 text-label-sm font-bold uppercase tracking-label text-brand-700"
                >
                    Our Store
                </span>
                <h2
                    class="mx-auto mt-4 max-w-full text-[clamp(1.85rem,7vw,2.75rem)] font-bold leading-none tracking-[-0.05rem] text-slate-950 md:max-w-[15ch] md:text-[clamp(2rem,3.7vw,3.55rem)] md:leading-[0.98]"
                >
                    Built for shoppers who want less noise and better decisions.
                </h2>
                <p class="mx-auto mt-4 max-w-190 text-base leading-7 text-slate-600">
                    Our store is designed around clarity: thoughtful products, cleaner browsing, and a checkout flow that removes friction
                    instead of adding it.
                </p>
            </div>

            <div class="mt-8 grid gap-4 md:grid-cols-3">
                <article
                    v-for="item in storePillars"
                    :key="item.title"
                    class="grid h-full content-start justify-items-center gap-4 rounded-card border border-slate-200 bg-white/90 p-5 text-center transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_14px_38px_rgba(8,27,90,0.1)] motion-reduce:transition-none"
                >
                    <div
                        class="flex h-[5.7rem] w-[5.7rem] items-center justify-center rounded-[1.25rem] bg-[linear-gradient(145deg,rgba(1,12,128,0.08),rgba(0,128,255,0.16))]"
                    >
                        <NuxtImage
                            :src="item.image"
                            :alt="item.title"
                            width="140"
                            height="140"
                            class="h-[4.2rem] w-[4.2rem] object-contain"
                        />
                    </div>
                    <h3 class="text-[1.08rem] font-semibold leading-6 text-slate-950">{{ item.title }}</h3>
                    <p class="text-[0.94rem] leading-7 text-slate-500">{{ item.description }}</p>
                </article>
            </div>
        </div>
    </section>
</template>
