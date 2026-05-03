<script setup lang="ts">
import type { PublicOrderStatus } from "@/types/order-status"

import PublicOrderStatusTracker from "@/components/Orders/PublicOrderStatusTracker.vue"

const route = useRoute()
const orderId = computed<string>(() => String(route.params.id || ""))

useHead({
    title: "Track Order | Medusa Commerce",
    meta: [{ name: "robots", content: "noindex, nofollow" }]
})

const {
    data: orderRes,
    pending,
    error
} = await useFetch<{ order: PublicOrderStatus }>(() => `/api/orders/status/${encodeURIComponent(orderId.value)}`, {
    method: "GET"
})

const order = computed<PublicOrderStatus | null>(() => orderRes.value?.order ?? null)
</script>

<template>
    <main class="bg-linear-to-b from-brand-50 via-white to-slate-50 px-4 pt-15 pb-14 sm:px-6 sm:pt-18 lg:pb-20 xl:pt-23">
        <div class="mx-auto w-full max-w-7xl">
            <div v-if="pending" class="rounded-panel border border-white/80 bg-white p-8 text-center shadow-panel">
                <span class="border-brand-100 border-t-brand-700 inline-flex h-10 w-10 animate-spin rounded-full border-4"></span>
                <p class="mt-4 text-sm font-medium text-slate-600">Loading order status...</p>
            </div>

            <div v-else-if="error" class="rounded-panel border border-white/80 bg-white p-6 text-center shadow-panel sm:p-8" role="alert">
                <div class="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                    <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M12 9v4" stroke-linecap="round" />
                        <path d="M12 17h.01" stroke-linecap="round" />
                        <path d="M10.3 4.3 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
                    </svg>
                </div>
                <h1 class="mt-4 text-2xl font-bold tracking-tighter text-slate-950">Order status unavailable</h1>
                <p class="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    We could not find a public status update for this order. Check the order ID and try again.
                </p>
                <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <NuxtLink to="/order-status" class="ui-btn-primary px-6">Check another order</NuxtLink>
                    <NuxtLink to="/contact" class="ui-btn-secondary px-6">Contact support</NuxtLink>
                </div>
            </div>

            <PublicOrderStatusTracker v-else-if="order" :order="order" />
        </div>
    </main>
</template>
