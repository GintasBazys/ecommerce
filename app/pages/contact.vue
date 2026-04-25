<script setup lang="ts">
import ContactForm from "~/components/Forms/ContactForm.vue"
import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"
import NuxtImage from "~/components/Shared/NuxtImage.vue"

type ContactChannel = {
    icon: string
    title: string
    detail: string
    meta: string
    cta: string
    href?: string
    to?: string
}

const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: "Contact" }])

const contactChannels: ContactChannel[] = [
    {
        icon: "/images/contact/email-support.svg",
        title: "Email support",
        detail: "Best for order updates, return requests, and product questions that need a detailed reply.",
        meta: "info@medusa-commerce.de",
        cta: "Send an email",
        href: "mailto:info@medusa-commerce.de"
    },
    {
        icon: "/images/contact/phone-support.svg",
        title: "Call the team",
        detail: "Useful when you need a quick answer before checkout or want to confirm the next support step.",
        meta: "+370 600 00000",
        cta: "Call support",
        href: "tel:+37060000000"
    },
    {
        icon: "/images/contact/help-center.svg",
        title: "Help center",
        detail: "Start with delivery, returns, and order guidance before sending a message to the team.",
        meta: "Shipping, returns, and common support answers",
        cta: "Browse FAQ",
        to: "/faq"
    }
]

const supportPromises = [
    "Typical reply time within one business day",
    "Clear follow-up for products, shipping, and returns",
    "Support handled by a real person from start to finish"
]

const contactChecklist = [
    "Add your order number if you already have one",
    "Mention the product name or selected variant when relevant",
    "Explain the issue or question in a few direct sentences"
]

useHead({
    title: "Contact us | Ecommerce"
})

useSeoMeta({
    description:
        "Contact Ecommerce for product questions, order updates, delivery support, and returns guidance through a calmer premium support experience."
})
</script>

<template>
    <section
        class="bg-[radial-gradient(circle_at_top_left,rgba(1,12,128,0.07),transparent_24%),linear-gradient(180deg,#f7faff_0%,#ffffff_36%,#f6f9ff_100%)]"
    >
        <div class="px-0 pt-[3.75rem] pb-8 sm:pt-[4.5rem] xl:pt-[5.75rem]">
            <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
                <div class="grid items-end gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] xl:gap-10">
                    <div class="max-w-[40rem] xl:pb-6">
                        <AppBreadcrumbs :items="breadcrumbItems" class="mb-4" />
                        <span
                            class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                        >
                            Customer care
                        </span>
                        <h1
                            class="mt-4 text-[2.1rem] leading-[1] font-bold tracking-[-0.06rem] text-slate-950 sm:text-[2.9rem] sm:leading-[0.98] xl:max-w-[11ch] xl:text-[4.25rem] xl:leading-[0.96]"
                        >
                            Support designed to feel as calm and considered as the storefront.
                        </h1>
                        <p class="mt-4 max-w-[38rem] text-base leading-7 text-slate-600 sm:text-[1.05rem] sm:leading-8">
                            Reach out for product guidance, delivery questions, returns, or order updates. The support flow stays clear,
                            practical, and easy to use on mobile.
                        </p>
                        <div class="mt-7 flex flex-wrap items-center gap-3">
                            <NuxtLink to="/faq" class="ui-btn-primary px-7">Browse FAQ</NuxtLink>
                            <a href="mailto:info@medusa-commerce.de" class="ui-btn-secondary px-6">Email support</a>
                        </div>
                        <ul class="mt-6 flex flex-wrap gap-2.5" aria-label="Contact support highlights">
                            <li
                                v-for="item in supportPromises"
                                :key="item"
                                class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold tracking-[0.08em] text-slate-700"
                            >
                                <span class="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true"></span>
                                {{ item }}
                            </li>
                        </ul>
                    </div>

                    <div
                        class="relative rounded-[1.75rem] border border-white/80 bg-white/90 p-3 shadow-[0_14px_34px_rgba(8,27,90,0.08)] sm:rounded-[2rem] sm:p-4"
                    >
                        <div class="relative overflow-hidden rounded-[1.4rem] sm:rounded-[1.75rem]">
                            <NuxtImage
                                src="/images/hero-main.jpg"
                                alt="Premium support and product consultation atmosphere"
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
                            class="text-label-sm absolute top-3 left-3 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 px-4 py-2 font-semibold tracking-[0.08em] text-slate-950 shadow-[0_8px_20px_rgba(8,27,90,0.1)] sm:top-5 sm:left-5"
                        >
                            <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                            Real support from Vilnius
                        </div>

                        <div
                            class="absolute inset-x-3 bottom-3 rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.9),rgba(15,23,42,0.9))] p-4 text-white shadow-[0_10px_26px_rgba(2,6,23,0.18)] sm:inset-x-5 sm:bottom-5 sm:p-5"
                        >
                            <div class="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <span class="text-label-eyebrow-sm tracking-label font-bold text-amber-200 uppercase"
                                    >Average response</span
                                    >
                                    <div class="mt-2 flex items-end gap-2">
                                        <strong class="text-3xl leading-none sm:text-[2rem]">1 business day</strong>
                                        <span class="pb-0.5 text-sm text-slate-200">for most requests</span>
                                    </div>
                                </div>
                                <span
                                    class="inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-slate-100"
                                >
                                    Mon-Fri, 09:00-17:00
                                </span>
                            </div>
                            <p class="mt-3 max-w-[26rem] text-sm leading-6 text-slate-100 sm:text-[0.95rem]">
                                Practical help for product questions, order updates, and post-purchase follow-up without a complicated
                                support flow.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 sm:pb-8">
            <div class="grid gap-4 md:grid-cols-3">
                <article
                    v-for="channel in contactChannels"
                    :key="channel.title"
                    class="rounded-[1.5rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 shadow-[0_12px_28px_rgba(8,27,90,0.06)]"
                >
                    <div
                        class="inline-flex h-14 w-14 items-center justify-center rounded-[1rem] border border-amber-200/70 bg-[linear-gradient(180deg,rgba(254,243,199,0.85),rgba(255,255,255,0.98))]"
                    >
                        <img :src="channel.icon" alt="" class="h-10 w-10" loading="lazy" width="40" height="40" />
                    </div>
                    <h2 class="mt-4 text-xl leading-7 font-semibold text-slate-950">{{ channel.title }}</h2>
                    <p class="mt-2 text-sm leading-7 text-slate-600">{{ channel.detail }}</p>
                    <p class="mt-3 text-sm font-semibold text-slate-800">{{ channel.meta }}</p>
                    <NuxtLink
                        v-if="channel.to"
                        :to="channel.to"
                        class="text-brand-700 hover:text-brand-900 mt-4 inline-flex text-sm font-semibold"
                    >
                        {{ channel.cta }}
                    </NuxtLink>
                    <a v-else :href="channel.href" class="text-brand-700 hover:text-brand-900 mt-4 inline-flex text-sm font-semibold">
                        {{ channel.cta }}
                    </a>
                </article>
            </div>
        </div>

        <div class="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:pb-20">
            <div class="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] xl:gap-8">
                <div>
                    <div class="max-w-[38rem]">
                        <span
                            class="bg-brand-100 text-brand-700 text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full px-4 py-2 font-bold uppercase"
                        >
                            Send a message
                        </span>
                        <h2 class="mt-4 text-[1.95rem] leading-[1.02] font-bold tracking-[-0.05rem] text-slate-950 sm:text-[2.5rem]">
                            Share the details and the team will take it from there.
                        </h2>
                        <p class="mt-4 text-base leading-7 text-slate-600 sm:text-[1.02rem] sm:leading-8">
                            Add the basics once and keep the follow-up simple. The form is designed to be quick on mobile and detailed
                            enough for order-related support.
                        </p>
                    </div>

                    <div
                        class="mt-6 rounded-[1.8rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] p-5 shadow-[0_14px_36px_rgba(8,27,90,0.06)] sm:p-7 lg:p-8"
                    >
                        <ContactForm />
                    </div>
                </div>

                <aside class="grid gap-5 xl:sticky xl:top-6 xl:self-start">
                    <div
                        class="rounded-[1.8rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] p-6 shadow-[0_14px_36px_rgba(8,27,90,0.06)] sm:p-8"
                    >
                        <span
                            class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                        >
                            Support desk
                        </span>
                        <h2 class="mt-4 text-[1.6rem] leading-[1.05] font-bold tracking-[-0.04rem] text-slate-950">
                            Built for practical support before and after checkout.
                        </h2>
                        <p class="mt-4 text-sm leading-7 text-slate-600 sm:text-[0.98rem]">
                            The team works from Vilnius and handles product questions, delivery concerns, returns, and follow-up for recent
                            orders.
                        </p>
                        <div class="mt-6 grid gap-4 border-t border-slate-200 pt-6 text-sm text-slate-700">
                            <div>
                                <p class="font-semibold text-slate-950">Location</p>
                                <p class="mt-1">Vilnius, Lithuania</p>
                            </div>
                            <div>
                                <p class="font-semibold text-slate-950">Business hours</p>
                                <p class="mt-1">Mon-Fri, 09:00-17:00</p>
                            </div>
                            <div>
                                <p class="font-semibold text-slate-950">Best for</p>
                                <p class="mt-1">Delivery updates, product guidance, returns, and order support</p>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(8,27,90,0.05)] sm:p-8">
                        <span
                            class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full bg-slate-100 px-4 py-2 font-bold text-slate-700 uppercase"
                        >
                            Before you send
                        </span>
                        <h2 class="mt-4 text-[1.45rem] leading-[1.08] font-bold tracking-[-0.04rem] text-slate-950">
                            A few direct details help us reply faster.
                        </h2>
                        <ul class="mt-5 grid gap-4">
                            <li
                                v-for="item in contactChecklist"
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
