<script setup lang="ts">
import type { ProductVariantDTO } from "@medusajs/types"

import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"

type BreadcrumbItem = {
    label: string
    to?: string
}

type ProductTag = {
    id?: string | null
    value?: string | null
}

defineProps<{
    breadcrumbItems: BreadcrumbItem[]
    displayedReviewAverage: number | null
    productTitle: string
    productSubtitle?: string | null
    productDescription: string
    productTags: ProductTag[]
    selectedVariant: ProductVariantDTO | null
    displayPrice: string
    originalPrice: string | null
    isOnSale: boolean
    taxLabel: string
    inStock: boolean
}>()
</script>

<template>
    <div class="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:rounded-4xl sm:p-7 xl:p-8">
        <div class="flex flex-col gap-4 sm:gap-5">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <AppBreadcrumbs :items="breadcrumbItems" class="mb-4" />
                    <span class="inline-flex min-h-9 items-center rounded-full bg-brand-100 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-brand-700">
                        Product detail
                    </span>
                </div>
                <div
                    v-if="displayedReviewAverage"
                    class="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900"
                    aria-label="Product rating"
                >
                    <span class="flex items-center gap-1 text-[0.95rem] text-amber-500" aria-hidden="true">
                        <span v-for="star in 5" :key="star">{{ star <= Math.round(displayedReviewAverage) ? "★" : "☆" }}</span>
                    </span>
                    <span>{{ displayedReviewAverage }} / 5</span>
                </div>
            </div>

            <div>
                <h1 class="max-w-[12ch] text-[2.2rem] font-bold leading-[0.96] tracking-[-0.06rem] text-slate-950 sm:text-[3.1rem] xl:text-[4.25rem]">
                    {{ productTitle }}
                </h1>
                <p v-if="productSubtitle" class="mt-3 text-sm font-semibold uppercase tracking-widest text-slate-700">
                    {{ productSubtitle }}
                </p>
                <p class="mt-4 max-w-2xl text-[0.98rem] leading-7 text-slate-600 sm:text-base sm:leading-8">
                    {{ productDescription }}
                </p>
            </div>

            <div v-if="productTags.length" class="flex flex-wrap gap-2">
                <span
                    v-for="(tag, index) in productTags"
                    :key="tag.id || `${tag.value || 'tag'}-${index}`"
                    class="inline-flex min-h-9 items-center rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm font-medium text-slate-700"
                >
                    {{ tag.value }}
                </span>
            </div>

            <div v-if="selectedVariant" class="border-t border-slate-200 pt-5">
                <div class="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                    <span class="text-[2rem] font-bold leading-none text-slate-950 sm:text-[2.5rem]">{{ displayPrice }}</span>
                    <del v-if="isOnSale && originalPrice" class="text-base font-semibold text-rose-500">{{ originalPrice }}</del>
                </div>
                <p class="mt-3 text-sm leading-6 text-slate-500">{{ taxLabel }}</p>
                <p class="mt-2 text-sm font-semibold" :class="inStock ? 'text-emerald-700' : 'text-rose-600'">
                    {{ inStock ? "Ready to ship" : "Currently unavailable" }}
                </p>
            </div>
        </div>
    </div>
</template>
