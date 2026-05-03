<script setup lang="ts">
import type { PublicOrderStatus } from "@/types/order-status"

import PublicOrderStatusTracker from "@/components/Orders/PublicOrderStatusTracker.vue"
import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"

const route = useRoute()
const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: "Order status" }])
const orderId = ref<string>(String(route.query.orderId || ""))
const order = ref<PublicOrderStatus | null>(null)
const isLoading = ref<boolean>(false)
const errorMessage = ref<string>("")

useHead({
    title: "Order Status | Medusa Commerce"
})

useSeoMeta({
    description: "Check the latest public status for a Medusa Commerce order using your order ID."
})

async function lookupOrder(): Promise<void> {
    const normalizedOrderId = orderId.value.trim()

    order.value = null
    errorMessage.value = ""

    if (!/^order_[a-zA-Z0-9]+$/.test(normalizedOrderId)) {
        errorMessage.value = "Enter a valid order ID that starts with order_."
        return
    }

    isLoading.value = true

    try {
        const response = await $fetch<{ order: PublicOrderStatus }>(`/api/orders/status/${encodeURIComponent(normalizedOrderId)}`)
        order.value = response.order
    } catch {
        errorMessage.value = "We could not find a public status update for this order. Check the order ID and try again."
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <main class="bg-linear-to-b from-brand-50 via-white to-slate-50 px-4 pt-15 pb-14 sm:px-6 sm:pt-18 lg:pb-20 xl:pt-23">
        <div class="mx-auto grid w-full max-w-7xl gap-6">
            <section class="rounded-panel border border-white/80 bg-linear-to-b from-white to-slate-50 p-5 shadow-panel sm:p-7 lg:p-8">
                <div class="grid gap-7 xl:grid-cols-2 xl:items-end">
                    <div>
                        <AppBreadcrumbs :items="breadcrumbItems" class="mb-4" />
                        <span
                            class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                        >
                            Order status
                        </span>
                        <h1 class="mt-4 max-w-2xl text-3xl leading-none font-bold tracking-tighter text-slate-950 sm:text-5xl lg:text-6xl">
                            Check where your order stands in seconds.
                        </h1>
                        <p class="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                            Enter the order ID from your confirmation email. This page only shows status-level updates, so order contents
                            and personal details stay private.
                        </p>
                    </div>

                    <form class="rounded-card border border-slate-200 bg-white p-4 shadow-card sm:p-5" @submit.prevent="lookupOrder">
                        <label for="public-order-id" class="text-sm font-semibold text-slate-950">Order ID</label>
                        <div class="mt-2 flex flex-col gap-3 sm:flex-row">
                            <input
                                id="public-order-id"
                                v-model="orderId"
                                type="text"
                                inputmode="text"
                                autocomplete="off"
                                placeholder="Enter your order ID"
                                class="min-h-12 w-full flex-1 rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-200 focus:outline-hidden"
                                :aria-invalid="Boolean(errorMessage)"
                                aria-describedby="order-status-help order-status-error"
                            />
                            <button type="submit" class="ui-btn-primary min-h-12 px-6" :disabled="isLoading">
                                {{ isLoading ? "Checking..." : "Check status" }}
                            </button>
                        </div>
                        <p id="order-status-help" class="mt-3 text-xs leading-5 text-slate-500">
                            You can find the order ID in your order confirmation email.
                        </p>
                        <p v-if="errorMessage" id="order-status-error" class="mt-3 text-sm font-medium text-rose-700" role="alert">
                            {{ errorMessage }}
                        </p>
                    </form>
                </div>
            </section>

            <section v-if="isLoading" class="rounded-panel border border-white/80 bg-white p-8 text-center shadow-panel" aria-live="polite">
                <span class="border-brand-100 border-t-brand-700 inline-flex h-10 w-10 animate-spin rounded-full border-4"></span>
                <p class="mt-4 text-sm font-medium text-slate-600">Checking order status...</p>
            </section>

            <PublicOrderStatusTracker v-else-if="order" :order="order" />

            <section v-else class="rounded-panel border border-white/80 bg-white p-5 shadow-panel sm:p-7">
                <div class="grid gap-4 sm:grid-cols-3">
                    <div class="rounded-card-sm border border-slate-200 bg-slate-50 p-4">
                        <p class="text-label-xs tracking-label-tight font-bold text-slate-500 uppercase">Private by design</p>
                        <p class="mt-2 text-sm leading-6 text-slate-600">Only status-level information appears here.</p>
                    </div>
                    <div class="rounded-card-sm border border-slate-200 bg-slate-50 p-4">
                        <p class="text-label-xs tracking-label-tight font-bold text-slate-500 uppercase">Mobile ready</p>
                        <p class="mt-2 text-sm leading-6 text-slate-600">The tracker is built for quick checks from your phone.</p>
                    </div>
                    <div class="rounded-card-sm border border-slate-200 bg-slate-50 p-4">
                        <p class="text-label-xs tracking-label-tight font-bold text-slate-500 uppercase">Need more help?</p>
                        <p class="mt-2 text-sm leading-6 text-slate-600">Contact support for order changes or delivery questions.</p>
                    </div>
                </div>
            </section>
        </div>
    </main>
</template>
