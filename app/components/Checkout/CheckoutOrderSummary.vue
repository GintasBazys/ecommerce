<script setup lang="ts">
import type { CartLineItemDTO } from "@medusajs/types"

import TaxedLinePrice from "~/components/Cart/TaxedLinePrice.vue"
import { formatPrice } from "~/utils/formatPrice"

const props = defineProps<{
    collapsible?: boolean
    isOpen?: boolean
    itemCount: number
    currencyCode: string
    subtotal: number
    shippingTotal: number
    taxTotal: number
    total: number
    lineItems: CartLineItemDTO[]
    getAmountWithTax: (_item: CartLineItemDTO) => number
    getAmountWithoutTax: (_item: CartLineItemDTO) => number
}>()

const emit = defineEmits<{
    toggle: []
}>()
</script>

<template>
    <section v-if="props.collapsible" aria-label="Order summary" class="lg:hidden">
        <button
            type="button"
            class="flex w-full items-center justify-between gap-4 rounded-[1.35rem] border border-amber-200/80 bg-white/95 px-4 py-4 text-left"
            :aria-expanded="props.isOpen ? 'true' : 'false'"
            aria-controls="checkout-mobile-summary-panel"
            @click="emit('toggle')"
        >
            <span class="grid gap-1">
                <span class="text-sm font-semibold text-slate-950">Order summary</span>
                <span class="text-xs tracking-label text-slate-500 uppercase">
                    {{ props.itemCount }} item{{ props.itemCount === 1 ? "" : "s" }}
                </span>
            </span>
            <span class="flex items-center gap-3">
                <strong class="text-base font-semibold text-slate-950">{{ formatPrice(props.total, props.currencyCode) }}</strong>
                <span class="text-slate-500 transition-transform" :class="props.isOpen ? 'rotate-180' : ''" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" stroke="currentColor" stroke-width="1.8">
                        <path d="m5 7.5 5 5 5-5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </span>
            </span>
        </button>

        <div
            v-show="props.isOpen"
            id="checkout-mobile-summary-panel"
            class="mt-3 rounded-[1.35rem] border border-slate-200/80 bg-white/95 p-4"
        >
            <div class="grid gap-4">
                <article
                    v-for="item in props.lineItems"
                    :key="item.id"
                    class="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 border-b border-slate-200/80 pb-4 last:border-b-0 last:pb-0"
                >
                    <img
                        :src="item.thumbnail || '/images/placeholder.png'"
                        :alt="item.product_title || 'Product image'"
                        width="72"
                        height="88"
                        class="h-[88px] w-[72px] rounded-[1rem] bg-slate-100 object-cover"
                        loading="lazy"
                    />
                    <div class="grid gap-1">
                        <strong class="text-sm font-semibold text-slate-950">{{ item.product_title }}</strong>
                        <span class="text-sm leading-6 text-slate-600">{{ item.variant_title || "Standard option" }}</span>
                        <span class="text-sm leading-6 text-slate-600">Qty {{ item.quantity }}</span>
                    </div>
                    <div class="text-right text-slate-950">
                        <TaxedLinePrice
                            :amount-with-tax="props.getAmountWithTax(item)"
                            :amount-without-tax="props.getAmountWithoutTax(item)"
                        />
                    </div>
                </article>
            </div>

            <div class="mt-4 grid gap-3 border-t border-slate-200/80 pt-4">
                <div class="flex items-center justify-between gap-3 text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span class="font-semibold text-slate-950">{{ formatPrice(props.subtotal, props.currencyCode) }}</span>
                </div>
                <div class="flex items-center justify-between gap-3 text-sm text-slate-600">
                    <span>Shipping</span>
                    <span class="font-semibold text-slate-950">{{ formatPrice(props.shippingTotal, props.currencyCode) }}</span>
                </div>
                <div class="flex items-center justify-between gap-3 text-sm text-slate-600">
                    <span>Tax</span>
                    <span class="font-semibold text-slate-950">{{ formatPrice(props.taxTotal, props.currencyCode) }}</span>
                </div>
                <div class="rounded-card-sm flex items-center justify-between gap-3 border border-slate-200/80 bg-slate-50/80 px-4 py-3">
                    <span class="text-sm font-semibold text-slate-900">Total</span>
                    <strong class="text-base font-semibold tracking-[-0.02em] text-slate-950">
                        {{ formatPrice(props.total, props.currencyCode) }}
                    </strong>
                </div>
            </div>
        </div>
    </section>

    <div
        v-else
        class="rounded-[1.75rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 shadow-[0_12px_30px_rgba(8,27,90,0.06)]"
    >
        <span
            class="border-brand-100 bg-brand-50 text-brand-700 inline-flex min-h-9 items-center rounded-full border px-4 py-2 text-label-sm font-bold tracking-label uppercase"
        >
            Order summary
        </span>
        <h2 class="mt-4 max-w-[11ch] text-[1.85rem] leading-[1.02] font-semibold tracking-[-0.04rem] text-slate-950 sm:text-[2.2rem]">
            Everything included in this checkout.
        </h2>
        <p class="mt-3 text-sm leading-7 text-slate-600">Review items, totals, and delivery costs before payment.</p>

        <div class="mt-5 grid gap-4">
            <article
                v-for="item in props.lineItems"
                :key="item.id"
                class="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 rounded-[1.25rem] border border-slate-200/80 bg-white/90 p-3"
            >
                <img
                    :src="item.thumbnail || '/images/placeholder.png'"
                    :alt="item.product_title || 'Product image'"
                    width="72"
                    height="88"
                    class="h-[88px] w-[72px] rounded-[1rem] bg-slate-100 object-cover"
                    loading="lazy"
                />
                <div class="grid gap-1">
                    <strong class="text-sm font-semibold text-slate-950">{{ item.product_title }}</strong>
                    <span class="text-sm leading-6 text-slate-600">{{ item.variant_title || "Standard option" }}</span>
                    <span class="text-sm leading-6 text-slate-600">Qty {{ item.quantity }}</span>
                </div>
                <div class="text-right text-slate-950">
                    <TaxedLinePrice :amount-with-tax="props.getAmountWithTax(item)" :amount-without-tax="props.getAmountWithoutTax(item)" />
                </div>
            </article>
        </div>

        <div class="my-5 h-px w-full bg-[linear-gradient(90deg,rgba(148,163,184,0),rgba(202,138,4,0.32),rgba(148,163,184,0))]"></div>

        <div class="grid gap-3">
            <div class="flex items-center justify-between gap-3 text-sm text-slate-600">
                <span>Items</span>
                <span class="font-semibold text-slate-950">{{ props.itemCount }}</span>
            </div>
            <div class="flex items-center justify-between gap-3 text-sm text-slate-600">
                <span>Subtotal</span>
                <span class="font-semibold text-slate-950">{{ formatPrice(props.subtotal, props.currencyCode) }}</span>
            </div>
            <div class="flex items-center justify-between gap-3 text-sm text-slate-600">
                <span>Shipping</span>
                <span class="font-semibold text-slate-950">{{ formatPrice(props.shippingTotal, props.currencyCode) }}</span>
            </div>
            <div class="flex items-center justify-between gap-3 text-sm text-slate-600">
                <span>Tax</span>
                <span class="font-semibold text-slate-950">{{ formatPrice(props.taxTotal, props.currencyCode) }}</span>
            </div>
            <div class="flex items-center justify-between gap-3 rounded-[1.2rem] border border-slate-200/80 bg-slate-50/80 px-4 py-3">
                <span class="text-sm font-semibold text-slate-900">Total</span>
                <strong class="text-lg font-semibold tracking-[-0.02em] text-slate-950">
                    {{ formatPrice(props.total, props.currencyCode) }}
                </strong>
            </div>
        </div>
    </div>
</template>
