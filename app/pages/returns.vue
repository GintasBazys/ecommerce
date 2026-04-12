<script setup lang="ts">
const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: "Returns" }])

useHead({
    title: "Returns | Ecommerce"
})

const returnSteps = [
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

const policyHighlights = [
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

const returnFaq = [
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

const faqPanels = ref<number[]>([0])
</script>

<template>
    <section class="returns-page">
        <div class="returns-page__hero">
            <VContainer class="returns-page__container">
                <div class="returns-page__hero-grid">
                    <div class="returns-page__hero-copy">
                        <AppBreadcrumbs :items="breadcrumbItems" class="returns-page__breadcrumbs" />
                        <span class="returns-page__eyebrow">Returns Center</span>
                        <h1 class="returns-page__title">A return process designed to feel as calm and clear as the updated storefront.</h1>
                        <p class="returns-page__description">
                            If something is not quite right, we keep the process simple: request the return, send the item back, and we will
                            handle the refund or exchange with a straightforward follow-up.
                        </p>
                        <div class="returns-page__hero-actions">
                            <VBtn color="primary" rounded="pill" size="large" class="text-none px-7" to="/contact">Contact support</VBtn>
                            <div class="returns-page__response-card">
                                <span class="returns-page__response-label">Return window</span>
                                <strong class="returns-page__response-value">30 days from delivery</strong>
                            </div>
                        </div>
                    </div>

                    <div class="returns-page__hero-panel">
                        <span class="returns-page__panel-label">What to expect</span>
                        <h2 class="returns-page__panel-title">Three steps, transparent timing, and real help if anything feels unclear.</h2>
                        <p class="returns-page__panel-text">
                            We review returns promptly, confirm receipt, and keep communication direct if an item needs replacement or a
                            refund.
                        </p>
                    </div>
                </div>
            </VContainer>
        </div>
        <VContainer class="returns-page__container">
            <div class="returns-page__steps-grid">
                <article v-for="step in returnSteps" :key="step.number" class="returns-page__step-card">
                    <span class="returns-page__step-number">{{ step.number }}</span>
                    <h2 class="returns-page__step-title">{{ step.title }}</h2>
                    <p class="returns-page__step-detail">{{ step.detail }}</p>
                </article>
            </div>
            <div class="returns-page__content-grid">
                <div class="returns-page__main">
                    <section class="returns-page__section-card">
                        <span class="returns-page__section-eyebrow">Policy Overview</span>
                        <h2 class="returns-page__section-title">Key return guidelines without the clutter.</h2>
                        <p class="returns-page__section-text">
                            We want you to feel confident ordering from us. If a product does not work out, the return process should stay
                            predictable and easy to understand.
                        </p>
                        <div class="returns-page__highlight-grid">
                            <article v-for="item in policyHighlights" :key="item.title" class="returns-page__highlight-card">
                                <h3 class="returns-page__highlight-title">{{ item.title }}</h3>
                                <p class="returns-page__highlight-text">{{ item.text }}</p>
                            </article>
                        </div>
                        <div class="returns-page__policy-text">
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
                    <section class="returns-page__section-card">
                        <span class="returns-page__section-eyebrow">Questions</span>
                        <h2 class="returns-page__section-title">Return policy FAQ</h2>
                        <VExpansionPanels v-model="faqPanels" multiple class="returns-page__panels">
                            <VExpansionPanel
                                v-for="item in returnFaq"
                                :key="item.question"
                                class="returns-page__panel"
                                rounded="xl"
                                elevation="0"
                            >
                                <VExpansionPanelTitle class="returns-page__panel-title">
                                    {{ item.question }}
                                </VExpansionPanelTitle>
                                <VExpansionPanelText class="returns-page__panel-text">
                                    {{ item.answer }}
                                </VExpansionPanelText>
                            </VExpansionPanel>
                        </VExpansionPanels>
                    </section>
                </div>
                <aside class="returns-page__sidebar">
                    <div class="returns-page__sidebar-card">
                        <span class="returns-page__sidebar-label">Need help first?</span>
                        <h2 class="returns-page__sidebar-title">Talk to support before sending anything back.</h2>
                        <p class="returns-page__sidebar-text">
                            If your item is damaged, incorrect, or you are not sure whether it is eligible, contact us and include your
                            order number.
                        </p>
                        <div class="returns-page__sidebar-meta">Mon-Fri | 09:00 - 17:00</div>
                        <VBtn color="primary" rounded="pill" size="large" class="text-none mt-6" block to="/contact">Get in touch</VBtn>
                    </div>
                </aside>
            </div>
        </VContainer>
    </section>
</template>

<style scoped lang="scss">
.returns-page {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 38%, #f7faff 100%);
}

.returns-page__hero {
    padding: 6.5rem 0 2.5rem;
}

.returns-page__container {
    position: relative;
    z-index: 1;
}

.returns-page__hero-grid,
.returns-page__content-grid {
    display: grid;
    gap: 2rem;
}

.returns-page__hero-grid {
    grid-template-columns: minmax(0, 1.15fr) minmax(18rem, 0.85fr);
    align-items: end;
}

.returns-page__hero-copy,
.returns-page__hero-panel,
.returns-page__step-card,
.returns-page__section-card,
.returns-page__sidebar {
    animation: returns-rise 0.8s ease both;
}

.returns-page__hero-panel,
.returns-page__sidebar {
    animation-delay: 0.12s;
}

.returns-page__breadcrumbs {
    margin-bottom: 1rem;
}

.returns-page__eyebrow,
.returns-page__section-eyebrow,
.returns-page__panel-label,
.returns-page__sidebar-label {
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

.returns-page__title,
.returns-page__panel-title,
.returns-page__section-title,
.returns-page__sidebar-title,
.returns-page__step-title,
.returns-page__highlight-title {
    color: #08173f;
}

.returns-page__title {
    max-width: 12ch;
    margin-bottom: 1rem;
    font-size: 4.35rem;
    line-height: 0.96;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.returns-page__description,
.returns-page__panel-text,
.returns-page__section-text,
.returns-page__sidebar-text,
.returns-page__step-detail,
.returns-page__highlight-text,
.returns-page__policy-text {
    color: #4c5975;
    font-size: 1rem;
    line-height: 1.75;
}

.returns-page__description,
.returns-page__panel-text,
.returns-page__section-text,
.returns-page__sidebar-text,
.returns-page__step-detail,
.returns-page__highlight-text {
    margin-bottom: 0;
}

.returns-page__hero-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem 1.25rem;
    margin-top: 1.75rem;
}

.returns-page__response-card,
.returns-page__hero-panel,
.returns-page__step-card,
.returns-page__section-card,
.returns-page__sidebar-card,
.returns-page__highlight-card,
.returns-page__panel {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.returns-page__response-card {
    display: grid;
    gap: 0.2rem;
    padding: 0.9rem 1.05rem;
}

.returns-page__response-label,
.returns-page__sidebar-meta,
.returns-page__step-number {
    color: #6a7590;
    font-size: 0.88rem;
}

.returns-page__response-value {
    color: #08173f;
    font-size: 1rem;
    line-height: 1.4;
}

.returns-page__hero-panel,
.returns-page__section-card,
.returns-page__sidebar-card {
    padding: 1.9rem;
}

.returns-page__panel-title,
.returns-page__section-title,
.returns-page__sidebar-title {
    margin-bottom: 0.85rem;
    font-size: 2rem;
    line-height: 1.08;
    letter-spacing: -0.04rem;
}

.returns-page__steps-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: 3rem;
}

.returns-page__step-card {
    min-height: 100%;
    padding: 1.35rem;
    transition:
        transform 0.25s ease,
        box-shadow 0.25s ease,
        border-color 0.25s ease;
}

.returns-page__step-card:hover,
.returns-page__highlight-card:hover {
    transform: translateY(-4px);
    border-color: rgba(1, 12, 128, 0.14);
    box-shadow: 0 22px 54px rgba(8, 27, 90, 0.12);
}

.returns-page__step-number {
    display: inline-flex;
    margin-bottom: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
}

.returns-page__step-title {
    margin-bottom: 0.65rem;
    font-size: 1.15rem;
    line-height: 1.3;
}

.returns-page__content-grid {
    grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
    align-items: start;
    padding-bottom: 6rem;
}

.returns-page__main {
    display: grid;
    gap: 1.25rem;
}

.returns-page__highlight-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin: 1.4rem 0;
}

.returns-page__highlight-card {
    padding: 1.1rem 1rem;
    transition:
        transform 0.25s ease,
        box-shadow 0.25s ease,
        border-color 0.25s ease;
}

.returns-page__highlight-title {
    margin-bottom: 0.5rem;
    font-size: 1rem;
    line-height: 1.35;
}

.returns-page__policy-text {
    display: grid;
    gap: 1rem;
}

.returns-page__policy-text p {
    margin-bottom: 0;
}

.returns-page__panels {
    gap: 0.8rem;
    background: transparent;
}

.returns-page__panel {
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 10px 28px rgba(8, 27, 90, 0.05);
}

.returns-page__sidebar {
    position: sticky;
    top: 1.5rem;
}

.returns-page__sidebar-meta {
    margin-top: 1rem;
    font-weight: 700;
}

:deep(.returns-page__panel-title) {
    min-height: 4.2rem;
    color: #08173f;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.5;
}

:deep(.returns-page__panel-text) {
    color: #52607c;
    line-height: 1.75;
}

@keyframes returns-rise {
    from {
        opacity: 0;
        transform: translateY(26px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (max-width: 1280px) {
    .returns-page__hero {
        padding-top: 5.5rem;
    }

    .returns-page__title {
        font-size: 3.5rem;
    }

    .returns-page__panel-title,
    .returns-page__section-title,
    .returns-page__sidebar-title {
        font-size: 1.75rem;
    }

    .returns-page__steps-grid {
        margin-bottom: 2.5rem;
    }

    .returns-page__content-grid {
        padding-bottom: 5rem;
    }
}

@media screen and (max-width: 1100px) {
    .returns-page__hero-grid,
    .returns-page__content-grid,
    .returns-page__steps-grid {
        grid-template-columns: 1fr;
    }

    .returns-page__hero-grid,
    .returns-page__content-grid {
        gap: 1.5rem;
    }

    .returns-page__title,
    .returns-page__highlight-grid {
        max-width: 100%;
    }

    .returns-page__title {
        font-size: 3rem;
    }

    .returns-page__hero-panel,
    .returns-page__section-card,
    .returns-page__sidebar-card {
        padding: 1.6rem;
    }

    .returns-page__panel-title,
    .returns-page__section-title,
    .returns-page__sidebar-title {
        font-size: 1.5rem;
    }

    .returns-page__steps-grid {
        margin-bottom: 2.25rem;
    }

    .returns-page__highlight-grid {
        grid-template-columns: 1fr;
    }

    .returns-page__content-grid {
        padding-bottom: 4rem;
    }

    .returns-page__sidebar {
        position: static;
    }
}

@media screen and (max-width: 767px) {
    .returns-page__hero {
        padding: 3.75rem 0 2rem;
    }

    .returns-page__title {
        font-size: 2.8rem;
        line-height: 1;
    }

    .returns-page__hero-panel,
    .returns-page__step-card,
    .returns-page__section-card,
    .returns-page__sidebar-card,
    .returns-page__highlight-card {
        border-radius: 1.2rem;
    }

    .returns-page__hero-panel,
    .returns-page__section-card,
    .returns-page__sidebar-card {
        padding: 1.4rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .returns-page__hero-copy,
    .returns-page__hero-panel,
    .returns-page__step-card,
    .returns-page__section-card,
    .returns-page__sidebar,
    .returns-page__highlight-card {
        animation: none;
        transition: none;
    }
}
</style>
