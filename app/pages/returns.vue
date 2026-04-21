<script setup lang="ts">
import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"
import NuxtImage from "~/components/Shared/NuxtImage.vue"

type ReturnStep = {
    number: string
    title: string
    detail: string
}

type PolicyHighlight = {
    title: string
    text: string
}

type ReturnFaqItem = {
    question: string
    answer: string
}

const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: "Returns" }])

const returnSteps: ReturnStep[] = [
    {
        number: "01",
        title: "Start your return",
        detail: "Open your account, choose the order, and request a return from the item details page."
    },
    {
        number: "02",
        title: "Pack everything securely",
        detail: "Use the original packaging when possible and include all tags, accessories, and inserts."
    },
    {
        number: "03",
        title: "Send it back",
        detail: "Attach the label, drop the parcel with the carrier, and we will confirm once it is received."
    }
]

const policyHighlights: PolicyHighlight[] = [
    {
        title: "30-day return window",
        text: "Eligible items can be returned within 30 days of delivery for a refund or exchange."
    },
    {
        title: "Condition matters",
        text: "Products should be unused, in original condition, and returned with packaging and accessories."
    },
    {
        title: "Fast support for damaged items",
        text: "If something arrives damaged or defective, contact us within 48 hours so we can help quickly."
    }
]

const returnFaq: ReturnFaqItem[] = [
    {
        question: "Are all items eligible for return?",
        answer: "Most standard items are, but final sale products, personalized orders, and perishable goods are excluded. If you are unsure about an item, contact support before sending it back."
    },
    {
        question: "Do I have to pay for return shipping?",
        answer: "Domestic returns are usually covered with a prepaid label. For international returns, the return shipping cost may be deducted from the refund depending on destination and carrier."
    },
    {
        question: "How long does a refund take?",
        answer: "Once the parcel reaches us and the return is approved, refunds are typically processed within a few business days. Your bank or payment provider may take additional time to post the funds."
    }
]

const returnChecklist = [
    "Include your order number in any return request",
    "Keep original packaging and accessories when possible",
    "Contact support first if the item arrived damaged or incorrect"
]

const supportDetails = [
    {
        label: "Return window",
        value: "30 days from delivery for eligible items"
    },
    {
        label: "Support hours",
        value: "Mon-Fri, 09:00-17:00"
    },
    {
        label: "Best for",
        value: "Return approvals, damaged items, exchanges, and refund timing"
    }
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
    title: "Returns | Ecommerce"
})

useSeoMeta({
    description: "Read the Ecommerce returns policy, return window, refund timing, and support guidance in a clear mobile-first format."
})
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
                            Returns center
                        </span>
                        <h1
                            class="mt-4 text-[2.1rem] font-bold leading-[1] tracking-[-0.06rem] text-slate-950 sm:text-[2.9rem] sm:leading-[0.98] xl:max-w-[11ch] xl:text-[4.1rem] xl:leading-[0.96]"
                        >
                            A return process designed to feel as clear and calm as the updated storefront.
                        </h1>
                        <p class="mt-4 max-w-[38rem] text-base leading-7 text-slate-600 sm:text-[1.05rem] sm:leading-8">
                            If something is not quite right, the process stays simple: request the return, send the item back, and we will
                            handle the refund or exchange with a straightforward follow-up.
                        </p>
                        <div class="mt-7 flex flex-wrap items-center gap-3">
                            <NuxtLink to="/contact" class="ui-btn-primary px-7">Contact support</NuxtLink>
                            <NuxtLink to="/faq" class="ui-btn-secondary px-6">Browse FAQ</NuxtLink>
                        </div>
                    </div>

                    <div
                        class="relative rounded-[1.75rem] border border-white/80 bg-white/90 p-3 shadow-[0_14px_34px_rgba(8,27,90,0.08)] sm:rounded-[2rem] sm:p-4"
                    >
                        <div class="relative overflow-hidden rounded-[1.4rem] sm:rounded-[1.75rem]">
                            <NuxtImage
                                src="/images/hero-main.jpg"
                                alt="Packaging and support visual for returns guidance"
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
                            Clear return steps
                        </div>

                        <div
                            class="absolute inset-x-3 bottom-3 rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.9),rgba(15,23,42,0.9))] p-4 text-white shadow-[0_10px_26px_rgba(2,6,23,0.18)] sm:inset-x-5 sm:bottom-5 sm:p-5"
                        >
                            <span class="text-[0.73rem] font-bold uppercase tracking-[0.14em] text-amber-200">What to expect</span>
                            <p class="mt-3 max-w-[26rem] text-sm leading-6 text-slate-100 sm:text-[0.95rem]">
                                Three steps, transparent timing, and real help if anything feels unclear before or after the parcel is on
                                the way back.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 sm:pb-8">
            <div class="grid gap-4 md:grid-cols-3">
                <article
                    v-for="step in returnSteps"
                    :key="step.number"
                    class="rounded-[1.5rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 shadow-[0_12px_28px_rgba(8,27,90,0.06)]"
                >
                    <span
                        class="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-600"
                    >
                        {{ step.number }}
                    </span>
                    <h2 class="mt-4 text-xl font-semibold leading-7 text-slate-950">{{ step.title }}</h2>
                    <p class="mt-2 text-sm leading-7 text-slate-600">{{ step.detail }}</p>
                </article>
            </div>
        </div>

        <div class="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:pb-20">
            <div class="grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.88fr)] xl:gap-8">
                <div class="grid gap-5">
                    <section
                        class="rounded-[1.8rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] p-5 shadow-[0_14px_36px_rgba(8,27,90,0.06)] sm:p-7 lg:p-8"
                    >
                        <div class="max-w-[38rem]">
                            <span
                                class="inline-flex min-h-9 items-center rounded-full bg-brand-100 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-brand-700"
                            >
                                Policy overview
                            </span>
                            <h2 class="mt-4 text-[1.9rem] font-bold leading-[1.02] tracking-[-0.05rem] text-slate-950 sm:text-[2.35rem]">
                                Key return guidelines without unnecessary clutter.
                            </h2>
                            <p class="mt-4 text-base leading-7 text-slate-600 sm:text-[1.02rem] sm:leading-8">
                                We want you to feel confident ordering from us. If a product does not work out, the return process should
                                stay predictable and easy to understand.
                            </p>
                        </div>

                        <div class="mt-6 grid gap-4 md:grid-cols-3">
                            <article
                                v-for="item in policyHighlights"
                                :key="item.title"
                                class="rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-[0_8px_20px_rgba(8,27,90,0.04)]"
                            >
                                <h3 class="text-[1.05rem] font-semibold leading-7 text-slate-950">{{ item.title }}</h3>
                                <p class="mt-2 text-sm leading-7 text-slate-600">{{ item.text }}</p>
                            </article>
                        </div>

                        <div
                            class="mt-6 grid gap-4 rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-5 text-sm leading-7 text-slate-600 sm:text-[0.98rem]"
                        >
                            <p>
                                To initiate a return, use your account order history and follow the return instructions for the relevant
                                item. If the return is approved, you will receive the next steps and any applicable shipping label details.
                            </p>
                            <p>
                                Returns should include the original packaging where possible and be sent back in unused condition. This
                                helps us approve refunds faster and keeps exchange handling smoother.
                            </p>
                        </div>
                    </section>

                    <section
                        class="rounded-[1.8rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] p-5 shadow-[0_14px_36px_rgba(8,27,90,0.06)] sm:p-7 lg:p-8"
                    >
                        <div class="max-w-[38rem]">
                            <span
                                class="inline-flex min-h-9 items-center rounded-full bg-brand-100 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-brand-700"
                            >
                                Questions
                            </span>
                            <h2 class="mt-4 text-[1.9rem] font-bold leading-[1.02] tracking-[-0.05rem] text-slate-950 sm:text-[2.35rem]">
                                Return policy FAQ
                            </h2>
                        </div>

                        <div class="mt-6 grid gap-3">
                            <section
                                v-for="(item, itemIndex) in returnFaq"
                                :key="item.question"
                                class="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_8px_20px_rgba(8,27,90,0.04)]"
                            >
                                <button
                                    type="button"
                                    class="flex w-full items-start justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                                    :aria-controls="`returns-panel-${itemIndex}`"
                                    :aria-expanded="isFaqOpen(itemIndex)"
                                    @click="toggleFaq(itemIndex)"
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
                                    :id="`returns-panel-${itemIndex}`"
                                    class="border-t border-slate-200 px-5 py-4 sm:px-6 sm:py-5"
                                >
                                    <p class="text-sm leading-7 text-slate-600 sm:text-[0.98rem]">
                                        {{ item.answer }}
                                    </p>
                                </div>
                            </section>
                        </div>
                    </section>
                </div>

                <aside class="grid gap-5 xl:sticky xl:top-6 xl:self-start">
                    <div
                        class="rounded-[1.8rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] p-6 shadow-[0_14px_36px_rgba(8,27,90,0.06)] sm:p-8"
                    >
                        <span
                            class="inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-amber-900"
                        >
                            Need help first?
                        </span>
                        <h2 class="mt-4 text-[1.6rem] font-bold leading-[1.05] tracking-[-0.04rem] text-slate-950">
                            Talk to support before sending anything back.
                        </h2>
                        <p class="mt-4 text-sm leading-7 text-slate-600 sm:text-[0.98rem]">
                            If your item is damaged, incorrect, or you are not sure whether it is eligible, contact us and include your
                            order number.
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
                            Before you return
                        </span>
                        <ul class="mt-5 grid gap-4">
                            <li
                                v-for="item in returnChecklist"
                                :key="item"
                                class="flex items-start gap-3 rounded-[1.15rem] border border-slate-200 bg-slate-50/80 p-4"
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
