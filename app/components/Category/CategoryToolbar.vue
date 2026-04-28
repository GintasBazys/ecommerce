<script setup lang="ts">
import type { CategorySortOption } from "~/types/category-listing"

import BaseSelect from "~/components/Shared/BaseSelect.vue"

const props = defineProps<{
    totalCount: number
    sortLoading: boolean
    filterLoading: boolean
    loading: boolean
    gridIsInitialLoading: boolean
    currentPage: number
    activeFilterCount: number
    sortOptions: CategorySortOption[]
}>()

const sortOption = defineModel<string>("sortOption", { required: true })

const emit = defineEmits<{
    openFilters: []
}>()
</script>

<template>
    <div class="mb-4 rounded-3xl border border-white/80 bg-linear-to-b from-white to-slate-50 p-4 shadow-panel sm:p-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="min-w-0">
                <span class="block text-lg font-bold text-slate-950">{{ props.totalCount }} products</span>
                <p class="mt-1 text-sm leading-6 text-slate-600">
                    <template v-if="props.sortLoading">Updating sort order...</template>
                    <template v-else-if="props.filterLoading">Refreshing filtered results...</template>
                    <template v-else-if="props.loading && !props.gridIsInitialLoading">Loading page {{ props.currentPage }}...</template>
                    <template v-else-if="props.activeFilterCount">{{ props.activeFilterCount }} active filters</template>
                    <template v-else>Medusa-backed filters for categories, collections, types, tags, stock, and price.</template>
                </p>
            </div>
            <div class="grid gap-3 sm:grid-cols-2 sm:items-end lg:justify-end">
                <button
                    type="button"
                    class="inline-flex min-h-11 items-center justify-center gap-2 self-end rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-card xl:hidden"
                    @click="emit('openFilters')"
                >
                    <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" stroke="currentColor" stroke-width="1.8">
                        <path d="M3 5H17" stroke-linecap="round" />
                        <path d="M6 10H14" stroke-linecap="round" />
                        <path d="M8 15H12" stroke-linecap="round" />
                    </svg>
                    <span>{{ props.activeFilterCount ? `Filters (${props.activeFilterCount})` : "Filters" }}</span>
                </button>
                <label class="grid gap-1 text-sm font-semibold text-slate-700">
                    <span>Sort by</span>
                    <span class="w-full sm:min-w-60 lg:max-w-68">
                        <BaseSelect v-model="sortOption" :options="props.sortOptions" option-label-key="text" :disabled="props.loading" />
                    </span>
                </label>
            </div>
        </div>
    </div>
</template>
