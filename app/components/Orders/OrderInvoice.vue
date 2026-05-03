<script setup lang="ts">
import type { OrderDTO } from "@medusajs/types"

import { formatFulfillmentStatus, formatPaymentStatus } from "@/enumerators/order"
import { formatDate } from "@/utils/formatDate"
import { formatPrice } from "@/utils/formatPrice"
import NuxtImage from "~/components/Shared/NuxtImage.vue"

type InvoiceOrderDTO = OrderDTO & {
    payment_status?: string | null
    fulfillment_status?: string | null
}

const route = useRoute()
const orderId = route.params.id
const runtimeConfig = useRuntimeConfig()
const skeletonBlocks = Array.from({ length: 3 }, (_, index) => index)

const {
    data: orderRes,
    pending,
    error
} = await useFetch<{ order: InvoiceOrderDTO }>(() => `/api/orders/${orderId}`, {
    credentials: "include",
    headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": runtimeConfig.public.PUBLISHABLE_KEY
    }
})

const order = computed<InvoiceOrderDTO | undefined>(() => orderRes.value?.order)
const invoiceDownloadUrl = computed<string>(() => `/api/orders/${orderId}/invoice`)

</script>

<template>
    <div>
        <div v-if="pending" class="grid gap-5 xl:grid-cols-3" aria-hidden="true">
            <div class="grid gap-5 xl:col-span-2">
                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div class="grid animate-pulse gap-4 md:grid-cols-3">
                        <div
                            v-for="block in skeletonBlocks"
                            :key="block"
                            class="space-y-2 rounded-2xl border border-slate-200 bg-white p-4"
                        >
                            <div class="h-3 w-20 rounded-full bg-slate-200"></div>
                            <div class="h-5 w-28 rounded-full bg-slate-200"></div>
                        </div>
                    </div>
                </div>

                <div class="rounded-3xl border border-slate-200 bg-white p-5">
                    <div class="animate-pulse space-y-4">
                        <div class="h-6 w-40 rounded-full bg-slate-200"></div>
                        <div v-for="row in 2" :key="row" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div class="flex gap-4">
                                    <div class="h-18 w-18 rounded-2xl bg-slate-200"></div>
                                    <div class="space-y-2">
                                        <div class="h-4 w-36 rounded-full bg-slate-200"></div>
                                        <div class="h-4 w-28 rounded-full bg-slate-200"></div>
                                        <div class="h-4 w-16 rounded-full bg-slate-200"></div>
                                    </div>
                                </div>
                                <div class="space-y-2 sm:text-right">
                                    <div class="h-4 w-20 rounded-full bg-slate-200"></div>
                                    <div class="h-5 w-24 rounded-full bg-slate-200"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="rounded-3xl border border-slate-200 bg-white p-5">
                <div class="animate-pulse space-y-4">
                    <div class="h-6 w-24 rounded-full bg-slate-200"></div>
                    <div v-for="row in 4" :key="row" class="flex items-center justify-between gap-4">
                        <div class="h-4 w-24 rounded-full bg-slate-200"></div>
                        <div class="h-4 w-20 rounded-full bg-slate-200"></div>
                    </div>
                    <div class="h-11 w-full rounded-full bg-slate-200"></div>
                </div>
            </div>
        </div>

        <div
            v-else-if="error"
            class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
            role="alert"
        >
            Failed to load order.
        </div>

        <div v-else-if="order" class="grid gap-5 xl:grid-cols-3">
            <div class="grid gap-5 xl:col-span-2">
                <section class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div class="grid gap-4 md:grid-cols-3">
                        <div class="rounded-2xl border border-slate-200 bg-white p-4">
                            <span class="text-label-xs tracking-label-tight block font-bold text-slate-500 uppercase">Order</span>
                            <strong class="mt-1 block text-sm font-semibold text-slate-950">#{{ order.display_id || order.id }}</strong>
                        </div>
                        <div class="rounded-2xl border border-slate-200 bg-white p-4">
                            <span class="text-label-xs tracking-label-tight block font-bold text-slate-500 uppercase">Placed on</span>
                            <strong class="mt-1 block text-sm font-semibold text-slate-950">
                                {{ formatDate(order.created_at) || "Unavailable" }}
                            </strong>
                        </div>
                        <div class="rounded-2xl border border-slate-200 bg-white p-4">
                            <span class="text-label-xs tracking-label-tight block font-bold text-slate-500 uppercase">Status</span>
                            <strong class="mt-1 block text-sm font-semibold text-slate-950">
                                {{ formatFulfillmentStatus(order.fulfillment_status) }}
                            </strong>
                        </div>
                    </div>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-5">
                    <h2 class="text-xl font-semibold text-slate-950">Items in this order</h2>
                    <div class="mt-4 grid gap-3">
                        <article
                            v-for="item in order.items"
                            :key="item.id"
                            class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div class="flex gap-4">
                                    <NuxtImage
                                        :src="item.thumbnail || '/images/placeholder.png'"
                                        :alt="item.product_title || 'Order item image'"
                                        width="72"
                                        height="72"
                                        class="h-18 w-18 rounded-2xl object-cover"
                                    />
                                    <div class="grid gap-1">
                                        <strong class="text-sm font-semibold text-slate-950">{{ item.product_title }}</strong>
                                        <p class="text-sm leading-6 text-slate-600">{{ item.variant_title || "Default variant" }}</p>
                                        <p class="text-sm leading-6 text-slate-600">Qty {{ item.quantity }}</p>
                                    </div>
                                </div>

                                <div class="grid gap-1 text-left text-slate-950 sm:text-right">
                                    <span class="text-sm text-slate-600">{{
                                        formatPrice(Number(item.unit_price || 0), order.currency_code)
                                    }}</span>
                                    <strong class="text-sm font-semibold">{{
                                        formatPrice(Number(item.total || 0), order.currency_code)
                                    }}</strong>
                                </div>
                            </div>
                        </article>
                    </div>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-5">
                    <h2 class="text-xl font-semibold text-slate-950">Shipping and payment</h2>
                    <div class="mt-4 grid gap-4 md:grid-cols-3">
                        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <span class="text-label-xs tracking-label-tight block font-bold text-slate-500 uppercase">Email</span>
                            <strong class="mt-1 block text-sm font-semibold wrap-break-word text-slate-950">{{ order.email }}</strong>
                        </div>
                        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <span class="text-label-xs tracking-label-tight block font-bold text-slate-500 uppercase">Payment status</span>
                            <strong class="mt-1 block text-sm font-semibold text-slate-950">
                                {{ formatPaymentStatus(order.payment_status) }}
                            </strong>
                        </div>
                        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <span class="text-label-xs tracking-label-tight block font-bold text-slate-500 uppercase">Shipping method</span>
                            <strong class="mt-1 block text-sm font-semibold text-slate-950">{{
                                order.shipping_methods?.[0]?.name || "Unavailable"
                            }}</strong>
                        </div>
                    </div>
                </section>
            </div>

            <aside>
                <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-6">
                    <h2 class="text-xl font-semibold text-slate-950">Totals</h2>
                    <div class="mt-4 grid gap-3 text-sm text-slate-600">
                        <div class="flex items-center justify-between gap-4">
                            <span>Subtotal</span>
                            <span>{{ formatPrice(Number(order.subtotal || 0), order.currency_code) }}</span>
                        </div>
                        <div class="flex items-center justify-between gap-4">
                            <span>Shipping</span>
                            <span>{{ formatPrice(Number(order.shipping_total || 0), order.currency_code) }}</span>
                        </div>
                        <div class="flex items-center justify-between gap-4">
                            <span>Tax</span>
                            <span>{{ formatPrice(Number(order.tax_total || 0), order.currency_code) }}</span>
                        </div>
                        <div class="flex items-center justify-between gap-4 border-t border-slate-200 pt-3 text-slate-950">
                            <span class="font-semibold">Total</span>
                            <strong class="text-base font-semibold">{{
                                formatPrice(Number(order.total || 0), order.currency_code)
                            }}</strong>
                        </div>
                    </div>

                    <a :href="invoiceDownloadUrl" class="ui-btn-accent mt-5 w-full motion-reduce:transition-none">
                        Download invoice PDF
                    </a>
                </section>
            </aside>
        </div>
    </div>
</template>
