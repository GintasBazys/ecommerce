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
    <footer class="site-footer text-white">
        <div class="mx-auto w-full max-w-7xl px-4 pb-8 pt-14 md:px-6 md:pt-16">
            <section
                class="site-footer__hero grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)] lg:items-end lg:gap-8 lg:p-8"
            >
                <div>
                    <span
                        class="inline-flex min-h-9 items-center rounded-full border border-amber-200/20 bg-amber-50/10 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-amber-100"
                    >
                        Ecommerce
                    </span>
                    <h2 class="mt-4 max-w-[14ch] text-[clamp(2rem,8vw,3.45rem)] font-bold leading-[0.96] tracking-[-0.05em] text-white">
                        A more polished finish to every shopping journey.
                    </h2>
                    <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-200/88 sm:text-base sm:leading-8">
                        Browse with clarity, get practical support fast, and move from discovery to checkout with the same calm, premium
                        feel across the entire storefront.
                    </p>

                    <div class="mt-6 flex flex-wrap gap-3">
                        <div class="site-footer__metric rounded-[1.15rem] px-4 py-3">
                            <span class="block text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-300">
                                Worldwide delivery
                            </span>
                            <strong class="mt-1 block text-base font-semibold text-white">Mobile-first checkout flow</strong>
                        </div>
                        <div class="site-footer__metric rounded-[1.15rem] px-4 py-3">
                            <span class="block text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-300">
                                Trusted support
                            </span>
                            <strong class="mt-1 block text-base font-semibold text-white">Real help before and after purchase</strong>
                        </div>
                    </div>
                </div>

                <aside class="site-footer__support rounded-[1.6rem] p-5 sm:p-6">
                    <div
                        class="mb-4 h-px w-full bg-[linear-gradient(90deg,rgba(148,163,184,0),rgba(253,230,138,0.55),rgba(148,163,184,0))]"
                    ></div>
                    <p class="text-[0.74rem] font-bold uppercase tracking-[0.14em] text-amber-100">Need help?</p>
                    <h3 class="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">Talk to support</h3>
                    <p class="mt-3 max-w-[24rem] text-sm leading-7 text-slate-200/86">
                        Questions about products, shipping, or returns? Reach out and we will help you move forward quickly.
                    </p>
                    <div class="mt-5 grid gap-3">
                        <NuxtLink
                            v-if="isClientHydrated"
                            class="site-footer__support-link"
                            :to="`mailto:${supportEmail}`"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span class="site-footer__support-label">Email</span>
                            <span class="site-footer__support-value">{{ supportEmail }}</span>
                        </NuxtLink>
                        <NuxtLink v-else class="site-footer__support-link" to="/contact">
                            <span class="site-footer__support-label">Contact</span>
                            <span class="site-footer__support-value">Contact support</span>
                        </NuxtLink>
                        <NuxtLink class="site-footer__support-link" :to="supportPhoneHref" target="_blank" rel="noopener noreferrer">
                            <span class="site-footer__support-label">Phone</span>
                            <span class="site-footer__support-value">{{ supportPhone }}</span>
                        </NuxtLink>
                    </div>
                </aside>
            </section>

            <div class="grid gap-4 py-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_20rem] lg:gap-6">
                <section class="site-footer__panel rounded-3xl p-4 md:p-5">
                    <button
                        type="button"
                        class="flex w-full items-center justify-between text-left text-base font-semibold text-white md:pointer-events-none"
                        @click="toggleMobileSection('help')"
                    >
                        Help & Contact
                        <span class="site-footer__toggle md:hidden">{{ expandedMobileSections.help ? "-" : "+" }}</span>
                    </button>
                    <ul v-show="expandedMobileSections.help" class="mt-4 grid gap-3 md:mt-5">
                        <li v-for="item in helpLinks" :key="item.label">
                            <NuxtLink :to="item.to" class="site-footer__link">{{ item.label }}</NuxtLink>
                        </li>
                    </ul>
                </section>

                <section class="site-footer__panel rounded-3xl p-4 md:p-5">
                    <button
                        type="button"
                        class="flex w-full items-center justify-between text-left text-base font-semibold text-white md:pointer-events-none"
                        @click="toggleMobileSection('categories')"
                    >
                        Categories
                        <span class="site-footer__toggle md:hidden">{{ expandedMobileSections.categories ? "-" : "+" }}</span>
                    </button>
                    <ul v-show="expandedMobileSections.categories" class="mt-4 grid gap-3 md:mt-5">
                        <li>
                            <NuxtLink :to="ALL_PRODUCTS_URL_HANDLE" class="site-footer__link">All products</NuxtLink>
                        </li>
                        <li v-for="category in categories" :key="category.id">
                            <NuxtLink :to="`${CATEGORY_HANDLE}/${category.handle}`" class="site-footer__link">
                                {{ category.name }}
                            </NuxtLink>
                        </li>
                    </ul>
                </section>

                <section class="site-footer__panel rounded-3xl p-4 md:p-5">
                    <button
                        type="button"
                        class="flex w-full items-center justify-between text-left text-base font-semibold text-white md:pointer-events-none"
                        @click="toggleMobileSection('about')"
                    >
                        About
                        <span class="site-footer__toggle md:hidden">{{ expandedMobileSections.about ? "-" : "+" }}</span>
                    </button>
                    <ul v-show="expandedMobileSections.about" class="mt-4 grid gap-3 md:mt-5">
                        <li v-for="item in aboutLinks" :key="item.label">
                            <NuxtLink
                                :to="item.to"
                                class="site-footer__link"
                                :target="item.to.startsWith('http') ? '_blank' : undefined"
                                :rel="item.to.startsWith('http') ? 'noopener noreferrer' : undefined"
                            >
                                {{ item.label }}
                            </NuxtLink>
                        </li>
                    </ul>
                </section>

                <section class="site-footer__payments rounded-3xl p-4 md:p-5">
                    <p class="text-[0.74rem] font-bold uppercase tracking-[0.14em] text-amber-100">Accepted payments</p>
                    <p class="mt-3 text-sm leading-7 text-slate-200/82">
                        Secure payment methods with a clear checkout flow and transparent order confirmation.
                    </p>
                    <div class="mt-5 flex flex-wrap gap-3">
                        <div
                            v-for="item in paymentIcons"
                            :key="item.alt"
                            class="site-footer__payment-item flex h-12 w-23.5 items-center justify-center rounded-xl p-2"
                        >
                            <NuxtImage :src="item.src" :alt="item.alt" width="84" height="44" loading="lazy" />
                        </div>
                    </div>
                </section>
            </div>

            <div class="site-footer__bottom flex flex-wrap items-center justify-between gap-3 px-1 pt-6">
                <p class="text-sm text-slate-300/90">Copyright Gintas Bazys {{ currentYear }}. All rights reserved.</p>
                <div class="flex flex-wrap items-center gap-3">
                    <button type="button" class="site-footer__bottom-link text-sm font-semibold" @click="openBanner">Cookie Settings</button>
                    <NuxtLink to="/privacy" class="site-footer__bottom-link text-sm font-semibold">Privacy Policy</NuxtLink>
                </div>
            </div>
        </div>
    </footer>
</template>

<style scoped>
.site-footer {
    position: relative;
    background:
        radial-gradient(circle at top left, rgba(245, 158, 11, 0.1), transparent 22%),
        linear-gradient(180deg, #0f172a 0%, #111c33 52%, #0b1220 100%);
}

.site-footer__hero,
.site-footer__panel,
.site-footer__payments,
.site-footer__support {
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(148, 163, 184, 0.05));
    box-shadow: 0 12px 28px rgba(2, 6, 23, 0.18);
}

.site-footer__hero {
    border-color: rgba(255, 255, 255, 0.14);
    border-radius: 2rem;
}

.site-footer__metric {
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(15, 23, 42, 0.08));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.site-footer__support-link,
.site-footer__link,
.site-footer__bottom-link {
    transition:
        color 0.2s ease,
        border-color 0.2s ease,
        background-color 0.2s ease,
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.site-footer__support-link {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.95rem 1rem;
}

.site-footer__support-link:hover {
    border-color: rgba(253, 230, 138, 0.42);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 18px rgba(2, 6, 23, 0.14);
}

.site-footer__support-label {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: rgb(191 219 254 / 0.76);
}

.site-footer__support-value {
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
}

.site-footer__toggle {
    color: rgb(251 191 36 / 0.95);
}

.site-footer__link,
.site-footer__bottom-link {
    color: rgb(226 232 240 / 0.9);
}

.site-footer__link:hover,
.site-footer__bottom-link:hover {
    color: #fff;
}

.site-footer__payment-item {
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 8px 18px rgba(2, 6, 23, 0.12);
}

.site-footer__bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.12);
}

@media (prefers-reduced-motion: reduce) {
    .site-footer__support-link,
    .site-footer__link,
    .site-footer__bottom-link {
        transition: none;
    }

    .site-footer__support-link:hover {
        transform: none;
    }
}

@media (max-width: 767px) {
    .site-footer__hero {
        border-radius: 1.6rem;
    }
}
</style>
