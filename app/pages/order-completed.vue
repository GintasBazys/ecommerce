<script setup lang="ts">
import type { OrderDTO } from "@medusajs/types"

import { formatDate } from "@/utils/formatDate"
import { formatPrice } from "@/utils/formatPrice"
import { usePostHog } from "~/composables/usePostHog"
import { DEFAULT_CURENCY } from "~/utils/consts"

definePageMeta({ layout: "checkout" })

useHead({ title: "Order Completed | Ecommerce" })

type OrderAddress = OrderDTO["shipping_address"] | OrderDTO["billing_address"]

const route = useRoute()
const orderId = route.query.orderId
const posthog = usePostHog()

const { customer } = storeToRefs(useCustomerStore())

if (!orderId) {
    throw new Error("Missing orderId")
}

const {
    data: orderRes,
    pending,
    error
} = await useFetch<{ order: OrderDTO }>(`/api/orders/${orderId}`, {
    method: "GET",
    credentials: "include"
})

const order = computed<OrderDTO | null>(() => orderRes.value?.order ?? null)
const currencyCode = computed<string>(() => order.value?.currency_code ?? DEFAULT_CURENCY)
const orderDate = computed<string>(() => formatDate(order.value?.created_at))
const shippingMethod = computed(() => order.value?.shipping_methods?.[0] ?? null)
const orderItems = computed(() => order.value?.items ?? [])
const orderEmail = computed(() => order.value?.email || customer.value?.email || "your email")
const supportFacts = computed(() => [
    {
        label: "Order status",
        value: order.value?.status ?? "Pending"
    },
    {
        label: "Payment",
        value: order.value?.payment_status ?? "Awaiting confirmation"
    },
    {
        label: "Date placed",
        value: orderDate.value || "Unavailable"
    }
])

watch(
    order,
    (currentOrder) => {
        if (currentOrder) {
            posthog?.capture("order_completed", {
                order_id: currentOrder.id,
                display_id: currentOrder.display_id,
                total: currentOrder.total,
                subtotal: currentOrder.subtotal,
                currency_code: currentOrder.currency_code,
                item_count: currentOrder.items?.length
            })
        }
    },
    { immediate: true }
)

function formatAddressLines(address: OrderAddress): string[] {
    if (!address) {
        return ["Details unavailable"]
    }

    const cityLine = [address.city, address.province].filter(Boolean).join(", ")

    return [
        [address.first_name, address.last_name].filter(Boolean).join(" "),
        address.address_1,
        address.address_2,
        cityLine,
        address.postal_code,
        address.country?.display_name
    ].filter((value): value is string => Boolean(value))
}
</script>

<template>
    <main
        class="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(1,12,128,0.07),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#ffffff_42%,#f6f9ff_100%)] pt-[calc(var(--site-header-offset,98px)+1rem)] pb-14 sm:pt-[calc(var(--site-header-offset,98px)+1.5rem)] sm:pb-18"
    >
        <div class="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            <section
                class="rounded-[1.9rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 shadow-panel sm:p-7 lg:p-8"
            >
                <div v-if="pending" class="grid justify-items-center gap-4 px-4 py-14 text-center">
                    <span class="border-brand-200 border-t-brand-700 inline-flex h-10 w-10 animate-spin rounded-full border-4"></span>
                    <p class="text-sm leading-6 text-slate-600">Loading your order details...</p>
                </div>

                <div v-else-if="error" class="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-700">
                    Error loading order: {{ error.message }}
                </div>

                <template v-else-if="order">
                    <div class="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-end">
                        <div>
                            <span
                                class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-bold text-emerald-700 uppercase"
                            >
                                Order confirmed
                            </span>
                            <h1
                                class="mt-4 max-w-[12ch] text-[2.3rem] leading-[0.95] font-semibold tracking-[-0.04rem] text-slate-950 sm:text-[3.4rem]"
                            >
                                Thank you. Your order is in and already moving forward.
                            </h1>
                            <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                                We have sent the order details to {{ orderEmail }}. Review the order, delivery information, and totals
                                below.
                            </p>

                            <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                                <NuxtLink to="/" class="ui-btn-accent min-h-12 px-6"> Continue shopping </NuxtLink>
                                <NuxtLink
                                    to="/account/orders"
                                    class="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:outline-hidden"
                                >
                                    View your orders
                                </NuxtLink>
                                <div
                                    class="inline-flex min-h-12 items-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900"
                                >
                                    Order #{{ order.display_id }}
                                </div>
                            </div>
                        </div>

                        <div
                            class="grid gap-3 rounded-[1.6rem] border border-slate-200 bg-white/90 p-5 shadow-[0_12px_30px_rgba(8,27,90,0.06)]"
                        >
                            <div
                                v-for="item in supportFacts"
                                :key="item.label"
                                class="rounded-card-sm border border-slate-200 bg-slate-50/80 px-4 py-3"
                            >
                                <p class="text-label-xs tracking-label font-bold text-slate-500 uppercase">{{ item.label }}</p>
                                <p class="mt-2 text-sm font-semibold text-slate-950">{{ item.value }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(21rem,0.88fr)] xl:items-start">
                        <div class="space-y-5">
                            <section
                                class="rounded-[1.6rem] border border-slate-200 bg-white/95 p-5 shadow-[0_12px_30px_rgba(8,27,90,0.06)] sm:p-6"
                            >
                                <span
                                    class="text-label-xs tracking-label inline-flex min-h-8 items-center rounded-full border border-slate-200 bg-slate-50 px-3 font-bold text-slate-600 uppercase"
                                >
                                    Customer details
                                </span>
                                <h2 class="mt-4 text-2xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-[2rem]">
                                    Who and where this order is going.
                                </h2>

                                <div class="mt-5 grid gap-4 lg:grid-cols-2">
                                    <article class="rounded-[1.3rem] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                                        <h3 class="text-base font-semibold text-slate-950">Shipping address</h3>
                                        <div class="mt-3 space-y-1 text-sm leading-6 text-slate-600">
                                            <p v-for="line in formatAddressLines(order.shipping_address)" :key="`shipping-${line}`">
                                                {{ line }}
                                            </p>
                                        </div>
                                    </article>

                                    <article class="rounded-[1.3rem] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                                        <h3 class="text-base font-semibold text-slate-950">Billing address</h3>
                                        <div class="mt-3 space-y-1 text-sm leading-6 text-slate-600">
                                            <p v-for="line in formatAddressLines(order.billing_address)" :key="`billing-${line}`">
                                                {{ line }}
                                            </p>
                                        </div>
                                    </article>
                                </div>

                                <div class="mt-5 grid gap-3 sm:grid-cols-2">
                                    <div class="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3">
                                        <p class="text-label-xs tracking-label font-bold text-slate-500 uppercase">Contact email</p>
                                        <p class="mt-2 text-sm font-semibold text-slate-950">{{ orderEmail }}</p>
                                    </div>
                                    <div class="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3">
                                        <p class="text-label-xs tracking-label font-bold text-slate-500 uppercase">Shipping method</p>
                                        <p class="mt-2 text-sm font-semibold text-slate-950">
                                            {{ shippingMethod?.name || "Shipping method unavailable" }}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section
                                class="rounded-[1.6rem] border border-slate-200 bg-white/95 p-5 shadow-[0_12px_30px_rgba(8,27,90,0.06)] sm:p-6"
                            >
                                <span
                                    class="text-label-xs tracking-label inline-flex min-h-8 items-center rounded-full border border-slate-200 bg-slate-50 px-3 font-bold text-slate-600 uppercase"
                                >
                                    Order items
                                </span>
                                <h2 class="mt-4 text-2xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-[2rem]">
                                    Everything included in this order.
                                </h2>

                                <div class="mt-5 grid gap-4">
                                    <article
                                        v-for="item in orderItems"
                                        :key="item.id"
                                        class="flex flex-col gap-4 rounded-[1.3rem] border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-start sm:p-5"
                                    >
                                        <img
                                            :src="item.thumbnail || '/images/placeholder.png'"
                                            :alt="item.product_title || 'Product image'"
                                            width="88"
                                            height="108"
                                            class="h-27 w-22 rounded-2xl bg-white object-cover"
                                        />
                                        <div class="min-w-0 flex-1">
                                            <p class="text-sm font-semibold text-slate-950">{{ item.product_title }}</p>
                                            <p class="mt-2 text-sm leading-6 text-slate-600">
                                                Variant: {{ item.variant_title || "Standard option" }}
                                            </p>
                                            <p class="text-sm leading-6 text-slate-600">Quantity: {{ item.quantity }}</p>
                                            <p class="text-sm leading-6 text-slate-600">
                                                Unit price: {{ formatPrice(Number(item.unit_price || 0), currencyCode) }}
                                            </p>
                                        </div>
                                        <strong class="text-sm font-semibold text-slate-950 sm:text-right">
                                            {{ formatPrice(Number(item.total ?? item.unit_price ?? 0), currencyCode) }}
                                        </strong>
                                    </article>
                                </div>
                            </section>
                        </div>

                        <aside class="xl:sticky xl:top-6 xl:self-start">
                            <div
                                class="rounded-panel border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 shadow-panel sm:p-6"
                            >
                                <span
                                    class="border-brand-100 bg-brand-50 text-brand-700 text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border px-4 py-2 font-bold uppercase"
                                >
                                    Order summary
                                </span>
                                <h2
                                    class="mt-4 text-[1.8rem] leading-[1.05] font-semibold tracking-[-0.04rem] text-slate-950 sm:text-[2.2rem]"
                                >
                                    A clear breakdown of what was charged.
                                </h2>

                                <div
                                    class="mt-5 rounded-[1.4rem] border border-slate-200/80 bg-white/85 p-4 shadow-card"
                                >
                                    <p class="text-label-eyebrow tracking-label font-bold text-slate-500 uppercase">Payment snapshot</p>
                                    <p class="mt-2 text-sm font-semibold text-slate-950">
                                        {{ orderItems.length }} line item{{ orderItems.length === 1 ? "" : "s" }} in this order
                                    </p>
                                </div>

                                <div
                                    class="my-5 h-px w-full bg-[linear-gradient(90deg,rgba(148,163,184,0),rgba(202,138,4,0.38),rgba(148,163,184,0))]"
                                ></div>

                                <div class="grid gap-3">
                                    <div class="flex items-center justify-between gap-3 text-sm text-slate-600">
                                        <span>Subtotal</span>
                                        <span class="font-semibold text-slate-950">{{
                                            formatPrice(Number(order.subtotal || 0), currencyCode)
                                        }}</span>
                                    </div>
                                    <div class="flex items-center justify-between gap-3 text-sm text-slate-600">
                                        <span>Shipping</span>
                                        <span class="font-semibold text-slate-950">{{
                                            formatPrice(Number(order.shipping_total || 0), currencyCode)
                                        }}</span>
                                    </div>
                                    <div class="flex items-center justify-between gap-3 text-sm text-slate-600">
                                        <span>Tax</span>
                                        <span class="font-semibold text-slate-950">{{
                                            formatPrice(Number(order.tax_total || 0), currencyCode)
                                        }}</span>
                                    </div>
                                    <div class="flex items-center justify-between gap-3 text-sm text-slate-600">
                                        <span>Discount</span>
                                        <span class="font-semibold text-slate-950"
                                        >-{{ formatPrice(Number(order.discount_total || 0), currencyCode) }}</span
                                        >
                                    </div>
                                    <div
                                        class="flex items-center justify-between gap-3 rounded-[1.2rem] border border-slate-200/80 bg-slate-50/80 px-4 py-3"
                                    >
                                        <span class="text-sm font-semibold text-slate-900">Total</span>
                                        <strong class="text-lg font-semibold tracking-[-0.02em] text-slate-950">
                                            {{ formatPrice(Number(order.total || 0), currencyCode) }}
                                        </strong>
                                    </div>
                                    <div class="flex items-center justify-between gap-3 text-sm text-slate-600">
                                        <span>Paid</span>
                                        <strong class="font-semibold text-slate-950">{{
                                            formatPrice(Number(order.summary?.paid_total || 0), currencyCode)
                                        }}</strong>
                                    </div>
                                </div>

                                <div class="mt-5 grid gap-3">
                                    <NuxtLink
                                        to="/"
                                        class="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-hidden"
                                    >
                                        Back to home
                                    </NuxtLink>
                                    <NuxtLink
                                        to="/account/orders"
                                        class="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:outline-hidden"
                                    >
                                        View your orders
                                    </NuxtLink>
                                </div>
                            </div>
                        </aside>
                    </div>
                </template>
            </section>
        </div>
    </main>
</template>
