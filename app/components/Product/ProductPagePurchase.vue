<script setup lang="ts">
import type { ProductVariantDTO } from "@medusajs/types"

type ProductFact = {
    label: string
    value: string
}

defineProps<{
    variants: ProductVariantDTO[]
    selectedVariantId: string | null
    selectedVariantTitle: string
    productFacts: ProductFact[]
    selectedVariant: ProductVariantDTO | null
    inStock: boolean
    quantity: number
    maxStock: number
    adding: boolean
}>()

const emit = defineEmits<{
    (_e: "select-variant", _variantId: string): void
    (_e: "decrement"): void
    (_e: "increment"): void
    (_e: "add-to-cart"): void
}>()
</script>

<template>
    <div class="rounded-panel border border-slate-200 bg-white p-5 shadow-sm sm:rounded-4xl sm:p-7 xl:p-8">
        <div v-if="variants.length" class="grid gap-4">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span class="text-sm font-medium text-slate-500">Select option</span>
                <span class="text-sm font-semibold text-slate-900">{{ selectedVariantTitle }}</span>
            </div>
            <div class="flex flex-wrap gap-2.5">
                <button
                    v-for="variant in variants"
                    :key="variant.id"
                    type="button"
                    class="inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden motion-reduce:transition-none sm:w-auto"
                    :class="
                        variant.id === selectedVariantId
                            ? 'border-amber-300 bg-amber-50 text-slate-950 ring-1 ring-amber-100'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-amber-200 hover:text-slate-950'
                    "
                    :aria-pressed="variant.id === selectedVariantId"
                    @click="emit('select-variant', variant.id)"
                >
                    {{ variant.title }}
                </button>
            </div>
        </div>

        <div class="mt-5 grid gap-3 sm:grid-cols-3">
            <div v-for="fact in productFacts" :key="fact.label" class="rounded-[1.1rem] border border-slate-200 bg-slate-50 p-4">
                <span class="block text-[0.82rem] tracking-label-tight text-slate-500 uppercase">{{ fact.label }}</span>
                <strong class="mt-2 block text-sm leading-6 text-slate-950">{{ fact.value }}</strong>
            </div>
        </div>

        <div v-if="selectedVariant && inStock" class="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div class="grid gap-2">
                <span class="text-sm font-medium text-slate-500">Quantity</span>
                <div class="inline-flex min-h-12 items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                    <button
                        type="button"
                        class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-white hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
                        :disabled="quantity <= 1"
                        aria-label="Decrease quantity"
                        @click="emit('decrement')"
                    >
                        <span aria-hidden="true" class="text-lg leading-none">−</span>
                    </button>
                    <span class="min-w-10 text-center text-base font-semibold text-slate-950">{{ quantity }}</span>
                    <button
                        type="button"
                        class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-white hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
                        :disabled="quantity >= maxStock"
                        aria-label="Increase quantity"
                        @click="emit('increment')"
                    >
                        <span aria-hidden="true" class="text-lg leading-none">+</span>
                    </button>
                </div>
            </div>

            <button
                type="button"
                class="ui-btn-accent w-full px-6 text-base motion-reduce:transition-none sm:w-auto sm:min-w-[16rem]"
                :disabled="!selectedVariant || quantity < 1 || quantity > maxStock || adding"
                @click="emit('add-to-cart')"
            >
                {{ adding ? "Adding..." : "Add to cart" }}
            </button>
        </div>

        <div v-else class="mt-5 rounded-[1.1rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
            This variant is currently unavailable. Try another option or browse related products below.
        </div>

        <div class="mt-5 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-3">
            <div
                class="flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700"
            >
                <span
                    class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-900 ring-1 ring-amber-100"
                >
                    <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                        <path d="M3 7h11v8H3z" />
                        <path d="M14 10h3l4 4v1h-7z" />
                        <circle cx="7.5" cy="17.5" r="1.5" />
                        <circle cx="17.5" cy="17.5" r="1.5" />
                    </svg>
                </span>
                <span>Fast regional delivery</span>
            </div>
            <div
                class="flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700"
            >
                <span
                    class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-900 ring-1 ring-amber-100"
                >
                    <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                        <path d="M4 4v6h6" />
                        <path d="M20 20v-6h-6" />
                        <path d="M20 9A8 8 0 0 0 6.3 5.3L4 7" />
                        <path d="M4 15a8 8 0 0 0 13.7 3.7L20 17" />
                    </svg>
                </span>
                <span>Easy returns and exchanges</span>
            </div>
            <div
                class="flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700"
            >
                <span
                    class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-900 ring-1 ring-amber-100"
                >
                    <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                        <path d="M12 3l7 3v5c0 4.4-2.9 8.4-7 9-4.1-.6-7-4.6-7-9V6z" />
                        <path d="m9.5 12 1.7 1.7 3.3-3.4" />
                    </svg>
                </span>
                <span>Secure checkout experience</span>
            </div>
        </div>
    </div>
</template>
