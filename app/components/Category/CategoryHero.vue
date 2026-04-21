<script setup lang="ts">
import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"
import NuxtImage from "~/components/Shared/NuxtImage.vue"

const props = defineProps<{
    breadcrumbItems: { label: string; to?: string }[]
    heroEyebrow: string
    pageHeading: string
    description: string
    heroImage: string
    browsingNotes: string[]
    isAllProductsPage: boolean
}>()
</script>

<template>
    <div class="px-0 pb-8 pt-15 sm:pt-18 xl:pt-23">
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div class="grid items-end gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] xl:gap-10">
                <div class="max-w-160 xl:pb-6">
                    <AppBreadcrumbs :items="props.breadcrumbItems" class="mb-4" />
                    <span
                        class="inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-amber-900"
                    >
                        {{ props.heroEyebrow }}
                    </span>
                    <h1
                        class="mt-4 text-[2.1rem] font-bold leading-none tracking-[-0.06rem] text-slate-950 sm:text-[2.9rem] sm:leading-[0.98] xl:max-w-[11ch] xl:text-[4.1rem] xl:leading-[0.96]"
                    >
                        {{ props.pageHeading }}
                    </h1>
                    <p class="mt-4 max-w-152 text-base leading-7 text-slate-600 sm:text-[1.05rem] sm:leading-8">
                        {{ props.description }}
                    </p>
                </div>

                <div
                    class="relative rounded-[1.75rem] border border-white/80 bg-white/90 p-3 shadow-[0_14px_34px_rgba(8,27,90,0.08)] sm:rounded-4xl sm:p-4"
                >
                    <div class="relative overflow-hidden rounded-[1.4rem] sm:rounded-[1.75rem]">
                        <NuxtImage
                            :src="props.heroImage"
                            :alt="`${props.pageHeading} category image`"
                            width="1200"
                            height="1411"
                            sizes="100vw lg:45vw"
                            format="webp"
                            quality="68"
                            loading="lazy"
                            decoding="async"
                            class="block aspect-[1.08] w-full object-cover object-center"
                        />
                        <div class="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.24),transparent_45%,rgba(255,255,255,0.08))]"></div>
                    </div>

                    <div
                        class="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 px-4 py-2 text-[0.78rem] font-semibold tracking-[0.08em] text-slate-950 shadow-[0_8px_20px_rgba(8,27,90,0.1)] sm:left-5 sm:top-5"
                    >
                        <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                        {{ props.isAllProductsPage ? "All products" : "Curated category view" }}
                    </div>

                    <div
                        class="absolute inset-x-3 bottom-3 rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.9),rgba(15,23,42,0.9))] p-4 text-white shadow-[0_10px_26px_rgba(2,6,23,0.18)] sm:inset-x-5 sm:bottom-5 sm:p-5"
                    >
                        <span class="text-[0.73rem] font-bold uppercase tracking-[0.14em] text-amber-200">Browse smarter</span>
                        <ul class="mt-4 grid gap-3">
                            <li
                                v-for="note in props.browsingNotes"
                                :key="note"
                                class="flex items-start gap-3 text-sm leading-6 text-slate-100"
                            >
                                <span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-300"></span>
                                <span>{{ note }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
