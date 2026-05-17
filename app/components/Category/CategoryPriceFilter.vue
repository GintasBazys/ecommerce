<script setup lang="ts">
import type { CategoryPriceRange } from "~/types/category-listing"

import BaseButton from "~/components/Shared/BaseButton.vue"
import { DEFAULT_CURENCY } from "~/utils/consts"
import { formatPrice } from "~/utils/formatPrice"

const props = defineProps<{
    priceRange: CategoryPriceRange
}>()

type PricePreset = {
    id: string
    label: string
    min: number | null
    max: number | null
}

const selectedMinPrice = defineModel<number | null>("selectedMinPrice", { default: null })
const selectedMaxPrice = defineModel<number | null>("selectedMaxPrice", { default: null })

const currencyCode = computed<string>(() => props.priceRange.currencyCode?.toUpperCase() || DEFAULT_CURENCY)
const minBound = computed<number | null>(() => props.priceRange.min)
const maxBound = computed<number | null>(() => props.priceRange.max)
const hasPriceBounds = computed<boolean>(() => minBound.value !== null && maxBound.value !== null)
const hasSelectedPrice = computed<boolean>(() => selectedMinPrice.value !== null || selectedMaxPrice.value !== null)
const selectedPriceLabel = computed<string>(() => {
    if (selectedMinPrice.value !== null && selectedMaxPrice.value !== null) {
        return `${formatPrice(selectedMinPrice.value, currencyCode.value)} to ${formatPrice(selectedMaxPrice.value, currencyCode.value)}`
    }

    if (selectedMinPrice.value !== null) {
        return `From ${formatPrice(selectedMinPrice.value, currencyCode.value)}`
    }

    if (selectedMaxPrice.value !== null) {
        return `Up to ${formatPrice(selectedMaxPrice.value, currencyCode.value)}`
    }

    return "No price limit selected"
})
const priceRangeLabel = computed<string>(() => {
    if (!hasPriceBounds.value || minBound.value === null || maxBound.value === null) {
        return "Price range is unavailable for these products."
    }

    return `${formatPrice(minBound.value, currencyCode.value)} to ${formatPrice(maxBound.value, currencyCode.value)}`
})
const pricePresets = computed<PricePreset[]>(() => {
    if (!hasPriceBounds.value || minBound.value === null || maxBound.value === null) {
        return []
    }

    const span = maxBound.value - minBound.value

    if (span < 3) {
        return []
    }

    const firstBreak = Math.floor(minBound.value + span / 3)
    const secondBreak = Math.ceil(minBound.value + (span * 2) / 3)

    if (firstBreak <= minBound.value || secondBreak >= maxBound.value || firstBreak >= secondBreak) {
        return []
    }

    return [
        {
            id: "price-low",
            label: `Under ${formatPrice(firstBreak, currencyCode.value)}`,
            min: null,
            max: firstBreak
        },
        {
            id: "price-mid",
            label: `${formatPrice(firstBreak, currencyCode.value)} - ${formatPrice(secondBreak, currencyCode.value)}`,
            min: firstBreak,
            max: secondBreak
        },
        {
            id: "price-high",
            label: `Over ${formatPrice(secondBreak, currencyCode.value)}`,
            min: secondBreak,
            max: null
        }
    ]
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

function applyPreset(preset: PricePreset): void {
    selectedMinPrice.value = preset.min
    selectedMaxPrice.value = preset.max
}

function isPresetSelected(preset: PricePreset): boolean {
    return selectedMinPrice.value === preset.min && selectedMaxPrice.value === preset.max
}
</script>

<template>
    <div class="grid gap-4">
        <p class="min-w-0 break-words text-sm leading-6 text-slate-600">
            Available prices: {{ priceRangeLabel }}
        </p>

        <div class="grid min-w-0 gap-3 sm:grid-cols-2">
            <label class="grid min-w-0 gap-1 text-sm font-semibold text-slate-700">
                <span>Minimum price</span>
                <input
                    :value="selectedMinPrice ?? ''"
                    type="number"
                    inputmode="numeric"
                    min="0"
                    :max="selectedMaxPrice ?? maxBound ?? undefined"
                    placeholder="No minimum"
                    class="min-h-11 min-w-0 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-inner outline-hidden transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100 disabled:text-slate-500"
                    :disabled="!hasPriceBounds"
                    @input="updateMinPrice"
                />
            </label>

            <label class="grid min-w-0 gap-1 text-sm font-semibold text-slate-700">
                <span>Maximum price</span>
                <input
                    :value="selectedMaxPrice ?? ''"
                    type="number"
                    inputmode="numeric"
                    :min="selectedMinPrice ?? minBound ?? 0"
                    placeholder="No maximum"
                    class="min-h-11 min-w-0 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-inner outline-hidden transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100 disabled:text-slate-500"
                    :disabled="!hasPriceBounds"
                    @input="updateMaxPrice"
                />
            </label>
        </div>

        <div v-if="pricePresets.length" class="grid gap-3" aria-label="Quick price filters">
            <span class="text-sm font-semibold text-slate-700">Popular price ranges</span>
            <div class="grid gap-2">
                <BaseButton
                    v-for="preset in pricePresets"
                    :key="preset.id"
                    type="button"
                    class="inline-flex min-h-11 min-w-0 items-center justify-between rounded-2xl border px-4 text-left text-sm font-bold transition focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:outline-hidden"
                    :class="
                        isPresetSelected(preset)
                            ? 'border-brand-200 bg-brand-50 text-brand-800 shadow-inner'
                            : 'border-slate-200 bg-white text-slate-800 shadow-inner hover:border-brand-200 hover:text-brand-800'
                    "
                    :aria-pressed="isPresetSelected(preset)"
                    @click="applyPreset(preset)"
                >
                    <span class="min-w-0 break-words">{{ preset.label }}</span>
                    <span
                        v-if="isPresetSelected(preset)"
                        class="ml-3 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white"
                        aria-hidden="true"
                    >
                        <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" stroke="currentColor" stroke-width="2">
                            <path d="M5 10.5L8.5 14L15 6" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </span>
                </BaseButton>
            </div>
        </div>

        <div v-if="hasSelectedPrice" class="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-50 px-3 py-2">
            <span class="min-w-0 break-words text-sm font-semibold text-brand-800">{{ selectedPriceLabel }}</span>
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
