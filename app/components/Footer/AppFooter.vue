<script setup lang="ts">
import type { NavLink } from "@/types/interfaces"

import NuxtImage from "~/components/Shared/NuxtImage.vue"
import { ALL_PRODUCTS_URL_HANDLE, BLOG_HANDLE, CATEGORY_HANDLE } from "~/utils/consts"

const { categories } = useProductStore()

const helpLinks: NavLink[] = [
    { label: "FAQ", to: "/faq" },
    { label: "Returns", to: "/returns" },
    { label: "Payment & Shipping", to: "/shipping" },
    { label: "Contact Us", to: "/contact" }
]

const aboutLinks: NavLink[] = [
    { label: "About Us", to: "/about" },
    { label: "Blog", to: BLOG_HANDLE },
    { label: "Contact Us", to: "/contact" },
    { label: "Facebook", to: "https://facebook.com" },
    { label: "Instagram", to: "https://instagram.com" }
]

const paymentIcons = [
    { src: "/images/mastercard.svg", alt: "Mastercard" },
    { src: "/images/visa-blue.svg", alt: "Visa" }
]

const currentYear = useState<number>("footer-current-year", () => new Date().getFullYear())
const isClientHydrated = ref(false)
const supportEmail = "info@medusa-commerce.de"
const supportPhone = "+370 600 00000"
const supportPhoneHref = "tel:+37060000000"
const { openBanner } = useCookieConsent()

onMounted(() => {
    isClientHydrated.value = true
})

const expandedMobileSections = reactive<Record<string, boolean>>({
    help: true,
    categories: true,
    about: true
})

function toggleMobileSection(key: "help" | "categories" | "about"): void {
    expandedMobileSections[key] = !expandedMobileSections[key]
}
</script>

<template>
    <footer class="bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
        <div class="mx-auto w-full max-w-7xl px-4 pt-14 pb-8 md:px-6 md:pt-16">
            <section
                class="grid gap-6 rounded-4xl border border-white/15 bg-white/5 p-5 shadow-2xl sm:p-6 lg:grid-cols-2 lg:items-end lg:gap-8 lg:p-8"
            >
                <div>
                    <span
                        class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/20 bg-amber-50/10 px-4 py-2 font-bold text-amber-100 uppercase"
                    >
                        Ecommerce
                    </span>
                    <h2 class="mt-4 max-w-lg text-4xl leading-tight font-bold tracking-tighter text-white sm:text-5xl lg:text-6xl">
                        A more polished finish to every shopping journey.
                    </h2>
                    <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-200/90 sm:text-base sm:leading-8">
                        Browse with clarity, get practical support fast, and move from discovery to checkout with the same calm, premium
                        feel across the entire storefront.
                    </p>

                    <div class="mt-6 flex flex-wrap gap-3">
                        <div class="rounded-card-sm border border-white/15 bg-white/5 px-4 py-3 shadow-inner">
                            <span class="text-label-xs tracking-label block font-semibold text-slate-300 uppercase">
                                Worldwide delivery
                            </span>
                            <strong class="mt-1 block text-base font-semibold text-white">Mobile-first checkout flow</strong>
                        </div>
                        <div class="rounded-card-sm border border-white/15 bg-white/5 px-4 py-3 shadow-inner">
                            <span class="text-label-xs tracking-label block font-semibold text-slate-300 uppercase">Trusted support</span>
                            <strong class="mt-1 block text-base font-semibold text-white">Real help before and after purchase</strong>
                        </div>
                    </div>
                </div>

                <aside class="rounded-3xl border border-white/15 bg-white/5 p-5 shadow-xl sm:p-6">
                    <div class="mb-4 h-px w-full bg-linear-to-r from-slate-400/0 via-amber-200/60 to-slate-400/0"></div>
                    <p class="text-label-eyebrow tracking-label font-bold text-amber-100 uppercase">Need help?</p>
                    <h3 class="mt-3 text-2xl font-semibold tracking-tight text-white">Talk to support</h3>
                    <p class="mt-3 max-w-md text-sm leading-7 text-slate-200/90">
                        Questions about products, shipping, or returns? Reach out and we will help you move forward quickly.
                    </p>
                    <div class="mt-5 grid gap-3">
                        <NuxtLink
                            v-if="isClientHydrated"
                            :to="`mailto:${supportEmail}`"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex flex-col gap-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-4 transition hover:border-amber-200/50 hover:bg-white/10"
                        >
                            <span class="text-label-xs tracking-label font-bold text-blue-100/80 uppercase">Email</span>
                            <span class="text-base font-semibold text-white">{{ supportEmail }}</span>
                        </NuxtLink>
                        <NuxtLink
                            v-else
                            to="/contact"
                            class="flex flex-col gap-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-4 transition hover:border-amber-200/50 hover:bg-white/10"
                        >
                            <span class="text-label-xs tracking-label font-bold text-blue-100/80 uppercase">Contact</span>
                            <span class="text-base font-semibold text-white">Contact support</span>
                        </NuxtLink>
                        <NuxtLink
                            :to="supportPhoneHref"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex flex-col gap-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-4 transition hover:border-amber-200/50 hover:bg-white/10"
                        >
                            <span class="text-label-xs tracking-label font-bold text-blue-100/80 uppercase">Phone</span>
                            <span class="text-base font-semibold text-white">{{ supportPhone }}</span>
                        </NuxtLink>
                    </div>
                </aside>
            </section>

            <div class="grid gap-4 py-7 lg:grid-cols-4 lg:gap-6">
                <section class="rounded-3xl border border-white/15 bg-white/5 p-4 shadow-xl md:p-5">
                    <button
                        type="button"
                        class="flex w-full items-center justify-between text-left text-base font-semibold text-white md:pointer-events-none"
                        @click="toggleMobileSection('help')"
                    >
                        Help & Contact
                        <span class="text-amber-300/95 md:hidden">{{ expandedMobileSections.help ? "-" : "+" }}</span>
                    </button>
                    <ul v-show="expandedMobileSections.help" class="mt-4 grid gap-3 md:mt-5">
                        <li v-for="item in helpLinks" :key="item.label">
                            <NuxtLink :to="item.to" class="text-slate-200/90 transition hover:text-white">{{ item.label }}</NuxtLink>
                        </li>
                    </ul>
                </section>

                <section class="rounded-3xl border border-white/15 bg-white/5 p-4 shadow-xl md:p-5">
                    <button
                        type="button"
                        class="flex w-full items-center justify-between text-left text-base font-semibold text-white md:pointer-events-none"
                        @click="toggleMobileSection('categories')"
                    >
                        Categories
                        <span class="text-amber-300/95 md:hidden">{{ expandedMobileSections.categories ? "-" : "+" }}</span>
                    </button>
                    <ul v-show="expandedMobileSections.categories" class="mt-4 grid gap-3 md:mt-5">
                        <li>
                            <NuxtLink :to="ALL_PRODUCTS_URL_HANDLE" class="text-slate-200/90 transition hover:text-white"
                            >All products</NuxtLink
                            >
                        </li>
                        <li v-for="category in categories" :key="category.id">
                            <NuxtLink :to="`${CATEGORY_HANDLE}/${category.handle}`" class="text-slate-200/90 transition hover:text-white">
                                {{ category.name }}
                            </NuxtLink>
                        </li>
                    </ul>
                </section>

                <section class="rounded-3xl border border-white/15 bg-white/5 p-4 shadow-xl md:p-5">
                    <button
                        type="button"
                        class="flex w-full items-center justify-between text-left text-base font-semibold text-white md:pointer-events-none"
                        @click="toggleMobileSection('about')"
                    >
                        About
                        <span class="text-amber-300/95 md:hidden">{{ expandedMobileSections.about ? "-" : "+" }}</span>
                    </button>
                    <ul v-show="expandedMobileSections.about" class="mt-4 grid gap-3 md:mt-5">
                        <li v-for="item in aboutLinks" :key="item.label">
                            <NuxtLink
                                :to="item.to"
                                class="text-slate-200/90 transition hover:text-white"
                                :target="item.to.startsWith('http') ? '_blank' : undefined"
                                :rel="item.to.startsWith('http') ? 'noopener noreferrer' : undefined"
                            >
                                {{ item.label }}
                            </NuxtLink>
                        </li>
                    </ul>
                </section>

                <section class="rounded-3xl border border-white/15 bg-white/5 p-4 shadow-xl md:p-5">
                    <p class="text-label-eyebrow tracking-label font-bold text-amber-100 uppercase">Accepted payments</p>
                    <p class="mt-3 text-sm leading-7 text-slate-200/85">
                        Secure payment methods with a clear checkout flow and transparent order confirmation.
                    </p>
                    <div class="mt-5 flex flex-wrap gap-3">
                        <div
                            v-for="item in paymentIcons"
                            :key="item.alt"
                            class="flex h-12 w-24 items-center justify-center rounded-xl border border-white/15 bg-white/95 p-2 shadow-lg"
                        >
                            <NuxtImage :src="item.src" :alt="item.alt" width="84" height="44" loading="lazy" />
                        </div>
                    </div>
                </section>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 px-1 pt-6">
                <p class="text-sm text-slate-300/90">Copyright Gintas Bazys {{ currentYear }}. All rights reserved.</p>
                <div class="flex flex-wrap items-center gap-3">
                    <button type="button" class="text-sm font-semibold text-slate-200/90 transition hover:text-white" @click="openBanner">
                        Cookie Settings
                    </button>
                    <NuxtLink to="/privacy" class="text-sm font-semibold text-slate-200/90 transition hover:text-white"
                    >Privacy Policy</NuxtLink
                    >
                </div>
            </div>
        </div>
    </footer>
</template>
