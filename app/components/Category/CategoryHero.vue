<script setup lang="ts">
import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"
import NuxtImage from "~/components/Shared/NuxtImage.vue"

const props = defineProps<{
    breadcrumbItems: { label: string; to?: string }[]
    heroEyebrow: string
    pageHeading: string
    description: string
    heroImage: string
    isAllProductsPage: boolean
}>()
</script>

<template>
    <div class="px-0 pb-8 pt-15 sm:pt-18 xl:pt-23">
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <AppBreadcrumbs :items="props.breadcrumbItems" class="mb-4" />

            <div class="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-slate-950 shadow-[0_18px_44px_rgba(8,27,90,0.12)] sm:rounded-[2rem]">
                <NuxtImage
                    :src="props.heroImage"
                    :alt="`${props.pageHeading} category image`"
                    width="1600"
                    height="720"
                    sizes="100vw xl:1280px"
                    format="webp"
                    quality="72"
                    loading="lazy"
                    decoding="async"
                    class="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div class="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.78)_0%,rgba(2,6,23,0.52)_38%,rgba(2,6,23,0.18)_68%,rgba(2,6,23,0.18)_100%)]"></div>
                <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.14)_0%,rgba(15,23,42,0.1)_40%,rgba(15,23,42,0.5)_100%)]"></div>

                <div class="relative z-10 flex min-h-[20rem] flex-col justify-between gap-8 p-4 sm:min-h-[24rem] sm:p-6 lg:min-h-[28rem]">
                    <div
                        class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/92 px-4 py-2 text-[0.78rem] font-semibold tracking-[0.08em] text-slate-950 shadow-[0_8px_20px_rgba(8,27,90,0.14)]"
                    >
                        <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                        {{ props.isAllProductsPage ? "All products" : "Category" }}
                    </div>
                    <div
                        class="max-w-3xl rounded-[1.5rem] border border-white/15 bg-slate-950/72 p-5 text-white shadow-[0_12px_30px_rgba(2,6,23,0.22)] backdrop-blur-[6px] sm:p-7"
                    >
                        <span class="inline-flex min-h-9 items-center rounded-full border border-amber-300/30 bg-amber-300/12 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-amber-100">
                            {{ props.heroEyebrow }}
                        </span>
                        <h1 class="mt-4 text-[2rem] font-bold leading-none tracking-[-0.05rem] text-white sm:text-[2.8rem] sm:leading-[0.96] lg:text-[3.6rem]">
                            {{ props.pageHeading }}
                        </h1>
                        <p class="mt-4 max-w-2xl text-sm leading-6 text-slate-100 sm:text-base sm:leading-7">
                            {{ props.description }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
