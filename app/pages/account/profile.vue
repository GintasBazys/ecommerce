<script setup lang="ts">
import type { APIError, Customer } from "@/types/interfaces"
import type { OrderDTO } from "@medusajs/types"

import { formatDate } from "@/utils/formatDate"
import { formatPrice } from "@/utils/formatPrice"

type ProfileOrdersResponse = {
    orders: OrderDTO[]
    total: number
}

definePageMeta({
    layout: "account",
    middleware: ["auth"]
})

useHead({ title: "Profile | Medusa Commerce" })

const customerStore = useCustomerStore()
const { customer } = storeToRefs(customerStore)
const runtimeConfig = useRuntimeConfig()

const customerData = reactive<Customer>({
    first_name: customer.value?.first_name ?? "",
    last_name: customer.value?.last_name ?? "",
    phone: customer.value?.phone ?? "",
    company_name: customer.value?.company_name ?? ""
})

const isSubmitting = ref<boolean>(false)
const feedback = reactive({
    visible: false,
    text: "",
    tone: "success" as "success" | "error"
})
const fieldErrors = reactive<Record<string, string>>({
    first_name: "",
    last_name: ""
})

const { data: invoiceOrdersData, pending: invoiceOrdersPending } = await useFetch<ProfileOrdersResponse>(
    "/api/orders/orders?page=1&limit=5",
    {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": runtimeConfig.public.PUBLISHABLE_KEY
        }
    }
)

const customerFullName = computed<string>(() => {
    const firstName = customerData.first_name.trim()
    const lastName = customerData.last_name.trim()
    return `${firstName} ${lastName}`.trim() || "Saved to your account"
})
const invoiceOrders = computed<OrderDTO[]>(() => invoiceOrdersData.value?.orders || [])

function validateForm(): boolean {
    fieldErrors.first_name = customerData.first_name.trim() ? "" : "First name is required"
    fieldErrors.last_name = customerData.last_name.trim() ? "" : "Last name is required"

    return !fieldErrors.first_name && !fieldErrors.last_name
}

function clearFieldError(field: "first_name" | "last_name"): void {
    if (fieldErrors[field]) {
        fieldErrors[field] = ""
    }
}

async function onSubmit(): Promise<void> {
    feedback.visible = false

    if (!validateForm()) {
        feedback.text = "Please complete the required fields before saving."
        feedback.tone = "error"
        feedback.visible = true
        return
    }

    isSubmitting.value = true

    try {
        await $fetch("/api/account/update-customer", {
            method: "POST",
            body: customerData,
            credentials: "include"
        })

        customerStore.updateCustomerProfile(customerData)

        feedback.text = "Profile updated!"
        feedback.tone = "success"
        feedback.visible = true
    } catch (error: unknown) {
        const apiError = error as APIError
        feedback.text = apiError.data?.message || "Update failed"
        feedback.tone = "error"
        feedback.visible = true
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="grid gap-5">
        <section class="grid gap-4 lg:grid-cols-2">
            <article class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <span class="text-label-sm tracking-label font-semibold text-slate-500 uppercase">Account email</span>
                <strong class="mt-2 block text-base font-semibold text-slate-950 sm:text-lg">
                    {{ customer?.email || "Saved to your account" }}
                </strong>
                <p class="mt-2 text-sm leading-6 text-slate-600">Used for order updates, account access, and checkout communication.</p>
            </article>

            <article class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <span class="text-label-sm tracking-label font-semibold text-slate-500 uppercase">Customer name</span>
                <strong class="mt-2 block text-base font-semibold text-slate-950 sm:text-lg">
                    {{ customerFullName }}
                </strong>
                <p class="mt-2 text-sm leading-6 text-slate-600">
                    Keep your personal details current so delivery and support stay accurate.
                </p>
            </article>
        </section>

        <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div class="max-w-3xl">
                <span
                    class="bg-brand-100 text-brand-700 text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full px-4 py-2 font-bold uppercase"
                >
                    Profile details
                </span>
                <h2 class="mt-4 text-3xl leading-tight font-bold tracking-tight text-slate-950 sm:text-4xl">
                    Keep your account details up to date.
                </h2>
                <p class="mt-3 text-base leading-7 text-slate-600 sm:leading-8">
                    Update the core information attached to your account so orders, support, and saved details stay consistent.
                </p>
            </div>

            <div
                v-if="feedback.visible"
                class="mt-6 rounded-2xl border px-4 py-3 text-sm font-medium"
                :class="
                    feedback.tone === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                "
                role="status"
                :aria-live="feedback.tone === 'error' ? 'assertive' : 'polite'"
            >
                {{ feedback.text }}
            </div>

            <form class="mt-6 grid gap-5" @submit.prevent="onSubmit">
                <div class="grid gap-5 sm:grid-cols-2">
                    <div class="grid gap-2">
                        <label for="profile-first-name" class="text-sm font-medium text-slate-700">First name</label>
                        <input
                            id="profile-first-name"
                            v-model="customerData.first_name"
                            type="text"
                            autocomplete="given-name"
                            class="min-h-12 rounded-2xl border bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:ring-2 focus:outline-hidden"
                            :class="
                                fieldErrors.first_name
                                    ? 'border-rose-300 focus:border-rose-300 focus:ring-rose-100'
                                    : 'border-slate-300 focus:border-amber-300 focus:ring-amber-200'
                            "
                            placeholder="Enter your first name"
                            @input="clearFieldError('first_name')"
                        />
                        <p v-if="fieldErrors.first_name" class="text-sm text-rose-600">{{ fieldErrors.first_name }}</p>
                    </div>

                    <div class="grid gap-2">
                        <label for="profile-last-name" class="text-sm font-medium text-slate-700">Last name</label>
                        <input
                            id="profile-last-name"
                            v-model="customerData.last_name"
                            type="text"
                            autocomplete="family-name"
                            class="min-h-12 rounded-2xl border bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:ring-2 focus:outline-hidden"
                            :class="
                                fieldErrors.last_name
                                    ? 'border-rose-300 focus:border-rose-300 focus:ring-rose-100'
                                    : 'border-slate-300 focus:border-amber-300 focus:ring-amber-200'
                            "
                            placeholder="Enter your last name"
                            @input="clearFieldError('last_name')"
                        />
                        <p v-if="fieldErrors.last_name" class="text-sm text-rose-600">{{ fieldErrors.last_name }}</p>
                    </div>

                    <div class="grid gap-2">
                        <label for="profile-phone" class="text-sm font-medium text-slate-700">Phone</label>
                        <input
                            id="profile-phone"
                            v-model="customerData.phone"
                            type="tel"
                            autocomplete="tel"
                            class="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-200 focus:outline-hidden"
                            placeholder="Add a phone number"
                        />
                    </div>

                    <div class="grid gap-2">
                        <label for="profile-company" class="text-sm font-medium text-slate-700">Company name</label>
                        <input
                            id="profile-company"
                            v-model="customerData.company_name"
                            type="text"
                            autocomplete="organization"
                            class="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-200 focus:outline-hidden"
                            placeholder="Add a company name"
                        />
                    </div>
                </div>

                <div class="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p class="text-sm leading-6 text-slate-500">Changes are saved to your account immediately after a successful update.</p>
                    <button type="submit" class="ui-btn-accent min-h-12 px-6 motion-reduce:transition-none" :disabled="isSubmitting">
                        {{ isSubmitting ? "Saving..." : "Save changes" }}
                    </button>
                </div>
            </form>
        </section>

        <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div class="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span
                        class="bg-brand-100 text-brand-700 text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full px-4 py-2 font-bold uppercase"
                    >
                        Invoices
                    </span>
                    <h2 class="mt-4 text-2xl leading-tight font-bold tracking-tight text-slate-950 sm:text-3xl">
                        Download recent order invoices.
                    </h2>
                    <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                        Keep PDF copies of recent purchases directly from your profile.
                    </p>
                </div>
                <NuxtLink
                    to="/account/orders"
                    class="inline-flex min-h-10 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden motion-reduce:transition-none"
                >
                    View all orders
                </NuxtLink>
            </div>

            <div v-if="invoiceOrdersPending" class="mt-5 grid gap-3" aria-hidden="true">
                <div v-for="row in 3" :key="row" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div class="animate-pulse space-y-3">
                        <div class="h-4 w-28 rounded-full bg-slate-200"></div>
                        <div class="h-4 w-48 rounded-full bg-slate-200"></div>
                    </div>
                </div>
            </div>

            <div v-else-if="invoiceOrders.length" class="mt-5 grid gap-3">
                <article
                    v-for="order in invoiceOrders"
                    :key="order.id"
                    class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div class="grid gap-1">
                            <strong class="text-sm font-semibold text-slate-950">Order #{{ order.display_id || order.id }}</strong>
                            <p class="text-sm leading-6 text-slate-600">
                                {{ formatDate(order.created_at) || "Date unavailable" }} ·
                                {{ formatPrice(Number(order.total || 0), order.currency_code) }}
                            </p>
                        </div>
                        <a
                            :href="`/api/orders/${order.id}/invoice`"
                            class="inline-flex min-h-10 items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-slate-950 transition hover:border-amber-300 hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden motion-reduce:transition-none"
                        >
                            Download invoice
                        </a>
                    </div>
                </article>
            </div>

            <div v-else class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p class="text-sm leading-6 text-slate-600">Invoices will appear here after you place an order.</p>
            </div>
        </section>
    </div>
</template>
