<script setup lang="ts">
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
    <section class="shippingPage">
        <div class="shippingPage__hero">
            <VContainer class="shippingPage__container">
                <div class="shippingPage__heroGrid">
                    <div class="shippingPage__heroCopy">
                        <span class="shippingPage__eyebrow">Payment & Shipping</span>
                        <h1 class="shippingPage__title">Delivery and checkout guidance shaped to match the refreshed storefront.</h1>
                        <p class="shippingPage__description">
                            This page covers how orders move, which payment methods we support, and what to expect from confirmation through delivery.
                        </p>

                        <div class="shippingPage__heroActions">
                            <VBtn color="primary" rounded="pill" size="large" class="text-none px-7" to="/contact">Ask a question</VBtn>

                            <div class="shippingPage__responseCard">
                                <span class="shippingPage__responseLabel">Order processing</span>
                                <strong class="shippingPage__responseValue">Usually within 1-2 business days</strong>
                            </div>
                        </div>
                    </div>

                    <div class="shippingPage__heroCard">
                        <span class="shippingPage__heroLabel">Quick overview</span>
                        <h2 class="shippingPage__heroTitle">Trusted payment methods, clear rates, and delivery updates once an order ships.</h2>
                        <ul class="shippingPage__methodList">
                            <li v-for="method in paymentMethods" :key="method" class="shippingPage__methodItem">
                                <VIcon size="18" color="primary">mdi-check-circle-outline</VIcon>
                                <span>{{ method }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </VContainer>
        </div>

        <VContainer class="shippingPage__container">
            <div class="shippingPage__optionGrid">
                <article v-for="option in shippingOptions" :key="option.title" class="shippingPage__optionCard">
                    <h2 class="shippingPage__optionTitle">{{ option.title }}</h2>
                    <p class="shippingPage__optionDetail">{{ option.detail }}</p>
                </article>
            </div>

            <div class="shippingPage__contentGrid">
                <div class="shippingPage__main">
                    <section v-for="block in policyBlocks" :key="block.title" class="shippingPage__sectionCard">
                        <span class="shippingPage__sectionEyebrow">{{ block.eyebrow }}</span>
                        <h2 class="shippingPage__sectionTitle">{{ block.title }}</h2>
                        <p class="shippingPage__sectionText">{{ block.text }}</p>
                    </section>

                    <section class="shippingPage__sectionCard">
                        <span class="shippingPage__sectionEyebrow">Frequently Asked</span>
                        <h2 class="shippingPage__sectionTitle">Common delivery and payment questions</h2>

                        <VExpansionPanels v-model="faqPanels" multiple class="shippingPage__panels">
                            <VExpansionPanel
                                v-for="item in shippingFaq"
                                :key="item.question"
                                class="shippingPage__panel"
                                rounded="xl"
                                elevation="0"
                            >
                                <VExpansionPanelTitle class="shippingPage__panelTitle">
                                    {{ item.question }}
                                </VExpansionPanelTitle>
                                <VExpansionPanelText class="shippingPage__panelText">
                                    {{ item.answer }}
                                </VExpansionPanelText>
                            </VExpansionPanel>
                        </VExpansionPanels>
                    </section>
                </div>

                <aside class="shippingPage__sidebar">
                    <div class="shippingPage__sidebarCard">
                        <span class="shippingPage__sidebarLabel">Need order help?</span>
                        <h2 class="shippingPage__sidebarTitle">Reach support for billing or delivery questions.</h2>
                        <p class="shippingPage__sidebarText">
                            If payment does not go through or you need clarification about shipping timing, contact the team and include your order number if available.
                        </p>
                        <div class="shippingPage__sidebarMeta">Support hours | Mon-Fri 09:00 - 17:00</div>
                        <VBtn color="primary" rounded="pill" size="large" class="text-none mt-6" block to="/contact">Get in touch</VBtn>
                    </div>
                </aside>
            </div>
        </VContainer>
    </section>
</template>

<style scoped lang="scss">
.shippingPage {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f7faff 0%, #ffffff 36%, #f6f9ff 100%);
}

.shippingPage__hero {
    padding: clamp(4.75rem, 7vw, 6.5rem) 0 2.5rem;
}

.shippingPage__container {
    position: relative;
    z-index: 1;
}

.shippingPage__heroGrid,
.shippingPage__contentGrid {
    display: grid;
    gap: clamp(1.5rem, 3vw, 2rem);
}

.shippingPage__heroGrid {
    grid-template-columns: minmax(0, 1.12fr) minmax(18rem, 0.88fr);
    align-items: end;
}

.shippingPage__heroCopy,
.shippingPage__heroCard,
.shippingPage__optionCard,
.shippingPage__sectionCard,
.shippingPage__sidebar {
    animation: shipping-rise 0.8s ease both;
}

.shippingPage__heroCard,
.shippingPage__sidebar {
    animation-delay: 0.12s;
}

.shippingPage__eyebrow,
.shippingPage__heroLabel,
.shippingPage__sectionEyebrow,
.shippingPage__sidebarLabel {
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

.shippingPage__title,
.shippingPage__heroTitle,
.shippingPage__sectionTitle,
.shippingPage__sidebarTitle,
.shippingPage__optionTitle {
    color: #08173f;
}

.shippingPage__title {
    max-width: 13ch;
    margin-bottom: 1rem;
    font-size: clamp(2.35rem, 4.2vw, 4.35rem);
    line-height: 0.96;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.shippingPage__description,
.shippingPage__sectionText,
.shippingPage__sidebarText,
.shippingPage__optionDetail {
    color: #4c5975;
    font-size: 1rem;
    line-height: 1.75;
}

.shippingPage__description,
.shippingPage__sectionText,
.shippingPage__sidebarText,
.shippingPage__optionDetail {
    margin-bottom: 0;
}

.shippingPage__heroActions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem 1.25rem;
    margin-top: 1.75rem;
}

.shippingPage__responseCard,
.shippingPage__heroCard,
.shippingPage__optionCard,
.shippingPage__sectionCard,
.shippingPage__sidebarCard,
.shippingPage__panel {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.shippingPage__responseCard {
    display: grid;
    gap: 0.2rem;
    padding: 0.9rem 1.05rem;
}

.shippingPage__responseLabel,
.shippingPage__sidebarMeta {
    color: #6a7590;
    font-size: 0.88rem;
}

.shippingPage__responseValue {
    color: #08173f;
    font-size: 1rem;
    line-height: 1.4;
}

.shippingPage__heroCard,
.shippingPage__sectionCard,
.shippingPage__sidebarCard {
    padding: clamp(1.4rem, 2vw, 1.9rem);
}

.shippingPage__heroTitle,
.shippingPage__sectionTitle,
.shippingPage__sidebarTitle {
    margin-bottom: 0.85rem;
    font-size: clamp(1.5rem, 2.2vw, 2rem);
    line-height: 1.08;
    letter-spacing: -0.04rem;
}

.shippingPage__methodList {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.85rem 1rem;
    margin: 1.35rem 0 0;
    padding: 0;
    list-style: none;
}

.shippingPage__methodItem {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    color: #33415f;
    line-height: 1.6;
}

.shippingPage__optionGrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: clamp(2.25rem, 4vw, 3rem);
}

.shippingPage__optionCard {
    min-height: 100%;
    padding: 1.35rem;
    transition:
        transform 0.25s ease,
        box-shadow 0.25s ease,
        border-color 0.25s ease;
}

.shippingPage__optionCard:hover {
    transform: translateY(-4px);
    border-color: rgba(1, 12, 128, 0.14);
    box-shadow: 0 22px 54px rgba(8, 27, 90, 0.12);
}

.shippingPage__optionTitle {
    margin-bottom: 0.65rem;
    font-size: 1.12rem;
    line-height: 1.3;
}

.shippingPage__contentGrid {
    grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
    align-items: start;
    padding-bottom: clamp(4rem, 7vw, 6rem);
}

.shippingPage__main {
    display: grid;
    gap: 1.25rem;
}

.shippingPage__panels {
    gap: 0.8rem;
    background: transparent;
}

.shippingPage__panel {
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 10px 28px rgba(8, 27, 90, 0.05);
}

.shippingPage__sidebar {
    position: sticky;
    top: 1.5rem;
}

.shippingPage__sidebarMeta {
    margin-top: 1rem;
    font-weight: 700;
}

:deep(.shippingPage__panelTitle) {
    min-height: 4.2rem;
    color: #08173f;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.5;
}

:deep(.shippingPage__panelText) {
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
    .shippingPage__heroGrid,
    .shippingPage__contentGrid,
    .shippingPage__optionGrid {
        grid-template-columns: 1fr;
    }

    .shippingPage__title,
    .shippingPage__methodList {
        max-width: 100%;
    }

    .shippingPage__sidebar {
        position: static;
    }
}

@media screen and (max-width: 767px) {
    .shippingPage__hero {
        padding: 3.75rem 0 2rem;
    }

    .shippingPage__title {
        font-size: clamp(2rem, 9vw, 2.8rem);
        line-height: 1;
    }

    .shippingPage__methodList {
        grid-template-columns: 1fr;
    }

    .shippingPage__heroCard,
    .shippingPage__optionCard,
    .shippingPage__sectionCard,
    .shippingPage__sidebarCard {
        border-radius: 1.2rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .shippingPage__heroCopy,
    .shippingPage__heroCard,
    .shippingPage__optionCard,
    .shippingPage__sectionCard,
    .shippingPage__sidebar {
        animation: none;
        transition: none;
    }
}
</style>
