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
    <footer class="footerPanel">
        <VContainer class="footerPanel__container">
            <section class="footerPanel__hero">
                <div class="footerPanel__brand">
                    <span class="footerPanel__eyebrow">Ecommerce</span>
                    <h2 class="footerPanel__title">A brighter storefront experience from discovery to checkout.</h2>
                    <p class="footerPanel__description">
                        Cleaner browsing, practical support, and a more thoughtful lower-page experience that feels consistent with the rest
                        of the refreshed homepage.
                    </p>
                </div>

                <div class="footerPanel__contactCard">
                    <span class="footerPanel__contactLabel">Need help?</span>
                    <NuxtLink class="footerPanel__contactLink" to="mailto:info@ecommerce.com" target="_blank" rel="noopener noreferrer">
                        info@ecommerce.com
                    </NuxtLink>
                    <NuxtLink class="footerPanel__contactLink" to="tel:+37060000000" target="_blank" rel="noopener noreferrer">
                        +370 600 00000
                    </NuxtLink>
                </div>
            </section>

            <div class="footerPanel__main">
                <div class="footerPanel__column footerPanel__column--accordion">
                    <VExpansionPanels v-model="expandedPanels[0]" multiple flat class="footerPanel__accordion">
                        <VExpansionPanel class="footerPanel__panel">
                            <VExpansionPanelTitle class="footerPanel__panelTitle">Help & Contact</VExpansionPanelTitle>
                            <VExpansionPanelText class="footerPanel__panelText">
                                <ul class="footerPanel__links">
                                    <li v-for="item in helpLinks" :key="item.label" class="footerPanel__item">
                                        <NuxtLink :to="item.to" class="footerPanel__link">{{ item.label }}</NuxtLink>
                                    </li>
                                </ul>
                            </VExpansionPanelText>
                        </VExpansionPanel>
                    </VExpansionPanels>
                </div>

                <div class="footerPanel__column footerPanel__column--accordion">
                    <VExpansionPanels v-model="expandedPanels[1]" multiple flat class="footerPanel__accordion">
                        <VExpansionPanel class="footerPanel__panel">
                            <VExpansionPanelTitle class="footerPanel__panelTitle">Categories</VExpansionPanelTitle>
                            <VExpansionPanelText class="footerPanel__panelText">
                                <ul class="footerPanel__links">
                                    <li class="footerPanel__item">
                                        <NuxtLink :to="ALL_PRODUCTS_URL_HANDLE" class="footerPanel__link">All products</NuxtLink>
                                    </li>
                                    <li v-for="category in categories" :key="category.id" class="footerPanel__item">
                                        <NuxtLink :to="`${CATEGORY_HANDLE}/${category.handle}`" class="footerPanel__link">
                                            {{ category.name }}
                                        </NuxtLink>
                                    </li>
                                </ul>
                            </VExpansionPanelText>
                        </VExpansionPanel>
                    </VExpansionPanels>
                </div>

                <div class="footerPanel__column footerPanel__column--accordion">
                    <VExpansionPanels v-model="expandedPanels[2]" multiple flat class="footerPanel__accordion">
                        <VExpansionPanel class="footerPanel__panel">
                            <VExpansionPanelTitle class="footerPanel__panelTitle">About</VExpansionPanelTitle>
                            <VExpansionPanelText class="footerPanel__panelText">
                                <ul class="footerPanel__links">
                                    <li v-for="item in aboutLinks" :key="item.label" class="footerPanel__item">
                                        <NuxtLink :to="item.to" class="footerPanel__link">
                                            <VIcon v-if="item.icon" size="18" class="footerPanel__linkIcon">{{ item.icon }}</VIcon>
                                            {{ item.label }}
                                        </NuxtLink>
                                    </li>
                                </ul>
                            </VExpansionPanelText>
                        </VExpansionPanel>
                    </VExpansionPanels>
                </div>

                <div class="footerPanel__column">
                    <div class="footerPanel__payments">
                        <span class="footerPanel__subheading">Accepted payments</span>
                        <div class="footerPanel__paymentList">
                            <div v-for="item in paymentIcons" :key="item.alt" class="footerPanel__paymentItem">
                                <NuxtImg
                                    v-if="!item.external"
                                    :src="item.src"
                                    :alt="item.alt"
                                    width="72"
                                    height="44"
                                    format="webp"
                                    class="footerPanel__paymentIcon"
                                />
                                <img
                                    v-else
                                    :src="item.src"
                                    :alt="item.alt"
                                    width="84"
                                    height="44"
                                    loading="lazy"
                                    class="footerPanel__paymentIcon"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footerPanel__bottom">
                <p class="footerPanel__copyright">© Copyright Gintas Bazys {{ new Date().getFullYear() }}. All rights reserved.</p>
                <NuxtLink to="/privacy" class="footerPanel__privacy">Privacy Policy</NuxtLink>
            </div>
        </VContainer>
    </footer>
</template>

<style scoped lang="scss">
.footerPanel {
    position: relative;
    overflow: hidden;
    padding: clamp(3.5rem, 6vw, 5rem) 0 2rem;
    background:
        radial-gradient(circle at top left, rgba(0, 128, 255, 0.14), transparent 26%), linear-gradient(180deg, #07153f 0%, #030c26 100%);
    color: #ffffff;

    &__container {
        position: relative;
        z-index: 1;
    }

    &__hero {
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
        gap: 1.5rem 2rem;
        align-items: end;
        margin-bottom: 2rem;
    }

    &__brand,
    &__contactCard,
    &__column {
        animation: footer-rise 0.75s ease both;
    }

    &__contactCard {
        animation-delay: 0.1s;
    }

    &__column {
        &:nth-child(2) {
            animation-delay: 0.08s;
        }

        &:nth-child(3) {
            animation-delay: 0.14s;
        }

        &:nth-child(4) {
            animation-delay: 0.2s;
        }
    }

    &__eyebrow {
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

    &__title {
        max-width: 13ch;
        margin-bottom: 0.9rem;
        color: #ffffff;
        font-size: clamp(2rem, 4vw, 3.4rem);
        line-height: 0.98;
        letter-spacing: -0.05rem;
        text-wrap: balance;
    }

    &__description {
        max-width: 44rem;
        margin-bottom: 0;
        color: rgba(220, 231, 255, 0.82);
        font-size: 1rem;
        line-height: 1.75;
    }

    &__contactCard {
        display: grid;
        gap: 0.6rem;
        padding: 1.2rem;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 1.35rem;
        background: rgba(255, 255, 255, 0.06);
        backdrop-filter: blur(10px);
    }

    &__contactLabel,
    &__subheading {
        color: #dce7ff;
        font-size: 0.76rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
    }

    &__contactLink,
    &__privacy,
    &__link {
        color: #ffffff;
        text-decoration: none;
    }

    &__contactLink {
        font-size: 1rem;
        line-height: 1.55;
    }

    &__main {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1.25rem;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.12);
    }

    &__accordion {
        background: transparent;
        color: inherit;
    }

    &__panel {
        background: transparent !important;
        color: inherit;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 1rem !important;
    }

    &__panelTitle {
        min-height: 3.25rem;
        color: #ffffff;
        font-weight: 700;
    }

    &__panelText {
        color: inherit;
    }

    &__links {
        display: grid;
        gap: 0.75rem;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    &__link {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        color: rgba(220, 231, 255, 0.84);
        font-size: 0.94rem;
        line-height: 1.5;
        transition: color 0.25s ease;

        &:hover {
            color: #ffffff;
        }
    }

    &__linkIcon {
        color: #9fc5ff;
    }

    &__payments {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        height: 100%;
        padding: 1.2rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 1rem;
        background: rgba(255, 255, 255, 0.04);
    }

    &__paymentList {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
    }

    &__paymentItem {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 5.25rem;
        height: 3rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 0.9rem;
        background: rgba(255, 255, 255, 0.96);
    }

    &__paymentIcon {
        max-width: 72px;
        max-height: 44px;
        object-fit: contain;
    }

    &__bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-top: 1.75rem;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.12);
    }

    &__copyright {
        margin-bottom: 0;
        color: rgba(220, 231, 255, 0.72);
        font-size: 0.88rem;
        line-height: 1.5;
    }

    &__privacy {
        color: #ffffff;
        font-size: 0.9rem;
        font-weight: 600;
    }
}

:deep(.footerPanel__accordion .v-expansion-panel-title__overlay),
:deep(.footerPanel__accordion .v-expansion-panel__shadow) {
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
    .footerPanel {
        &__hero,
        &__main {
            grid-template-columns: 1fr 1fr;
        }

        &__title {
            max-width: 100%;
        }
    }
}

@media screen and (max-width: 767px) {
    .footerPanel {
        padding: 3rem 0 1.5rem;

        &__hero,
        &__main,
        &__bottom {
            grid-template-columns: 1fr;
        }

        &__bottom {
            display: grid;
            justify-content: stretch;
        }

        &__main {
            gap: 1rem;
        }

        &__panelTitle {
            min-height: 3rem;
        }

        &__title {
            font-size: clamp(1.85rem, 7vw, 2.7rem);
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    .footerPanel {
        &__brand,
        &__contactCard,
        &__column {
            animation: none;
        }
    }
}
</style>
