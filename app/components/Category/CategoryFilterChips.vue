<script setup lang="ts">
import type { ActiveCategoryFilterChip } from "~/types/category-listing"

import BaseButton from "~/components/Shared/BaseButton.vue"

defineProps<{
    chips: ActiveCategoryFilterChip[]
    activeFilterCount: number
}>()

const emit = defineEmits<{
    remove: [chip: ActiveCategoryFilterChip]
    clearAll: []
}>()
</script>

<template>
    <section
        v-if="chips.length"
        class="mb-5 rounded-3xl border border-white/80 bg-white/90 p-4 shadow-card ring-1 ring-slate-900/5 sm:p-5"
        aria-labelledby="active-category-filters-title"
    >
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="min-w-0">
                <h2 id="active-category-filters-title" class="text-sm font-bold tracking-tight text-slate-950">
                    Active filters
                </h2>
                <p class="mt-1 text-sm leading-6 text-slate-600">
                    {{ activeFilterCount }} {{ activeFilterCount === 1 ? "filter is" : "filters are" }} refining this listing.
                </p>
            </div>

            <BaseButton
                type="button"
                class="inline-flex min-h-11 items-center justify-center self-start rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-brand-200 hover:text-brand-800 focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:outline-hidden lg:self-center"
                @click="emit('clearAll')"
            >
                Clear all
            </BaseButton>
        </div>

        <ul class="mt-4 flex flex-wrap gap-2" aria-label="Selected category filters">
            <li v-for="chip in chips" :key="chip.id" class="min-w-0">
                <BaseButton
                    type="button"
                    class="group inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 text-sm font-bold text-brand-800 shadow-inner transition hover:border-brand-200 hover:bg-white hover:text-brand-900 focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:outline-hidden"
                    :aria-label="`Remove ${chip.label} filter`"
                    @click="emit('remove', chip)"
                >
                    <span class="truncate">{{ chip.label }}</span>
                    <span
                        class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-brand-700 transition group-hover:bg-brand-100"
                        aria-hidden="true"
                    >
                        <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" stroke="currentColor" stroke-width="1.8">
                            <path d="M6 6L14 14" stroke-linecap="round" />
                            <path d="M14 6L6 14" stroke-linecap="round" />
                        </svg>
                    </span>
                </BaseButton>
            </li>
        </ul>
    </section>
</template>
