<script setup lang="ts">
import type { NavLink } from "@/types/interfaces"

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
const supportEmail = "info@ecommerce.com"
const supportPhone = "+370 600 00000"
const supportPhoneHref = "tel:+37060000000"

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
    <footer class="relative overflow-hidden bg-gradient-to-b from-brand-900 to-slate-950 text-white">
        <div class="mx-auto w-full max-w-7xl px-4 pb-8 pt-14 md:px-6 md:pt-16">
            <section class="grid gap-6 border-b border-white/15 pb-8 md:grid-cols-[1.25fr_0.85fr] md:items-end">
                <div>
                    <span
                        class="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-100"
                    >Ecommerce</span
                    >
                    <h2 class="mt-4 max-w-[14ch] text-3xl font-semibold leading-none tracking-tight sm:text-4xl">
                        A clearer storefront from discovery to checkout.
                    </h2>
                    <p class="mt-4 max-w-2xl text-sm leading-7 text-blue-100/85 sm:text-base">
                        Cleaner browsing, practical support, and a dependable shopping experience across mobile and desktop.
                    </p>
                </div>

                <div class="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                    <p class="text-xs font-semibold uppercase tracking-[0.12em] text-blue-100">Need help?</p>
                    <NuxtLink
                        v-if="isClientHydrated"
                        class="mt-2 block text-base font-semibold text-white hover:text-blue-100"
                        :to="`mailto:${supportEmail}`"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {{ supportEmail }}
                    </NuxtLink>
                    <NuxtLink v-else class="mt-2 block text-base font-semibold text-white hover:text-blue-100" to="/contact">
                        Contact support
                    </NuxtLink>
                    <NuxtLink
                        class="mt-1 block text-base font-semibold text-white hover:text-blue-100"
                        :to="supportPhoneHref"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {{ supportPhone }}
                    </NuxtLink>
                </div>
            </section>

            <div class="grid gap-4 py-7 md:grid-cols-4 md:gap-6">
                <section class="rounded-2xl border border-white/15 bg-white/5 p-4 md:bg-transparent md:p-0">
                    <button
                        type="button"
                        class="flex w-full items-center justify-between text-left text-base font-semibold md:pointer-events-none"
                        @click="toggleMobileSection('help')"
                    >
                        Help & Contact
                        <span class="md:hidden">{{ expandedMobileSections.help ? "-" : "+" }}</span>
                    </button>
                    <ul v-show="expandedMobileSections.help" class="mt-4 grid gap-3 md:mt-5">
                        <li v-for="item in helpLinks" :key="item.label">
                            <NuxtLink :to="item.to" class="text-sm text-blue-100/90 transition hover:text-white">{{ item.label }}</NuxtLink>
                        </li>
                    </ul>
                </section>

                <section class="rounded-2xl border border-white/15 bg-white/5 p-4 md:bg-transparent md:p-0">
                    <button
                        type="button"
                        class="flex w-full items-center justify-between text-left text-base font-semibold md:pointer-events-none"
                        @click="toggleMobileSection('categories')"
                    >
                        Categories
                        <span class="md:hidden">{{ expandedMobileSections.categories ? "-" : "+" }}</span>
                    </button>
                    <ul v-show="expandedMobileSections.categories" class="mt-4 grid gap-3 md:mt-5">
                        <li>
                            <NuxtLink :to="ALL_PRODUCTS_URL_HANDLE" class="text-sm text-blue-100/90 transition hover:text-white"
                            >All products</NuxtLink
                            >
                        </li>
                        <li v-for="category in categories" :key="category.id">
                            <NuxtLink
                                :to="`${CATEGORY_HANDLE}/${category.handle}`"
                                class="text-sm text-blue-100/90 transition hover:text-white"
                            >
                                {{ category.name }}
                            </NuxtLink>
                        </li>
                    </ul>
                </section>

                <section class="rounded-2xl border border-white/15 bg-white/5 p-4 md:bg-transparent md:p-0">
                    <button
                        type="button"
                        class="flex w-full items-center justify-between text-left text-base font-semibold md:pointer-events-none"
                        @click="toggleMobileSection('about')"
                    >
                        About
                        <span class="md:hidden">{{ expandedMobileSections.about ? "-" : "+" }}</span>
                    </button>
                    <ul v-show="expandedMobileSections.about" class="mt-4 grid gap-3 md:mt-5">
                        <li v-for="item in aboutLinks" :key="item.label">
                            <NuxtLink
                                :to="item.to"
                                class="text-sm text-blue-100/90 transition hover:text-white"
                                :target="item.to.startsWith('http') ? '_blank' : undefined"
                                :rel="item.to.startsWith('http') ? 'noopener noreferrer' : undefined"
                            >
                                {{ item.label }}
                            </NuxtLink>
                        </li>
                    </ul>
                </section>

                <section class="rounded-2xl border border-white/15 bg-white/5 p-4 md:h-full">
                    <p class="text-xs font-semibold uppercase tracking-[0.12em] text-blue-100">Accepted payments</p>
                    <div class="mt-4 flex flex-wrap gap-3">
                        <div
                            v-for="item in paymentIcons"
                            :key="item.alt"
                            class="flex h-12 w-[94px] items-center justify-center rounded-xl bg-white p-2"
                        >
                            <NuxtImage :src="item.src" :alt="item.alt" width="84" height="44" loading="lazy" />
                        </div>
                    </div>
                </section>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-6">
                <p class="text-sm text-blue-100/85">Copyright Gintas Bazys {{ currentYear }}. All rights reserved.</p>
                <NuxtLink to="/privacy" class="text-sm font-semibold text-blue-100 transition hover:text-white">Privacy Policy</NuxtLink>
            </div>
        </div>
    </footer>
</template>
