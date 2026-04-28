<script setup lang="ts">
import type { CategoryProduct } from "~/types/category-listing"

const props = defineProps<{
    loading: boolean
    gridIsInitialLoading: boolean
    products: CategoryProduct[]
    emptyStateText: string
}>()

const emit = defineEmits<{
    clearAll: []
}>()
</script>

<template>
    <div v-if="props.loading" class="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div class="bg-brand-700 h-full w-1/3 animate-pulse rounded-full"></div>
    </div>

    <div v-if="props.gridIsInitialLoading" class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <div
            v-for="n in 6"
            :key="n"
            class="overflow-hidden rounded-card-sm border border-slate-200 bg-white p-3 shadow-card"
        >
            <div class="aspect-square w-full animate-pulse rounded-2xl bg-slate-200"></div>
            <div class="mt-3 h-4 w-2/3 animate-pulse rounded bg-slate-200"></div>
            <div class="mt-2 h-3 w-5/6 animate-pulse rounded bg-slate-200"></div>
            <div class="mt-4 h-9 w-full animate-pulse rounded-full bg-slate-200"></div>
        </div>
    </div>

    <div v-else-if="props.products.length" class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <div v-for="product in props.products" :key="product.id" class="min-w-0">
            <ProductCard :product="product" compact />
        </div>
    </div>

    <div
        v-else
        class="grid justify-items-center gap-3 rounded-3xl border border-white/80 bg-linear-to-b from-white to-slate-50 px-6 py-8 text-center shadow-panel"
    >
        <h2 class="text-2xl leading-tight font-semibold text-slate-950">No products match these filters.</h2>
        <p class="max-w-120 text-sm leading-6 text-slate-600">{{ props.emptyStateText }}</p>
        <button type="button" class="ui-btn-accent" @click="emit('clearAll')">Reset filters</button>
    </div>
</template>
