<script setup lang="ts">
import type { CategoryPriceRange } from "~/types/category-listing"

import BaseButton from "~/components/Shared/BaseButton.vue"
import { DEFAULT_CURENCY } from "~/utils/consts"
import { formatPrice } from "~/utils/formatPrice"

const props = defineProps<{
    priceRange: CategoryPriceRange
}>()

const selectedMinPrice = defineModel<number | null>("selectedMinPrice", { default: null })
const selectedMaxPrice = defineModel<number | null>("selectedMaxPrice", { default: null })

const currencyCode = computed<string>(() => props.priceRange.currencyCode?.toUpperCase() || DEFAULT_CURENCY)
const minBound = computed<number | null>(() => props.priceRange.min)
const maxBound = computed<number | null>(() => props.priceRange.max)
const hasPriceBounds = computed<boolean>(() => minBound.value !== null && maxBound.value !== null)
const hasSelectedPrice = computed<boolean>(() => selectedMinPrice.value !== null || selectedMaxPrice.value !== null)
const priceRangeLabel = computed<string>(() => {
    if (!hasPriceBounds.value || minBound.value === null || maxBound.value === null) {
        return "Price range is unavailable for these products."
    }

    return `${formatPrice(minBound.value, currencyCode.value)} to ${formatPrice(maxBound.value, currencyCode.value)}`
})

function parseInputValue(event: Event): number | null {
    if (!(event.target instanceof HTMLInputElement) || event.target.value === "") {
        return null
    }

    const value = Number(event.target.value)
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : null
}

function updateMinPrice(event: Event): void {
    selectedMinPrice.value = parseInputValue(event)
}

function updateMaxPrice(event: Event): void {
    selectedMaxPrice.value = parseInputValue(event)
}

function clearPriceRange(): void {
    selectedMinPrice.value = null
    selectedMaxPrice.value = null
}
</script>

<template>
    <div class="grid gap-4">
        <p class="text-sm leading-6 text-slate-600">
            Available prices: {{ priceRangeLabel }}
        </p>

        <div class="grid gap-3 sm:grid-cols-2">
            <label class="grid gap-1 text-sm font-semibold text-slate-700">
                <span>Minimum price</span>
                <input
                    :value="selectedMinPrice ?? ''"
                    type="number"
                    inputmode="numeric"
                    min="0"
                    :max="selectedMaxPrice ?? maxBound ?? undefined"
                    placeholder="No minimum"
                    class="min-h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-inner outline-hidden transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100 disabled:text-slate-500"
                    :disabled="!hasPriceBounds"
                    @input="updateMinPrice"
                />
            </label>

            <label class="grid gap-1 text-sm font-semibold text-slate-700">
                <span>Maximum price</span>
                <input
                    :value="selectedMaxPrice ?? ''"
                    type="number"
                    inputmode="numeric"
                    :min="selectedMinPrice ?? minBound ?? 0"
                    placeholder="No maximum"
                    class="min-h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-inner outline-hidden transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100 disabled:text-slate-500"
                    :disabled="!hasPriceBounds"
                    @input="updateMaxPrice"
                />
            </label>
        </div>

        <div v-if="hasPriceBounds" class="grid gap-3" aria-label="Price range sliders">
            <label class="grid gap-2 text-sm font-semibold text-slate-700">
                <span>Minimum slider</span>
                <input
                    :value="selectedMinPrice ?? minBound"
                    type="range"
                    :min="minBound ?? 0"
                    :max="selectedMaxPrice ?? maxBound ?? 0"
                    step="1"
                    class="h-11 w-full accent-brand-700"
                    @input="updateMinPrice"
                />
            </label>

            <label class="grid gap-2 text-sm font-semibold text-slate-700">
                <span>Maximum slider</span>
                <input
                    :value="selectedMaxPrice ?? maxBound"
                    type="range"
                    :min="selectedMinPrice ?? minBound ?? 0"
                    :max="maxBound ?? 0"
                    step="1"
                    class="h-11 w-full accent-brand-700"
                    @input="updateMaxPrice"
                />
            </label>
        </div>

        <div v-if="hasSelectedPrice" class="flex items-center justify-between gap-3 rounded-2xl bg-brand-50 px-3 py-2">
            <span class="text-sm font-semibold text-brand-800">Price filter active</span>
            <BaseButton
                type="button"
                class="inline-flex min-h-9 items-center rounded-full border border-brand-100 bg-white px-3 text-xs font-bold text-brand-800 transition hover:border-brand-200 focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:outline-hidden"
                @click="clearPriceRange"
            >
                Clear price
            </BaseButton>
        </div>
    </div>
</template>
