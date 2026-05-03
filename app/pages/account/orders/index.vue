<script setup lang="ts">
import type { OrdersResponse } from "@/types/interfaces"
import type { OrderDTO } from "@medusajs/types"

import { formatFulfillmentStatus } from "@/enumerators/order"
import { formatDate } from "@/utils/formatDate"
import { formatPrice } from "@/utils/formatPrice"
import BaseSelect from "~/components/Shared/BaseSelect.vue"

type OrdersListItem = OrderDTO & {
    fulfillment_status?: string | null
}

definePageMeta({
    layout: "account",
    middleware: ["auth"]
})

useHead({ title: "Orders | Medusa Commerce" })

const runtimeConfig = useRuntimeConfig()
const page = ref<number>(1)
const perPage = ref<number>(10)
const ordersStartRef = ref<HTMLElement | null>(null)
const perPageOptions = [5, 10, 20, 50]
const skeletonRows = Array.from({ length: 5 }, (_, index) => index)
const perPageSelectOptions = perPageOptions.map((option) => ({ label: String(option), value: option }))

const { data: ordersData, pending } = await useFetch<OrdersResponse>(
    () => {
        const params = new URLSearchParams({
            page: String(page.value),
            limit: String(perPage.value)
        })

        return `/api/orders/orders?${params.toString()}`
    },
    {
        watch: [page, perPage],
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": runtimeConfig.public.PUBLISHABLE_KEY
        }
    }
)

watch(perPage, () => {
    page.value = 1
})

watch(page, async (currentPage, previousPage) => {
    if (!import.meta.client || !previousPage || currentPage === previousPage) {
        return
    }

    await nextTick()

    const anchorTop = ordersStartRef.value?.getBoundingClientRect().top

    if (anchorTop == null) {
        return
    }

    const rawHeaderOffset = window.getComputedStyle(document.documentElement).getPropertyValue("--site-header-offset")
    const headerOffset = Number.parseInt(rawHeaderOffset, 10) || 0
    const extraOffset = 80

    window.scrollTo({
        top: Math.max(0, window.scrollY + anchorTop - headerOffset - extraOffset),
        behavior: "smooth"
    })
})

const orders = computed<OrdersListItem[]>(() => (ordersData.value?.orders || []) as OrdersListItem[])
const totalOrders = computed(() => ordersData.value?.total || 0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalOrders.value / perPage.value)))

function changePage(nextPage: number): void {
    if (nextPage < 1 || nextPage > totalPages.value || nextPage === page.value) {
        return
    }

    page.value = nextPage
}
</script>

<template>
    <div class="grid gap-5">
        <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
            <div class="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <span
                        class="bg-brand-100 text-brand-700 text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full px-4 py-2 font-bold uppercase"
                    >
                        Order history
                    </span>
                    <h2 class="mt-4 text-3xl leading-tight font-bold tracking-tight text-slate-950 sm:text-4xl">
                        Review every purchase in one place.
                    </h2>
                    <p class="mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:leading-8">
                        Track recent orders, reopen details, and keep a quick view of fulfillment status without leaving your account.
                    </p>
                </div>

                <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div class="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                        <span class="text-label-xs tracking-label-tight block font-bold text-slate-500 uppercase">Total orders</span>
                        <strong class="mt-1 block text-base font-semibold text-slate-950">{{ totalOrders }}</strong>
                    </div>

                    <label class="grid gap-1 text-sm font-medium text-slate-700">
                        <span>Show per page</span>
                        <BaseSelect
                            v-model="perPage"
                            :options="perPageSelectOptions"
                            class="min-w-36 rounded-full shadow-none focus:border-amber-300 focus:ring-amber-200"
                        />
                    </label>
                </div>
            </div>

            <div ref="ordersStartRef"></div>

            <div v-if="pending" class="mt-6 grid gap-3" aria-hidden="true">
                <div v-for="row in skeletonRows" :key="row" class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div class="animate-pulse space-y-3">
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            <div class="h-5 w-28 rounded-full bg-slate-200"></div>
                            <div class="h-8 w-24 rounded-full bg-slate-200"></div>
                        </div>
                        <div class="grid gap-2 sm:grid-cols-4">
                            <div class="h-4 w-full rounded-full bg-slate-200"></div>
                            <div class="h-4 w-5/6 rounded-full bg-slate-200"></div>
                            <div class="h-4 w-2/3 rounded-full bg-slate-200"></div>
                            <div class="h-4 w-3/4 rounded-full bg-slate-200"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="orders.length" class="mt-6 grid gap-3">
                <article v-for="order in orders" :key="order.id" class="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div class="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <div>
                                <span class="text-label-xs tracking-label-tight block font-bold text-slate-500 uppercase">Order #</span>
                                <strong class="mt-1 block text-sm font-semibold text-slate-950">{{ order.display_id }}</strong>
                            </div>
                            <div>
                                <span class="text-label-xs tracking-label-tight block font-bold text-slate-500 uppercase">Date</span>
                                <strong class="mt-1 block text-sm font-semibold text-slate-950">{{ formatDate(order.created_at) }}</strong>
                            </div>
                            <div>
                                <span class="text-label-xs tracking-label-tight block font-bold text-slate-500 uppercase">Total</span>
                                <strong class="mt-1 block text-sm font-semibold text-slate-950">
                                    {{ formatPrice(Number(order.total), order.currency_code) }}
                                </strong>
                            </div>
                            <div>
                                <span class="text-label-xs tracking-label-tight block font-bold text-slate-500 uppercase">Currency</span>
                                <strong class="mt-1 block text-sm font-semibold text-slate-950">{{
                                    order.currency_code.toUpperCase()
                                }}</strong>
                            </div>
                        </div>

                        <div class="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
                            <span
                                class="border-brand-100 bg-brand-50 inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-sm font-semibold text-slate-900"
                            >
                                {{ formatFulfillmentStatus(order.fulfillment_status) }}
                            </span>
                            <NuxtLink
                                :to="`/account/orders/${order.id}`"
                                class="inline-flex min-h-10 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden motion-reduce:transition-none"
                            >
                                View order
                            </NuxtLink>
                        </div>
                    </div>
                </article>
            </div>

            <div v-else class="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                <div
                    class="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-900"
                >
                    <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                        <path d="M6 7h12" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M8 4h8v4H8z" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M5 7h14v11H5z" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M9 11h6" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M9 15h4" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
                <div>
                    <h2 class="text-xl font-semibold text-slate-950">No orders yet</h2>
                    <p class="mt-2 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                        Your recent purchases will appear here once you place an order.
                    </p>
                </div>
            </div>

            <div v-if="totalOrders > perPage" class="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button
                    type="button"
                    class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-amber-200 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
                    :disabled="page <= 1"
                    aria-label="Go to previous order page"
                    @click="changePage(page - 1)"
                >
                    ‹
                </button>

                <button
                    v-for="pageNumber in totalPages"
                    :key="pageNumber"
                    type="button"
                    class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-semibold transition motion-reduce:transition-none"
                    :class="
                        pageNumber === page
                            ? 'border-amber-300 bg-amber-50 text-slate-950 ring-1 ring-amber-100'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-amber-200 hover:text-slate-950'
                    "
                    :aria-current="pageNumber === page ? 'page' : undefined"
                    @click="changePage(pageNumber)"
                >
                    {{ pageNumber }}
                </button>

                <button
                    type="button"
                    class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-amber-200 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
                    :disabled="page >= totalPages"
                    aria-label="Go to next order page"
                    @click="changePage(page + 1)"
                >
                    ›
                </button>
            </div>
        </section>
    </div>
</template>
