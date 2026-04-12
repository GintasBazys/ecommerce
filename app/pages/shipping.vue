<script setup lang="ts">
const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: "Payment & Shipping" }])

useHead({
    title: "Payment & Shipping | Ecommerce"
})

const shippingOptions = [
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

const policyBlocks = [
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

const shippingFaq = [
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

const faqPanels = ref<number[]>([0])
</script>

<template>
    <section class="shipping-page">
        <div class="shipping-page__hero">
            <VContainer class="shipping-page__container">
                <div class="shipping-page__hero-grid">
                    <div class="shipping-page__hero-copy">
                        <AppBreadcrumbs :items="breadcrumbItems" class="shipping-page__breadcrumbs" />
                        <span class="shipping-page__eyebrow">Payment & Shipping</span>
                        <h1 class="shipping-page__title">Delivery and checkout guidance shaped to match the refreshed storefront.</h1>
                        <p class="shipping-page__description">
                            This page covers how orders move, which payment methods we support, and what to expect from confirmation through
                            delivery.
                        </p>
                        <div class="shipping-page__hero-actions">
                            <VBtn color="primary" rounded="pill" size="large" class="text-none px-7" to="/contact">Ask a question</VBtn>
                            <div class="shipping-page__response-card">
                                <span class="shipping-page__response-label">Order processing</span>
                                <strong class="shipping-page__response-value">Usually within 1-2 business days</strong>
                            </div>
                        </div>
                    </div>
                    <div class="shipping-page__hero-card">
                        <span class="shipping-page__hero-label">Quick overview</span>
                        <h2 class="shipping-page__hero-title">
                            Trusted payment methods, clear rates, and delivery updates once an order ships.
                        </h2>
                        <ul class="shipping-page__method-list">
                            <li v-for="method in paymentMethods" :key="method" class="shipping-page__method-item">
                                <VIcon size="18" color="primary">mdi-check-circle-outline</VIcon>
                                <span>{{ method }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </VContainer>
        </div>
        <VContainer class="shipping-page__container">
            <div class="shipping-page__option-grid">
                <article v-for="option in shippingOptions" :key="option.title" class="shipping-page__option-card">
                    <h2 class="shipping-page__option-title">{{ option.title }}</h2>
                    <p class="shipping-page__option-detail">{{ option.detail }}</p>
                </article>
            </div>
            <div class="shipping-page__content-grid">
                <div class="shipping-page__main">
                    <section v-for="block in policyBlocks" :key="block.title" class="shipping-page__section-card">
                        <span class="shipping-page__section-eyebrow">{{ block.eyebrow }}</span>
                        <h2 class="shipping-page__section-title">{{ block.title }}</h2>
                        <p class="shipping-page__section-text">{{ block.text }}</p>
                    </section>
                    <section class="shipping-page__section-card">
                        <span class="shipping-page__section-eyebrow">Frequently Asked</span>
                        <h2 class="shipping-page__section-title">Common delivery and payment questions</h2>
                        <VExpansionPanels v-model="faqPanels" multiple class="shipping-page__panels">
                            <VExpansionPanel
                                v-for="item in shippingFaq"
                                :key="item.question"
                                class="shipping-page__panel"
                                rounded="xl"
                                elevation="0"
                            >
                                <VExpansionPanelTitle class="shipping-page__panel-title">
                                    {{ item.question }}
                                </VExpansionPanelTitle>
                                <VExpansionPanelText class="shipping-page__panel-text">
                                    {{ item.answer }}
                                </VExpansionPanelText>
                            </VExpansionPanel>
                        </VExpansionPanels>
                    </section>
                </div>
                <aside class="shipping-page__sidebar">
                    <div class="shipping-page__sidebar-card">
                        <span class="shipping-page__sidebar-label">Need order help?</span>
                        <h2 class="shipping-page__sidebar-title">Reach support for billing or delivery questions.</h2>
                        <p class="shipping-page__sidebar-text">
                            If payment does not go through or you need clarification about shipping timing, contact the team and include
                            your order number if available.
                        </p>
                        <div class="shipping-page__sidebar-meta">Support hours | Mon-Fri 09:00 - 17:00</div>
                        <VBtn color="primary" rounded="pill" size="large" class="text-none mt-6" block to="/contact">Get in touch</VBtn>
                    </div>
                </aside>
            </div>
        </VContainer>
    </section>
</template>

<style scoped lang="scss">
.shipping-page {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f7faff 0%, #ffffff 36%, #f6f9ff 100%);
}

.shipping-page__hero {
    padding: 6rem 0 2.5rem;
}

.shipping-page__container {
    position: relative;
    z-index: 1;
}

.shipping-page__hero-grid,
.shipping-page__content-grid {
    display: grid;
    gap: 2rem;
}

.shipping-page__hero-grid {
    grid-template-columns: minmax(0, 1.12fr) minmax(18rem, 0.88fr);
    align-items: end;
}

.shipping-page__hero-copy,
.shipping-page__hero-card,
.shipping-page__option-card,
.shipping-page__section-card,
.shipping-page__sidebar {
    animation: shipping-rise 0.8s ease both;
}

.shipping-page__hero-card,
.shipping-page__sidebar {
    animation-delay: 0.12s;
}

.shipping-page__breadcrumbs {
    margin-bottom: 1rem;
}

.shipping-page__eyebrow,
.shipping-page__hero-label,
.shipping-page__section-eyebrow,
.shipping-page__sidebar-label {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: 0.45rem 0.9rem;
    margin-bottom: 1rem;
    border-radius: 999px;
    background: rgba(1, 12, 128, 0.07);
    color: #010c80;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.shipping-page__title,
.shipping-page__hero-title,
.shipping-page__section-title,
.shipping-page__sidebar-title,
.shipping-page__option-title {
    color: #08173f;
}

.shipping-page__title {
    max-width: 13ch;
    margin-bottom: 1rem;
    font-size: 4.35rem;
    line-height: 0.96;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.shipping-page__description,
.shipping-page__section-text,
.shipping-page__sidebar-text,
.shipping-page__option-detail {
    color: #4c5975;
    font-size: 1rem;
    line-height: 1.75;
}

.shipping-page__description,
.shipping-page__section-text,
.shipping-page__sidebar-text,
.shipping-page__option-detail {
    margin-bottom: 0;
}

.shipping-page__hero-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem 1.25rem;
    margin-top: 1.75rem;
}

.shipping-page__response-card,
.shipping-page__hero-card,
.shipping-page__option-card,
.shipping-page__section-card,
.shipping-page__sidebar-card,
.shipping-page__panel {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.shipping-page__response-card {
    display: grid;
    gap: 0.2rem;
    padding: 0.9rem 1.05rem;
}

.shipping-page__response-label,
.shipping-page__sidebar-meta {
    color: #6a7590;
    font-size: 0.88rem;
}

.shipping-page__response-value {
    color: #08173f;
    font-size: 1rem;
    line-height: 1.4;
}

.shipping-page__hero-card,
.shipping-page__section-card,
.shipping-page__sidebar-card {
    padding: 1.9rem;
}

.shipping-page__hero-title,
.shipping-page__section-title,
.shipping-page__sidebar-title {
    margin-bottom: 0.85rem;
    font-size: 2rem;
    line-height: 1.08;
    letter-spacing: -0.04rem;
}

.shipping-page__method-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.85rem 1rem;
    margin: 1.35rem 0 0;
    padding: 0;
    list-style: none;
}

.shipping-page__method-item {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    color: #33415f;
    line-height: 1.6;
}

.shipping-page__option-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: 3rem;
}

.shipping-page__option-card {
    min-height: 100%;
    padding: 1.35rem;
    transition:
        transform 0.25s ease,
        box-shadow 0.25s ease,
        border-color 0.25s ease;
}

.shipping-page__option-card:hover {
    transform: translateY(-4px);
    border-color: rgba(1, 12, 128, 0.14);
    box-shadow: 0 22px 54px rgba(8, 27, 90, 0.12);
}

.shipping-page__option-title {
    margin-bottom: 0.65rem;
    font-size: 1.12rem;
    line-height: 1.3;
}

.shipping-page__content-grid {
    grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
    align-items: start;
    padding-bottom: 6rem;
}

.shipping-page__main {
    display: grid;
    gap: 1.25rem;
}

.shipping-page__panels {
    gap: 0.8rem;
    background: transparent;
}

.shipping-page__panel {
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 10px 28px rgba(8, 27, 90, 0.05);
}

.shipping-page__sidebar {
    position: sticky;
    top: 1.5rem;
}

.shipping-page__sidebar-meta {
    margin-top: 1rem;
    font-weight: 700;
}

:deep(.shipping-page__panel-title) {
    min-height: 4.2rem;
    color: #08173f;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.5;
}

:deep(.shipping-page__panel-text) {
    color: #52607c;
    line-height: 1.75;
}

@keyframes shipping-rise {
    from {
        opacity: 0;
        transform: translateY(26px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (max-width: 1100px) {
    .shipping-page__hero-grid,
    .shipping-page__content-grid,
    .shipping-page__option-grid {
        grid-template-columns: 1fr;
    }

    .shipping-page__title,
    .shipping-page__method-list {
        max-width: 100%;
    }

    .shipping-page__sidebar {
        position: static;
    }
}

@media screen and (max-width: 767px) {
    .shipping-page__hero {
        padding: 3.75rem 0 2rem;
    }

    .shipping-page__hero-grid,
    .shipping-page__content-grid {
        gap: 1.5rem;
    }

    .shipping-page__title {
        font-size: 2.8rem;
        line-height: 1;
    }

    .shipping-page__hero-card,
    .shipping-page__section-card,
    .shipping-page__sidebar-card {
        padding: 1.4rem;
    }

    .shipping-page__hero-title,
    .shipping-page__section-title,
    .shipping-page__sidebar-title {
        font-size: 1.5rem;
    }

    .shipping-page__option-grid {
        margin-bottom: 2.25rem;
    }

    .shipping-page__content-grid {
        padding-bottom: 4rem;
    }

    .shipping-page__method-list {
        grid-template-columns: 1fr;
    }

    .shipping-page__hero-card,
    .shipping-page__option-card,
    .shipping-page__section-card,
    .shipping-page__sidebar-card {
        border-radius: 1.2rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .shipping-page__hero-copy,
    .shipping-page__hero-card,
    .shipping-page__option-card,
    .shipping-page__section-card,
    .shipping-page__sidebar {
        animation: none;
        transition: none;
    }
}
</style>
