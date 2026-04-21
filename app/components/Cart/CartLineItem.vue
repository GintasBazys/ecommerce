<script setup lang="ts">
import type { CartLineItemDTO } from "@medusajs/types"

import TaxedLinePrice from "~/components/Cart/TaxedLinePrice.vue"
import { PRODUCT_URL_HANDLE } from "~/utils/consts"

const props = defineProps<{
    item: CartLineItemDTO
    quantity: number
    maxQuantity: number
    amountWithTax: number
    amountWithoutTax: number
}>()

const emit = defineEmits<{
    remove: []
    decrement: []
    increment: []
    quantityInput: [event: Event]
}>()
</script>

<template>
    <article
        class="grid gap-4 rounded-[1.4rem] border border-slate-200/80 bg-white/90 p-4 shadow-[0_12px_30px_rgba(8,27,90,0.05)] sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-5 sm:p-5"
    >
        <NuxtLink :to="`${PRODUCT_URL_HANDLE}/${props.item.product_handle}`" class="block overflow-hidden rounded-[1.15rem] bg-slate-100">
            <NuxtImg
                :src="props.item.thumbnail || '/images/placeholder.png'"
                :alt="props.item.product_title ?? ''"
                width="240"
                height="280"
                loading="lazy"
                class="aspect-[0.86] w-full object-cover"
            />
        </NuxtLink>

        <div class="flex min-w-0 flex-col gap-4">
            <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                    <NuxtLink
                        :to="`${PRODUCT_URL_HANDLE}/${props.item.product_handle}`"
                        class="text-base font-semibold leading-6 text-slate-950 transition hover:text-brand-700"
                    >
                        {{ props.item.product_title }}
                    </NuxtLink>
                    <p class="mt-2 text-sm leading-6 text-slate-600">{{ props.item.product_description }}</p>
                    <div class="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                        <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                            Option: {{ props.item.variant_title || "Standard option" }}
                        </span>
                        <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                            Code: {{ props.item.variant_sku ?? "N/A" }}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:text-rose-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-200"
                    aria-label="Remove item"
                    @click="emit('remove')"
                >
                    <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                        <path d="M4 7h16M9 7V5h6v2m-7 3v7m4-7v7m4-7v7M6 7l1 12h10l1-12" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
            </div>

            <div class="grid gap-4 md:grid-cols-[auto_1fr] md:items-end md:justify-between">
                <div>
                    <p class="text-[0.78rem] font-bold uppercase tracking-[0.14em] text-slate-500">Quantity</p>
                    <div class="mt-2 inline-flex items-center rounded-full border border-slate-200 bg-slate-50/90 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                        <button
                            type="button"
                            class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-700 transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                            :disabled="props.quantity <= 1"
                            :aria-label="`Decrease quantity for ${props.item.product_title}`"
                            @click="emit('decrement')"
                        >
                            -
                        </button>
                        <input
                            :value="props.quantity"
                            type="number"
                            min="1"
                            inputmode="numeric"
                            class="w-14 border-0 bg-transparent px-1 text-center text-sm font-semibold text-slate-950 outline-hidden"
                            :aria-label="`Quantity for ${props.item.product_title}`"
                            @input="emit('quantityInput', $event)"
                        />
                        <button
                            type="button"
                            class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-700 transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                            :disabled="props.quantity >= props.maxQuantity"
                            :aria-label="`Increase quantity for ${props.item.product_title}`"
                            @click="emit('increment')"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div class="md:justify-self-end md:text-right">
                    <p class="text-[0.78rem] font-bold uppercase tracking-[0.14em] text-slate-500">Line total</p>
                    <div class="mt-2 text-slate-950 md:[&_.taxed-line-price]:justify-items-end">
                        <TaxedLinePrice :amount-with-tax="props.amountWithTax" :amount-without-tax="props.amountWithoutTax" />
                    </div>
                </div>
            </div>
        </div>
    </article>
</template>
