<script setup lang="ts">
import type { CartLineItemDTO } from "@medusajs/types"

import TaxedLinePrice from "~/components/Cart/TaxedLinePrice.vue"
import NuxtImage from "~/components/Shared/NuxtImage.vue"
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

const productUrl = computed(() => (props.item.product_handle ? `${PRODUCT_URL_HANDLE}/${props.item.product_handle}` : "#"))

const productDescription = computed(() => props.item.product_description || "Selected item in your cart.")
const variantTitle = computed(() => props.item.variant_title || "Standard option")
const variantSku = computed(() => props.item.variant_sku || "N/A")
</script>

<template>
    <article
        class="shadow-card hover:shadow-elevated rounded-3xl border border-slate-200/80 bg-white/95 p-3 transition hover:border-amber-200/80 sm:p-4"
    >
        <div class="grid gap-3 sm:grid-cols-[7.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
            <div class="grid grid-cols-[5.75rem_minmax(0,1fr)] gap-3 sm:contents">
                <NuxtLink
                    :to="productUrl"
                    class="block overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"
                    :aria-label="`View ${props.item.product_title}`"
                >
                    <NuxtImage
                        :src="props.item.thumbnail || '/images/placeholder.png'"
                        :alt="props.item.product_title ?? ''"
                        :width="240"
                        :height="240"
                        sizes="92px sm:120px"
                        loading="lazy"
                        class="aspect-square h-full w-full object-cover"
                    />
                </NuxtLink>

                <div class="min-w-0 sm:hidden">
                    <NuxtLink
                        :to="productUrl"
                        class="line-clamp-2 text-base leading-6 font-semibold text-slate-950 transition hover:text-amber-900"
                    >
                        {{ props.item.product_title }}
                    </NuxtLink>

                    <p class="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                        {{ productDescription }}
                    </p>
                </div>
            </div>

            <div class="min-w-0">
                <div class="hidden sm:block">
                    <NuxtLink
                        :to="productUrl"
                        class="line-clamp-1 text-base leading-6 font-semibold text-slate-950 transition hover:text-amber-900"
                    >
                        {{ props.item.product_title }}
                    </NuxtLink>

                    <p class="mt-1 line-clamp-2 max-w-xl text-sm leading-6 text-slate-600">
                        {{ productDescription }}
                    </p>
                </div>

                <div class="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-500 sm:mt-2">
                    <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                        {{ variantTitle }}
                    </span>
                    <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1"> SKU: {{ variantSku }} </span>
                </div>

                <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p class="sr-only">Quantity</p>

                        <div class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1 shadow-inner">
                            <button
                                type="button"
                                class="inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                                :disabled="props.quantity <= 1"
                                :aria-label="`Decrease quantity for ${props.item.product_title}`"
                                @click="emit('decrement')"
                            >
                                −
                            </button>

                            <input
                                :value="props.quantity"
                                type="number"
                                min="1"
                                :max="props.maxQuantity"
                                inputmode="numeric"
                                class="h-9 w-10 border-0 bg-transparent px-1 text-center text-sm font-semibold text-slate-950 outline-hidden"
                                :aria-label="`Quantity for ${props.item.product_title}`"
                                @input="emit('quantityInput', $event)"
                            />

                            <button
                                type="button"
                                class="inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                                :disabled="props.quantity >= props.maxQuantity"
                                :aria-label="`Increase quantity for ${props.item.product_title}`"
                                @click="emit('increment')"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div class="sm:hidden">
                        <TaxedLinePrice :amount-with-tax="props.amountWithTax" :amount-without-tax="props.amountWithoutTax" />
                    </div>
                </div>
            </div>

            <div class="hidden min-w-32 text-right sm:grid sm:gap-3">
                <button
                    type="button"
                    class="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:outline-hidden"
                    :aria-label="`Remove ${props.item.product_title} from cart`"
                    @click="emit('remove')"
                >
                    <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                        <path d="M4 7h16M9 7V5h6v2m-7 3v7m4-7v7m4-7v7M6 7l1 12h10l1-12" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>

                <div>
                    <p class="text-label-xs tracking-label font-bold text-slate-500 uppercase">Line total</p>
                    <div class="mt-1 flex justify-end text-slate-950">
                        <TaxedLinePrice :amount-with-tax="props.amountWithTax" :amount-without-tax="props.amountWithoutTax" />
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-between border-t border-slate-200/80 pt-3 sm:hidden">
                <button
                    type="button"
                    class="inline-flex min-h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:outline-hidden"
                    :aria-label="`Remove ${props.item.product_title} from cart`"
                    @click="emit('remove')"
                >
                    Remove
                </button>
            </div>
        </div>
    </article>
</template>
