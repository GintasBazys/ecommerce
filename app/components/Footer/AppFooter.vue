<script setup lang="ts">
import type { NavLink } from "@/types/interfaces"

import { ALL_PRODUCTS_URL_HANDLE, CATEGORY_HANDLE } from "~/utils/consts"

const expandedPanels = ref<number[][]>([[0], [0], [0]])
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
    { label: "Facebook", to: "https://facebook.com", icon: "mdi-facebook" },
    { label: "Instagram", to: "https://instagram.com", icon: "mdi-instagram" }
]

const paymentIcons = [
    { src: "/images/mastercard.svg", alt: "Mastercard", external: false },
    { src: "https://cdn.visa.com/v2/assets/images/logos/visa/blue/logo.png", alt: "Visa", external: true }
]
</script>

<template>
    <footer class="footer-panel">
        <VContainer class="footer-panel__container">
            <section class="footer-panel__hero">
                <div class="footer-panel__brand">
                    <span class="footer-panel__eyebrow">Ecommerce</span>
                    <h2 class="footer-panel__title">A brighter storefront experience from discovery to checkout.</h2>
                    <p class="footer-panel__description">
                        Cleaner browsing, practical support, and a more thoughtful lower-page experience that feels consistent with the rest
                        of the refreshed homepage.
                    </p>
                </div>

                <div class="footer-panel__contact-card">
                    <span class="footer-panel__contact-label">Need help?</span>
                    <NuxtLink class="footer-panel__contact-link" to="mailto:info@ecommerce.com" target="_blank" rel="noopener noreferrer">
                        info@ecommerce.com
                    </NuxtLink>
                    <NuxtLink class="footer-panel__contact-link" to="tel:+37060000000" target="_blank" rel="noopener noreferrer">
                        +370 600 00000
                    </NuxtLink>
                </div>
            </section>

            <div class="footer-panel__main">
                <div class="footer-panel__column footer-panel__column--accordion">
                    <VExpansionPanels v-model="expandedPanels[0]" multiple flat class="footer-panel__accordion">
                        <VExpansionPanel class="footer-panel__panel">
                            <VExpansionPanelTitle class="footer-panel__panel-title">Help & Contact</VExpansionPanelTitle>
                            <VExpansionPanelText class="footer-panel__panel-text">
                                <ul class="footer-panel__links">
                                    <li v-for="item in helpLinks" :key="item.label" class="footer-panel__item">
                                        <NuxtLink :to="item.to" class="footer-panel__link">{{ item.label }}</NuxtLink>
                                    </li>
                                </ul>
                            </VExpansionPanelText>
                        </VExpansionPanel>
                    </VExpansionPanels>
                </div>

                <div class="footer-panel__column footer-panel__column--accordion">
                    <VExpansionPanels v-model="expandedPanels[1]" multiple flat class="footer-panel__accordion">
                        <VExpansionPanel class="footer-panel__panel">
                            <VExpansionPanelTitle class="footer-panel__panel-title">Categories</VExpansionPanelTitle>
                            <VExpansionPanelText class="footer-panel__panel-text">
                                <ul class="footer-panel__links">
                                    <li class="footer-panel__item">
                                        <NuxtLink :to="ALL_PRODUCTS_URL_HANDLE" class="footer-panel__link">All products</NuxtLink>
                                    </li>
                                    <li v-for="category in categories" :key="category.id" class="footer-panel__item">
                                        <NuxtLink :to="`${CATEGORY_HANDLE}/${category.handle}`" class="footer-panel__link">
                                            {{ category.name }}
                                        </NuxtLink>
                                    </li>
                                </ul>
                            </VExpansionPanelText>
                        </VExpansionPanel>
                    </VExpansionPanels>
                </div>

                <div class="footer-panel__column footer-panel__column--accordion">
                    <VExpansionPanels v-model="expandedPanels[2]" multiple flat class="footer-panel__accordion">
                        <VExpansionPanel class="footer-panel__panel">
                            <VExpansionPanelTitle class="footer-panel__panel-title">About</VExpansionPanelTitle>
                            <VExpansionPanelText class="footer-panel__panel-text">
                                <ul class="footer-panel__links">
                                    <li v-for="item in aboutLinks" :key="item.label" class="footer-panel__item">
                                        <NuxtLink :to="item.to" class="footer-panel__link">
                                            <VIcon v-if="item.icon" size="18" class="footer-panel__link-icon">{{ item.icon }}</VIcon>
                                            {{ item.label }}
                                        </NuxtLink>
                                    </li>
                                </ul>
                            </VExpansionPanelText>
                        </VExpansionPanel>
                    </VExpansionPanels>
                </div>

                <div class="footer-panel__column">
                    <div class="footer-panel__payments">
                        <span class="footer-panel__subheading">Accepted payments</span>
                        <div class="footer-panel__payment-list">
                            <div v-for="item in paymentIcons" :key="item.alt" class="footer-panel__payment-item">
                                <NuxtImg
                                    v-if="!item.external"
                                    :src="item.src"
                                    :alt="item.alt"
                                    width="72"
                                    height="44"
                                    format="webp"
                                    class="footer-panel__payment-icon"
                                />
                                <img
                                    v-else
                                    :src="item.src"
                                    :alt="item.alt"
                                    width="84"
                                    height="44"
                                    loading="lazy"
                                    class="footer-panel__payment-icon"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer-panel__bottom">
                <p class="footer-panel__copyright">© Copyright Gintas Bazys {{ new Date().getFullYear() }}. All rights reserved.</p>
                <NuxtLink to="/privacy" class="footer-panel__privacy">Privacy Policy</NuxtLink>
            </div>
        </VContainer>
    </footer>
</template>

<style scoped lang="scss">
.footer-panel {
    position: relative;
    overflow: hidden;
    padding: clamp(3.5rem, 6vw, 5rem) 0 2rem;
    background:
        radial-gradient(circle at top left, rgba(0, 128, 255, 0.14), transparent 26%), linear-gradient(180deg, #07153f 0%, #030c26 100%);
    color: #ffffff;
}

.footer-panel__container {
    position: relative;
    z-index: 1;
}

.footer-panel__hero {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
    gap: 1.5rem 2rem;
    align-items: end;
    margin-bottom: 2rem;
}

.footer-panel__brand,
.footer-panel__contact-card,
.footer-panel__column {
    animation: footer-rise 0.75s ease both;
}

.footer-panel__contact-card {
    animation-delay: 0.1s;
}

.footer-panel__column:nth-child(2) {
    animation-delay: 0.08s;
}

.footer-panel__column:nth-child(3) {
    animation-delay: 0.14s;
}

.footer-panel__column:nth-child(4) {
    animation-delay: 0.2s;
}

.footer-panel__eyebrow {
    display: inline-flex;
    align-items: center;
    min-height: 2.2rem;
    padding: 0.4rem 0.85rem;
    margin-bottom: 1rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    color: #dce7ff;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.footer-panel__title {
    max-width: 13ch;
    margin-bottom: 0.9rem;
    color: #ffffff;
    font-size: clamp(2rem, 4vw, 3.4rem);
    line-height: 0.98;
    letter-spacing: -0.05rem;
    text-wrap: balance;
}

.footer-panel__description {
    max-width: 44rem;
    margin-bottom: 0;
    color: rgba(220, 231, 255, 0.82);
    font-size: 1rem;
    line-height: 1.75;
}

.footer-panel__contact-card {
    display: grid;
    gap: 0.6rem;
    padding: 1.2rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 1.35rem;
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(10px);
}

.footer-panel__contact-label,
.footer-panel__subheading {
    color: #dce7ff;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.footer-panel__contact-link,
.footer-panel__privacy,
.footer-panel__link {
    color: #ffffff;
    text-decoration: none;
}

.footer-panel__contact-link {
    font-size: 1rem;
    line-height: 1.55;
}

.footer-panel__main {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1.25rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.footer-panel__accordion {
    background: transparent;
    color: inherit;
}

.footer-panel__panel {
    background: transparent !important;
    color: inherit;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1rem !important;
}

.footer-panel__panel-title {
    min-height: 3.25rem;
    color: #ffffff;
    font-weight: 700;
}

.footer-panel__panel-text {
    color: inherit;
}

.footer-panel__links {
    display: grid;
    gap: 0.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
}

.footer-panel__link {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    color: rgba(220, 231, 255, 0.84);
    font-size: 0.94rem;
    line-height: 1.5;
    transition: color 0.25s ease;
}

.footer-panel__link:hover {
    color: #ffffff;
}

.footer-panel__link-icon {
    color: #9fc5ff;
}

.footer-panel__payments {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    height: 100%;
    padding: 1.2rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.04);
}

.footer-panel__payment-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.footer-panel__payment-item {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 5.25rem;
    height: 3rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.9rem;
    background: rgba(255, 255, 255, 0.96);
}

.footer-panel__payment-icon {
    max-width: 72px;
    max-height: 44px;
    object-fit: contain;
}

.footer-panel__bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-top: 1.75rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.footer-panel__copyright {
    margin-bottom: 0;
    color: rgba(220, 231, 255, 0.72);
    font-size: 0.88rem;
    line-height: 1.5;
}

.footer-panel__privacy {
    color: #ffffff;
    font-size: 0.9rem;
    font-weight: 600;
}

:deep(.footer-panel__accordion .v-expansion-panel-title__overlay),
:deep(.footer-panel__accordion .v-expansion-panel__shadow) {
    display: none;
}

@keyframes footer-rise {
    from {
        opacity: 0;
        transform: translateY(24px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (max-width: 1100px) {
    .footer-panel__hero,
    .footer-panel__main {
        grid-template-columns: 1fr 1fr;
    }

    .footer-panel__title {
        max-width: 100%;
    }
}

@media screen and (max-width: 767px) {
    .footer-panel {
        padding: 3rem 0 1.5rem;
    }

    .footer-panel__hero,
    .footer-panel__main,
    .footer-panel__bottom {
        grid-template-columns: 1fr;
    }

    .footer-panel__bottom {
        display: grid;
        justify-content: stretch;
    }

    .footer-panel__main {
        gap: 1rem;
    }

    .footer-panel__panel-title {
        min-height: 3rem;
    }

    .footer-panel__title {
        font-size: clamp(1.85rem, 7vw, 2.7rem);
    }
}

@media (prefers-reduced-motion: reduce) {
    .footer-panel__brand,
    .footer-panel__contact-card,
    .footer-panel__column {
        animation: none;
    }
}
</style>
