<script setup lang="ts">
import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"
import NuxtImage from "~/components/Shared/NuxtImage.vue"

type ShippingOption = {
    title: string
    detail: string
}

type PolicyBlock = {
    eyebrow: string
    title: string
    text: string
}

type ShippingFaqItem = {
    question: string
    answer: string
}

const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: "Payment & Shipping" }])

const shippingOptions: ShippingOption[] = [
    {
        title: "Standard shipping",
        detail: "Delivery within 5-7 business days for most domestic orders."
    },
    {
        title: "Expedited shipping",
        detail: "A faster option when you need delivery within 2-3 business days."
    },
    {
        title: "International delivery",
        detail: "Available in select countries with timing based on destination and customs handling."
    }
]

const paymentMethods = ["Visa", "Mastercard", "American Express", "PayPal", "Apple Pay", "Google Pay"]

const policyBlocks: PolicyBlock[] = [
    {
        eyebrow: "Shipping Policy",
        title: "Delivery details kept clear from checkout to tracking.",
        text: "Orders are usually processed within 1-2 business days. Shipping rates are calculated at checkout based on destination, parcel details, and the delivery option you choose."
    },
    {
        eyebrow: "Payment Information",
        title: "Secure payment flows with familiar methods and transparent confirmation.",
        text: "Payments are processed through trusted providers using industry-standard security. We do not store full card details, and order confirmation follows once payment is approved."
    }
]

const shippingFaq: ShippingFaqItem[] = [
    {
        question: "How do I track my shipment?",
        answer: "As soon as your order is dispatched, you receive a confirmation email with tracking details so you can follow the parcel in transit."
    },
    {
        question: "Why was my payment declined?",
        answer: "A payment can fail if billing information does not match the card issuer records, the provider flags the transaction, or the method has temporary limitations. Double-check the details and try again or contact support."
    },
    {
        question: "Do taxes and duties apply internationally?",
        answer: "Depending on the destination country, customs duties, VAT, or other local fees may apply. These charges are the responsibility of the customer unless otherwise stated at checkout."
    }
]

const supportDetails = [
    {
        label: "Order processing",
        value: "Usually within 1-2 business days"
    },
    {
        label: "Support hours",
        value: "Mon-Fri, 09:00-17:00"
    },
    {
        label: "Best for",
        value: "Billing questions, failed payments, shipping timing, and tracking help"
    }
]

const shippingChecklist = [
    "Review shipping rates and timing at checkout before payment",
    "Use the same billing details your card provider has on file",
    "Keep your confirmation email for tracking and follow-up"
]

const openFaqPanels = ref<number[]>([0])

function isFaqOpen(index: number): boolean {
    return openFaqPanels.value.includes(index)
}

function toggleFaq(index: number): void {
    if (openFaqPanels.value.includes(index)) {
        openFaqPanels.value = openFaqPanels.value.filter((item) => item !== index)
        return
    }

    openFaqPanels.value = [...openFaqPanels.value, index]
}

useHead({
    title: "Payment & Shipping | Medusa Commerce"
})

useSeoMeta({
    description:
        "Review Medusa Commerce payment methods, shipping options, order processing, tracking, and international delivery guidance."
})
</script>

<template>
    <section class="bg-linear-to-b from-brand-50 via-white to-brand-50">
        <div class="px-0 pt-15 pb-8 sm:pt-18 xl:pt-23">
            <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
                <div class="grid items-end gap-8 xl:grid-cols-2 xl:gap-10">
                    <div class="max-w-2xl xl:pb-6">
                        <AppBreadcrumbs :items="breadcrumbItems" class="mb-4" />
                        <span
                            class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                        >
                            Payment & shipping
                        </span>
                        <h1
                            class="mt-4 text-3xl leading-none font-bold tracking-tighter text-slate-950 sm:text-5xl xl:max-w-md xl:text-7xl"
                        >
                            Delivery and checkout guidance shaped to match the refreshed storefront.
                        </h1>
                        <p class="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                            This page covers how orders move, which payment methods we support, and what to expect from confirmation through
                            delivery.
                        </p>
                        <div class="mt-7 flex flex-wrap items-center gap-3">
                            <NuxtLink to="/contact" class="ui-btn-primary px-7">Ask a question</NuxtLink>
                            <NuxtLink to="/faq" class="ui-btn-secondary px-6">Browse FAQ</NuxtLink>
                        </div>
                    </div>

                    <div
                        class="relative rounded-panel border border-white/80 bg-white/90 p-3 shadow-panel sm:rounded-4xl sm:p-4"
                    >
                        <div class="relative overflow-hidden rounded-card sm:rounded-panel">
                            <NuxtImage
                                src="/images/hero-main.jpg"
                                alt="Checkout and delivery guidance visual"
                                width="1200"
                                height="1411"
                                sizes="100vw lg:45vw"
                                format="webp"
                                quality="68"
                                loading="lazy"
                                decoding="async"
                                class="block aspect-square w-full object-cover object-center"
                            />
                            <div
                                class="absolute inset-0 bg-linear-to-br from-slate-950/20 via-transparent to-white/10"
                            ></div>
                        </div>

                        <div
                            class="text-label-sm absolute top-3 left-3 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 px-4 py-2 font-semibold tracking-widest text-slate-950 shadow-card sm:top-5 sm:left-5"
                        >
                            <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                            Quick overview
                        </div>

                        <div
                            class="absolute inset-x-3 bottom-3 rounded-card-sm border border-white/10 bg-slate-950/90 p-4 text-white shadow-xl sm:inset-x-5 sm:bottom-5 sm:p-5"
                        >
                            <span class="text-label-eyebrow-sm tracking-label font-bold text-amber-200 uppercase">Accepted methods</span>
                            <ul class="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-100">
                                <li v-for="method in paymentMethods" :key="method" class="flex items-center gap-2">
                                    <span class="h-2 w-2 rounded-full bg-amber-300"></span>
                                    <span>{{ method }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 sm:pb-8">
            <div class="grid gap-4 md:grid-cols-3">
                <article
                    v-for="option in shippingOptions"
                    :key="option.title"
                    class="rounded-3xl border border-white/80 bg-linear-to-b from-white to-slate-50 p-5 shadow-card"
                >
                    <h2 class="text-xl leading-7 font-semibold text-slate-950">{{ option.title }}</h2>
                    <p class="mt-2 text-sm leading-7 text-slate-600">{{ option.detail }}</p>
                </article>
            </div>
        </div>

        <div class="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:pb-20">
            <div class="grid gap-6 xl:grid-cols-3 xl:gap-8">
                <div class="grid gap-5 xl:col-span-2">
                    <section
                        v-for="block in policyBlocks"
                        :key="block.title"
                        class="rounded-panel border border-white/80 bg-linear-to-b from-white to-slate-50 p-5 shadow-panel sm:p-7 lg:p-8"
                    >
                        <div class="max-w-2xl">
                            <span
                                class="bg-brand-100 text-brand-700 text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full px-4 py-2 font-bold uppercase"
                            >
                                {{ block.eyebrow }}
                            </span>
                            <h2 class="mt-4 text-3xl leading-tight font-bold tracking-tighter text-slate-950 sm:text-4xl">
                                {{ block.title }}
                            </h2>
                            <p class="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                                {{ block.text }}
                            </p>
                        </div>
                    </section>

                    <section
                        class="rounded-panel border border-white/80 bg-linear-to-b from-white to-slate-50 p-5 shadow-panel sm:p-7 lg:p-8"
                    >
                        <div class="max-w-2xl">
                            <span
                                class="bg-brand-100 text-brand-700 text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full px-4 py-2 font-bold uppercase"
                            >
                                Frequently asked
                            </span>
                            <h2 class="mt-4 text-3xl leading-tight font-bold tracking-tighter text-slate-950 sm:text-4xl">
                                Common delivery and payment questions
                            </h2>
                        </div>

                        <div class="mt-6 grid gap-3">
                            <section
                                v-for="(item, itemIndex) in shippingFaq"
                                :key="item.question"
                                class="overflow-hidden rounded-card border border-slate-200 bg-white shadow-card"
                            >
                                <button
                                    type="button"
                                    class="flex w-full items-start justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                                    :aria-controls="`shipping-panel-${itemIndex}`"
                                    :aria-expanded="isFaqOpen(itemIndex)"
                                    @click="toggleFaq(itemIndex)"
                                >
                                    <span class="pr-3 text-base leading-7 font-semibold text-slate-950">
                                        {{ item.question }}
                                    </span>
                                    <span
                                        class="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700"
                                        aria-hidden="true"
                                    >
                                        <svg
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            class="h-4 w-4 transition-transform duration-200"
                                            :class="{ 'rotate-45': isFaqOpen(itemIndex) }"
                                            stroke="currentColor"
                                            stroke-width="1.8"
                                        >
                                            <path d="M10 4V16" stroke-linecap="round" />
                                            <path d="M4 10H16" stroke-linecap="round" />
                                        </svg>
                                    </span>
                                </button>

                                <div
                                    v-if="isFaqOpen(itemIndex)"
                                    :id="`shipping-panel-${itemIndex}`"
                                    class="border-t border-slate-200 px-5 py-4 sm:px-6 sm:py-5"
                                >
                                    <p class="text-sm leading-7 text-slate-600 sm:text-base">
                                        {{ item.answer }}
                                    </p>
                                </div>
                            </section>
                        </div>
                    </section>
                </div>

                <aside class="grid gap-5 xl:sticky xl:top-6 xl:self-start">
                    <div
                        class="rounded-panel border border-white/80 bg-linear-to-b from-white to-slate-50 p-6 shadow-panel sm:p-8"
                    >
                        <span
                            class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                        >
                            Need order help?
                        </span>
                        <h2 class="mt-4 text-2xl leading-tight font-bold tracking-tighter text-slate-950">
                            Reach support for billing or delivery questions.
                        </h2>
                        <p class="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                            If payment does not go through or you need clarification about shipping timing, contact the team and include
                            your order number if available.
                        </p>
                        <div class="mt-6 grid gap-4 border-t border-slate-200 pt-6 text-sm text-slate-700">
                            <div v-for="detail in supportDetails" :key="detail.label">
                                <p class="font-semibold text-slate-950">{{ detail.label }}</p>
                                <p class="mt-1">{{ detail.value }}</p>
                            </div>
                        </div>
                        <NuxtLink to="/contact" class="ui-btn-primary mt-6 w-full justify-center px-7">Get in touch</NuxtLink>
                    </div>

                    <div class="rounded-panel border border-slate-200 bg-white p-6 shadow-card sm:p-8">
                        <span
                            class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full bg-slate-100 px-4 py-2 font-bold text-slate-700 uppercase"
                        >
                            Before checkout
                        </span>
                        <ul class="mt-5 grid gap-4">
                            <li
                                v-for="item in shippingChecklist"
                                :key="item"
                                class="rounded-card-sm flex items-start gap-3 border border-slate-200 bg-slate-50/80 p-4"
                            >
                                <span class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500"></span>
                                <span class="text-sm leading-6 text-slate-700">{{ item }}</span>
                            </li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    </section>
</template>
