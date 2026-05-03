<script setup lang="ts">
import type { PublicOrderStatus } from "@/types/order-status"

import { formatFulfillmentStatus, formatPaymentStatus, formatStorefrontOrderStatus } from "@/enumerators/order"
import { formatDate } from "@/utils/formatDate"

type TrackingStep = {
    key: string
    label: string
    description: string
    icon: "receipt" | "card" | "box" | "truck" | "home"
}

const props = defineProps<{
    order: PublicOrderStatus
}>()

const trackingSteps: TrackingStep[] = [
    {
        key: "received",
        label: "Order received",
        description: "Your order has entered our system.",
        icon: "receipt"
    },
    {
        key: "payment",
        label: "Payment checked",
        description: "The payment status has been reviewed.",
        icon: "card"
    },
    {
        key: "preparing",
        label: "Preparing order",
        description: "Fulfillment is preparing the order.",
        icon: "box"
    },
    {
        key: "shipped",
        label: "Order shipped",
        description: "The order has left fulfillment.",
        icon: "truck"
    },
    {
        key: "delivered",
        label: "Delivered",
        description: "The order has reached its destination.",
        icon: "home"
    }
]

const displayOrderNumber = computed<string>(() => String(props.order.display_id || props.order.id))
const placedDate = computed<string>(() => formatDate(props.order.created_at))
const orderStatusLabel = computed<string>(() => formatStorefrontOrderStatus(props.order))
const paymentStatusLabel = computed<string>(() => formatPaymentStatus(props.order.payment_status))
const fulfillmentStatusLabel = computed<string>(() => formatFulfillmentStatus(props.order.fulfillment_status))
const isCanceled = computed<boolean>(() => props.order.status === "canceled" || props.order.fulfillment_status === "canceled")
const activeStepIndex = computed<number>(() => getActiveStepIndex(props.order))
const latestStatus = computed<string>(() => (isCanceled.value ? "Order canceled" : fulfillmentStatusLabel.value))

function getActiveStepIndex(order: PublicOrderStatus): number {
    if (order.status === "canceled" || order.fulfillment_status === "canceled") {
        return 0
    }

    if (order.fulfillment_status === "delivered") {
        return 4
    }

    if (["shipped", "partially_shipped", "partially_delivered"].includes(String(order.fulfillment_status))) {
        return 3
    }

    if (["fulfilled", "partially_fulfilled"].includes(String(order.fulfillment_status))) {
        return 2
    }

    if (["authorized", "captured", "partially_captured", "refunded", "partially_refunded"].includes(String(order.payment_status))) {
        return 1
    }

    return 0
}

function isStepComplete(index: number): boolean {
    return !isCanceled.value && index <= activeStepIndex.value
}
</script>

<template>
    <div class="grid gap-5">
        <section class="rounded-panel border border-white/80 bg-linear-to-b from-white to-slate-50 p-5 shadow-panel sm:p-7 lg:p-8">
            <div class="grid gap-5 sm:grid-cols-2 sm:items-start">
                <div>
                    <span
                        class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                    >
                        Order tracker
                    </span>
                    <h1 class="mt-4 text-3xl leading-tight font-bold tracking-tighter text-slate-950 sm:text-5xl">
                        Order #{{ displayOrderNumber }}
                    </h1>
                    <p class="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                        A status-only view for quick delivery and payment progress. Personal order details stay private.
                    </p>
                </div>

                <div class="rounded-card-sm border border-slate-200 bg-white p-4 shadow-card sm:justify-self-end sm:p-5">
                    <p class="text-label-xs tracking-label-tight font-bold text-slate-500 uppercase">Latest update</p>
                    <p class="mt-2 text-xl font-semibold tracking-tight text-slate-950">{{ latestStatus }}</p>
                    <p class="mt-2 text-sm leading-6 text-slate-600">Placed {{ placedDate || "date unavailable" }}</p>
                    <p class="mt-1 text-sm font-semibold text-brand-700">
                        {{ order.shipping_method || "Shipping method pending" }}
                    </p>
                </div>
            </div>

            <div
                v-if="isCanceled"
                class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
                role="status"
            >
                This order is canceled. Contact support if you need help with this order.
            </div>

            <div class="mt-7 rounded-card border border-slate-200 bg-white p-4 shadow-card sm:p-5 lg:p-6">
                <div class="relative hidden md:block" aria-hidden="true">
                    <div class="absolute inset-x-8 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200"></div>
                    <div
                        class="absolute top-1/2 left-8 h-2 -translate-y-1/2 rounded-full bg-brand-700"
                        :style="{ width: `${(activeStepIndex / (trackingSteps.length - 1)) * 100}%` }"
                    ></div>
                    <div class="relative grid grid-cols-5 justify-items-center">
                        <span
                            v-for="(step, index) in trackingSteps"
                            :key="step.key"
                            class="inline-flex h-11 w-11 items-center justify-center rounded-full border text-sm font-bold shadow-sm"
                            :class="isStepComplete(index) ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-200 bg-slate-100 text-slate-400'"
                        >
                            {{ index + 1 }}
                        </span>
                    </div>
                </div>

                <ol class="grid gap-3 md:mt-7 md:grid-cols-5 md:gap-4">
                    <li
                        v-for="(step, index) in trackingSteps"
                        :key="step.key"
                        class="relative rounded-2xl border bg-slate-50 p-4 md:border-0 md:bg-transparent md:p-0"
                        :class="isStepComplete(index) ? 'border-brand-100' : 'border-slate-200'"
                    >
                        <div class="flex gap-3 md:grid md:justify-items-center md:text-center">
                            <span
                                class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border md:h-14 md:w-14"
                                :class="isStepComplete(index) ? 'border-brand-100 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-500'"
                            >
                                <svg v-if="step.icon === 'receipt'" viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                    <path d="M7 4h10v16l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2V4Z" stroke-linejoin="round" />
                                    <path d="M9 8h6M9 12h6M9 16h3" stroke-linecap="round" />
                                </svg>
                                <svg v-else-if="step.icon === 'card'" viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                    <path d="M4 7h16v10H4z" stroke-linejoin="round" />
                                    <path d="M4 10h16M7 15h4" stroke-linecap="round" />
                                </svg>
                                <svg v-else-if="step.icon === 'box'" viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                    <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" stroke-linejoin="round" />
                                    <path d="M4 7.5 12 12l8-4.5M12 12v9" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <svg v-else-if="step.icon === 'truck'" viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                    <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" stroke-linejoin="round" />
                                    <path d="M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                                </svg>
                                <svg v-else viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                    <path d="m3 11 9-7 9 7" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M5 10v10h14V10M10 20v-6h4v6" stroke-linejoin="round" />
                                </svg>
                            </span>
                            <div>
                                <p class="text-sm font-bold text-slate-950">{{ step.label }}</p>
                                <p class="mt-1 text-xs leading-5 text-slate-600">{{ step.description }}</p>
                            </div>
                        </div>
                    </li>
                </ol>
            </div>
        </section>

        <section class="rounded-panel border border-white/80 bg-linear-to-b from-white to-slate-50 p-5 shadow-panel sm:p-7">
            <h2 class="text-2xl font-bold tracking-tighter text-slate-950">Status details</h2>
            <dl class="mt-5 grid gap-3 sm:grid-cols-3">
                <div class="rounded-card-sm border border-slate-200 bg-white p-4 shadow-card">
                    <dt class="text-label-xs tracking-label-tight font-bold text-slate-500 uppercase">Order status</dt>
                    <dd class="mt-2 text-sm font-semibold text-slate-950">{{ orderStatusLabel }}</dd>
                </div>
                <div class="rounded-card-sm border border-slate-200 bg-white p-4 shadow-card">
                    <dt class="text-label-xs tracking-label-tight font-bold text-slate-500 uppercase">Payment status</dt>
                    <dd class="mt-2 text-sm font-semibold text-slate-950">{{ paymentStatusLabel }}</dd>
                </div>
                <div class="rounded-card-sm border border-slate-200 bg-white p-4 shadow-card">
                    <dt class="text-label-xs tracking-label-tight font-bold text-slate-500 uppercase">Fulfillment status</dt>
                    <dd class="mt-2 text-sm font-semibold text-slate-950">{{ fulfillmentStatusLabel }}</dd>
                </div>
            </dl>
        </section>
    </div>
</template>
