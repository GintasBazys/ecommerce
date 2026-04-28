<script setup lang="ts">
import type { SchemaNode } from "~/composables/useStructuredData"

import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"
import NuxtImage from "~/components/Shared/NuxtImage.vue"

type FaqItem = {
    question: string
    answer: string
}

type FaqSection = {
    id: string
    eyebrow: string
    title: string
    description: string
    items: FaqItem[]
}

const route = useRoute()
const { absoluteUrl } = useSiteIdentity()
const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: "FAQ" }])

const faqSections: FaqSection[] = [
    {
        id: "orders",
        eyebrow: "Shopping Support",
        title: "Orders and delivery",
        description: "The questions customers ask most often before checkout, after payment, and while an order is on the way.",
        items: [
            {
                question: "How quickly do you process new orders?",
                answer: "Most orders are reviewed and prepared within one business day. During promotions or holidays, processing may take a little longer, but we always follow up if timing changes."
            },
            {
                question: "Can I update my delivery details after checkout?",
                answer: "Yes, if the order has not been dispatched yet. Use the contact page as soon as possible and include your order number so the support team can check the shipment status."
            },
            {
                question: "Do you ship internationally?",
                answer: "Yes. Delivery times vary by country and carrier, but we aim to keep the process straightforward and provide tracking as soon as the parcel leaves our warehouse."
            }
        ]
    },
    {
        id: "returns",
        eyebrow: "After Purchase",
        title: "Returns, exchanges, and follow-up",
        description: "Answers for the moments when a product is not quite right or you need more help after delivery.",
        items: [
            {
                question: "What should I do if my item arrives damaged?",
                answer: "Contact us with your order number and a few photos of the issue. We will review it quickly and explain the next step, whether that is a replacement, return, or refund."
            },
            {
                question: "Can I exchange an item for something else?",
                answer: "In many cases, yes. Availability depends on stock and timing, so the fastest option is to message support and tell us what you want to change."
            },
            {
                question: "Where can I get help if I still have questions?",
                answer: "If this page does not cover it, head to the contact page. Our team can help with product guidance, order updates, payment concerns, and post-purchase issues."
            }
        ]
    }
]

const quickTopics = ["Order tracking and delivery timing", "Returns or exchange guidance", "Product recommendations before checkout"]

const supportDetails = [
    {
        label: "Response time",
        value: "Usually within one business day"
    },
    {
        label: "Support hours",
        value: "Mon-Fri, 09:00-17:00"
    },
    {
        label: "Best for",
        value: "Order updates, delivery questions, returns, and product guidance"
    }
]

const panelState = reactive<Record<string, number[]>>(Object.fromEntries(faqSections.map((section) => [section.id, [0]])))

function isPanelOpen(sectionId: string, itemIndex: number): boolean {
    return panelState[sectionId]?.includes(itemIndex) ?? false
}

function togglePanel(sectionId: string, itemIndex: number): void {
    const current = panelState[sectionId] ?? []

    if (current.includes(itemIndex)) {
        panelState[sectionId] = current.filter((index) => index !== itemIndex)
        return
    }

    panelState[sectionId] = [...current, itemIndex]
}

useHead({
    title: "FAQ | Medusa Commerce"
})

useSeoMeta({
    description: "Browse common answers about delivery, orders, returns, exchanges, and support before contacting the Medusa Commerce team."
})

const faqSchema = computed<SchemaNode>(() => ({
    "@type": "FAQPage",
    "@id": `${absoluteUrl(route.path)}#faq`,
    mainEntity: faqSections.flatMap((section) =>
        section.items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer
            }
        }))
    )
}))

const breadcrumbSchema = computed<SchemaNode>(() =>
    createBreadcrumbSchema(
        [
            { name: "Home", path: "/" },
            { name: "FAQ", path: route.path }
        ],
        absoluteUrl
    )
)

useStructuredData(() => [faqSchema.value, breadcrumbSchema.value], "faq-structured-data")
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
                            Help center
                        </span>
                        <h1
                            class="mt-4 text-3xl leading-none font-bold tracking-tighter text-slate-950 sm:text-5xl xl:max-w-md xl:text-7xl"
                        >
                            Answers designed to feel as clear and premium as the rest of the storefront.
                        </h1>
                        <p class="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                            Start here for the questions customers ask most often. If you need something more specific, our
                            <NuxtLink to="/contact" class="text-brand-700 hover:text-brand-900 font-semibold">contact page</NuxtLink>
                            is ready for follow-up.
                        </p>
                        <div class="mt-7 flex flex-wrap items-center gap-3">
                            <NuxtLink to="/contact" class="ui-btn-primary px-7">Contact support</NuxtLink>
                            <NuxtLink to="/shipping" class="ui-btn-secondary px-6">Shipping details</NuxtLink>
                        </div>
                    </div>

                    <div
                        class="relative rounded-panel border border-white/80 bg-white/90 p-3 shadow-panel sm:rounded-4xl sm:p-4"
                    >
                        <div class="relative overflow-hidden rounded-card sm:rounded-panel">
                            <NuxtImage
                                src="/images/hero-main.jpg"
                                alt="Support and delivery guidance visual"
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
                            Fast support paths
                        </div>

                        <div
                            class="absolute inset-x-3 bottom-3 rounded-card-sm border border-white/10 bg-slate-950/90 p-4 text-white shadow-xl sm:inset-x-5 sm:bottom-5 sm:p-5"
                        >
                            <span class="text-label-eyebrow-sm tracking-label font-bold text-amber-200 uppercase">Most common topics</span>
                            <ul class="mt-4 grid gap-3">
                                <li
                                    v-for="topic in quickTopics"
                                    :key="topic"
                                    class="flex items-start gap-3 text-sm leading-6 text-slate-100"
                                >
                                    <span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-300"></span>
                                    <span>{{ topic }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:pb-20">
            <div class="grid gap-6 xl:grid-cols-3 xl:gap-8">
                <div class="grid gap-5 xl:col-span-2">
                    <article
                        v-for="section in faqSections"
                        :key="section.id"
                        class="rounded-panel border border-white/80 bg-linear-to-b from-white to-slate-50 p-5 shadow-panel sm:p-7 lg:p-8"
                    >
                        <div class="max-w-2xl">
                            <span
                                class="bg-brand-100 text-label-sm tracking-label text-brand-700 inline-flex min-h-9 items-center rounded-full px-4 py-2 font-bold uppercase"
                            >
                                {{ section.eyebrow }}
                            </span>
                            <h2 class="mt-4 text-3xl leading-tight font-bold tracking-tighter text-slate-950 sm:text-4xl">
                                {{ section.title }}
                            </h2>
                            <p class="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                                {{ section.description }}
                            </p>
                        </div>

                        <div class="mt-6 grid gap-3">
                            <section
                                v-for="(item, itemIndex) in section.items"
                                :key="item.question"
                                class="overflow-hidden rounded-card border border-slate-200 bg-white shadow-card"
                            >
                                <button
                                    type="button"
                                    class="flex w-full items-start justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                                    :aria-controls="`${section.id}-panel-${itemIndex}`"
                                    :aria-expanded="isPanelOpen(section.id, itemIndex)"
                                    @click="togglePanel(section.id, itemIndex)"
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
                                            :class="{ 'rotate-45': isPanelOpen(section.id, itemIndex) }"
                                            stroke="currentColor"
                                            stroke-width="1.8"
                                        >
                                            <path d="M10 4V16" stroke-linecap="round" />
                                            <path d="M4 10H16" stroke-linecap="round" />
                                        </svg>
                                    </span>
                                </button>

                                <div
                                    v-if="isPanelOpen(section.id, itemIndex)"
                                    :id="`${section.id}-panel-${itemIndex}`"
                                    class="border-t border-slate-200 px-5 py-4 sm:px-6 sm:py-5"
                                >
                                    <p class="text-sm leading-7 text-slate-600 sm:text-base">
                                        {{ item.answer }}
                                    </p>
                                </div>
                            </section>
                        </div>
                    </article>
                </div>

                <aside class="grid gap-5 xl:sticky xl:top-6 xl:self-start">
                    <div
                        class="rounded-panel border border-white/80 bg-linear-to-b from-white to-slate-50 p-6 shadow-panel sm:p-8"
                    >
                        <span
                            class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                        >
                            Still need help?
                        </span>
                        <h2 class="mt-4 text-2xl leading-tight font-bold tracking-tighter text-slate-950">
                            Talk to the support team directly.
                        </h2>
                        <p class="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                            If your question is about a current order or a product choice, send us a message and we will point you in the
                            right direction.
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
                            Useful next steps
                        </span>
                        <div class="mt-5 grid gap-4">
                            <NuxtLink
                                to="/shipping"
                                class="hover:border-brand-200 hover:text-brand-700 rounded-card-sm border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm font-semibold text-slate-800 transition"
                            >
                                Payment and shipping details
                            </NuxtLink>
                            <NuxtLink
                                to="/returns"
                                class="hover:border-brand-200 hover:text-brand-700 rounded-card-sm border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm font-semibold text-slate-800 transition"
                            >
                                Returns and exchange guidance
                            </NuxtLink>
                            <NuxtLink
                                to="/contact"
                                class="hover:border-brand-200 hover:text-brand-700 rounded-card-sm border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm font-semibold text-slate-800 transition"
                            >
                                Contact support for a direct answer
                            </NuxtLink>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    </section>
</template>
