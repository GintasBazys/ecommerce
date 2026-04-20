<script setup lang="ts">
import type { SchemaNode } from "~/composables/useStructuredData"

import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"

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
    title: "FAQ | Ecommerce"
})

useSeoMeta({
    description: "Browse common answers about delivery, orders, returns, exchanges, and support before contacting the Ecommerce team."
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
    <section
        class="bg-[radial-gradient(circle_at_top_left,rgba(1,12,128,0.07),transparent_24%),linear-gradient(180deg,#f7faff_0%,#ffffff_36%,#f6f9ff_100%)]"
    >
        <div class="px-0 pb-8 pt-[3.75rem] sm:pt-[4.5rem] xl:pt-[5.75rem]">
            <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
                <div class="grid items-end gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] xl:gap-10">
                    <div class="max-w-[40rem] xl:pb-6">
                        <AppBreadcrumbs :items="breadcrumbItems" class="mb-4" />
                        <span
                            class="inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-amber-900"
                        >
                            Help center
                        </span>
                        <h1
                            class="mt-4 text-[2.1rem] font-bold leading-[1] tracking-[-0.06rem] text-slate-950 sm:text-[2.9rem] sm:leading-[0.98] xl:max-w-[11ch] xl:text-[4.1rem] xl:leading-[0.96]"
                        >
                            Answers designed to feel as clear and premium as the rest of the storefront.
                        </h1>
                        <p class="mt-4 max-w-[38rem] text-base leading-7 text-slate-600 sm:text-[1.05rem] sm:leading-8">
                            Start here for the questions customers ask most often. If you need something more specific, our
                            <NuxtLink to="/contact" class="font-semibold text-brand-700 hover:text-brand-900">contact page</NuxtLink>
                            is ready for follow-up.
                        </p>
                        <div class="mt-7 flex flex-wrap items-center gap-3">
                            <NuxtLink to="/contact" class="ui-btn-primary px-7">Contact support</NuxtLink>
                            <NuxtLink to="/shipping" class="ui-btn-secondary px-6">Shipping details</NuxtLink>
                        </div>
                    </div>

                    <div
                        class="relative rounded-[1.75rem] border border-white/80 bg-white/90 p-3 shadow-[0_14px_34px_rgba(8,27,90,0.08)] sm:rounded-[2rem] sm:p-4"
                    >
                        <div class="relative overflow-hidden rounded-[1.4rem] sm:rounded-[1.75rem]">
                            <NuxtImg
                                src="/images/hero-main.jpg"
                                alt="Support and delivery guidance visual"
                                width="1200"
                                height="1411"
                                sizes="100vw lg:45vw"
                                format="webp"
                                quality="68"
                                loading="lazy"
                                decoding="async"
                                class="block aspect-[1.08] w-full object-cover object-center"
                            />
                            <div
                                class="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.2),transparent_45%,rgba(255,255,255,0.08))]"
                            ></div>
                        </div>

                        <div
                            class="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 px-4 py-2 text-[0.78rem] font-semibold tracking-[0.08em] text-slate-950 shadow-[0_8px_20px_rgba(8,27,90,0.1)] sm:left-5 sm:top-5"
                        >
                            <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                            Fast support paths
                        </div>

                        <div
                            class="absolute inset-x-3 bottom-3 rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.9),rgba(15,23,42,0.9))] p-4 text-white shadow-[0_10px_26px_rgba(2,6,23,0.18)] sm:inset-x-5 sm:bottom-5 sm:p-5"
                        >
                            <span class="text-[0.73rem] font-bold uppercase tracking-[0.14em] text-amber-200">Most common topics</span>
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
            <div class="grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.88fr)] xl:gap-8">
                <div class="grid gap-5">
                    <article
                        v-for="section in faqSections"
                        :key="section.id"
                        class="rounded-[1.8rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] p-5 shadow-[0_14px_36px_rgba(8,27,90,0.06)] sm:p-7 lg:p-8"
                    >
                        <div class="max-w-[38rem]">
                            <span
                                class="inline-flex min-h-9 items-center rounded-full bg-brand-100 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-brand-700"
                            >
                                {{ section.eyebrow }}
                            </span>
                            <h2 class="mt-4 text-[1.9rem] font-bold leading-[1.02] tracking-[-0.05rem] text-slate-950 sm:text-[2.35rem]">
                                {{ section.title }}
                            </h2>
                            <p class="mt-4 text-base leading-7 text-slate-600 sm:text-[1.02rem] sm:leading-8">
                                {{ section.description }}
                            </p>
                        </div>

                        <div class="mt-6 grid gap-3">
                            <section
                                v-for="(item, itemIndex) in section.items"
                                :key="item.question"
                                class="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_8px_20px_rgba(8,27,90,0.04)]"
                            >
                                <button
                                    type="button"
                                    class="flex w-full items-start justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                                    :aria-controls="`${section.id}-panel-${itemIndex}`"
                                    :aria-expanded="isPanelOpen(section.id, itemIndex)"
                                    @click="togglePanel(section.id, itemIndex)"
                                >
                                    <span class="pr-3 text-[1rem] font-semibold leading-7 text-slate-950 sm:text-[1.05rem]">
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
                                    <p class="text-sm leading-7 text-slate-600 sm:text-[0.98rem]">
                                        {{ item.answer }}
                                    </p>
                                </div>
                            </section>
                        </div>
                    </article>
                </div>

                <aside class="grid gap-5 xl:sticky xl:top-6 xl:self-start">
                    <div
                        class="rounded-[1.8rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] p-6 shadow-[0_14px_36px_rgba(8,27,90,0.06)] sm:p-8"
                    >
                        <span
                            class="inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-amber-900"
                        >
                            Still need help?
                        </span>
                        <h2 class="mt-4 text-[1.6rem] font-bold leading-[1.05] tracking-[-0.04rem] text-slate-950">
                            Talk to the support team directly.
                        </h2>
                        <p class="mt-4 text-sm leading-7 text-slate-600 sm:text-[0.98rem]">
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

                    <div class="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(8,27,90,0.05)] sm:p-8">
                        <span
                            class="inline-flex min-h-9 items-center rounded-full bg-slate-100 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-slate-700"
                        >
                            Useful next steps
                        </span>
                        <div class="mt-5 grid gap-4">
                            <NuxtLink
                                to="/shipping"
                                class="rounded-[1.2rem] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-brand-200 hover:text-brand-700"
                            >
                                Payment and shipping details
                            </NuxtLink>
                            <NuxtLink
                                to="/returns"
                                class="rounded-[1.2rem] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-brand-200 hover:text-brand-700"
                            >
                                Returns and exchange guidance
                            </NuxtLink>
                            <NuxtLink
                                to="/contact"
                                class="rounded-[1.2rem] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-brand-200 hover:text-brand-700"
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
