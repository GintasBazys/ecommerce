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
    <div class="px-0 pt-15 pb-8 sm:pt-18 xl:pt-23">
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <AppBreadcrumbs :items="props.breadcrumbItems" class="mb-4" />

            <div class="rounded-panel relative overflow-hidden border border-white/80 bg-slate-950 shadow-elevated sm:rounded-4xl">
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
                <div class="absolute inset-0 bg-linear-to-r from-slate-950/80 via-slate-950/50 to-slate-950/20"></div>
                <div class="absolute inset-0 bg-linear-to-b from-slate-950/15 via-slate-950/10 to-slate-950/50"></div>

                <div class="relative z-10 flex min-h-80 flex-col justify-between gap-8 p-4 sm:min-h-96 sm:p-6 lg:min-h-112">
                    <div
                        class="text-label-sm inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/92 px-4 py-2 font-semibold tracking-widest text-slate-950 shadow-card"
                    >
                        <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                        {{ props.isAllProductsPage ? "All products" : "Category" }}
                    </div>
                    <div
                        class="max-w-3xl rounded-3xl border border-white/15 bg-slate-950/75 p-5 text-white shadow-xl backdrop-blur-md sm:p-7"
                    >
                        <span
                            class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-300/30 bg-amber-300/12 px-4 py-2 font-bold text-amber-100 uppercase"
                        >
                            {{ props.heroEyebrow }}
                        </span>
                        <h1
                            class="mt-4 text-3xl leading-none font-bold tracking-tighter text-white sm:text-5xl lg:text-6xl"
                        >
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
