<script setup lang="ts">
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
    <section class="returnsPage">
        <div class="returnsPage__hero">
            <VContainer class="returnsPage__container">
                <div class="returnsPage__heroGrid">
                    <div class="returnsPage__heroCopy">
                        <span class="returnsPage__eyebrow">Returns Center</span>
                        <h1 class="returnsPage__title">A return process designed to feel as calm and clear as the updated storefront.</h1>
                        <p class="returnsPage__description">
                            If something is not quite right, we keep the process simple: request the return, send the item back, and we will handle the
                            refund or exchange with a straightforward follow-up.
                        </p>
                        <div class="returnsPage__heroActions">
                            <VBtn color="primary" rounded="pill" size="large" class="text-none px-7" to="/contact">Contact support</VBtn>
                            <div class="returnsPage__responseCard">
                                <span class="returnsPage__responseLabel">Return window</span>
                                <strong class="returnsPage__responseValue">30 days from delivery</strong>
                            </div>
                        </div>
                    </div>

                    <div class="returnsPage__heroPanel">
                        <span class="returnsPage__panelLabel">What to expect</span>
                        <h2 class="returnsPage__panelTitle">Three steps, transparent timing, and real help if anything feels unclear.</h2>
                        <p class="returnsPage__panelText">
                            We review returns promptly, confirm receipt, and keep communication direct if an item needs replacement or a refund.
                        </p>
                    </div>
                </div>
            </VContainer>
        </div>
        <VContainer class="returnsPage__container">
            <div class="returnsPage__stepsGrid">
                <article v-for="step in returnSteps" :key="step.number" class="returnsPage__stepCard">
                    <span class="returnsPage__stepNumber">{{ step.number }}</span>
                    <h2 class="returnsPage__stepTitle">{{ step.title }}</h2>
                    <p class="returnsPage__stepDetail">{{ step.detail }}</p>
                </article>
            </div>
            <div class="returnsPage__contentGrid">
                <div class="returnsPage__main">
                    <section class="returnsPage__sectionCard">
                        <span class="returnsPage__sectionEyebrow">Policy Overview</span>
                        <h2 class="returnsPage__sectionTitle">Key return guidelines without the clutter.</h2>
                        <p class="returnsPage__sectionText">
                            We want you to feel confident ordering from us. If a product does not work out, the return process should stay predictable and
                            easy to understand.
                        </p>
                        <div class="returnsPage__highlightGrid">
                            <article v-for="item in policyHighlights" :key="item.title" class="returnsPage__highlightCard">
                                <h3 class="returnsPage__highlightTitle">{{ item.title }}</h3>
                                <p class="returnsPage__highlightText">{{ item.text }}</p>
                            </article>
                        </div>
                        <div class="returnsPage__policyText">
                            <p>
                                To initiate a return, use your account order history and follow the return instructions for the relevant item. If the return
                                is approved, you will receive the next steps and any applicable shipping label details.
                            </p>
                            <p>
                                Returns should include the original packaging where possible and be sent back in unused condition. This helps us approve
                                refunds faster and keeps exchange handling smoother.
                            </p>
                        </div>
                    </section>
                    <section class="returnsPage__sectionCard">
                        <span class="returnsPage__sectionEyebrow">Questions</span>
                        <h2 class="returnsPage__sectionTitle">Return policy FAQ</h2>
                        <VExpansionPanels v-model="faqPanels" multiple class="returnsPage__panels">
                            <VExpansionPanel
                                v-for="item in returnFaq"
                                :key="item.question"
                                class="returnsPage__panel"
                                rounded="xl"
                                elevation="0"
                            >
                                <VExpansionPanelTitle class="returnsPage__panelTitle">
                                    {{ item.question }}
                                </VExpansionPanelTitle>
                                <VExpansionPanelText class="returnsPage__panelText">
                                    {{ item.answer }}
                                </VExpansionPanelText>
                            </VExpansionPanel>
                        </VExpansionPanels>
                    </section>
                </div>
                <aside class="returnsPage__sidebar">
                    <div class="returnsPage__sidebarCard">
                        <span class="returnsPage__sidebarLabel">Need help first?</span>
                        <h2 class="returnsPage__sidebarTitle">Talk to support before sending anything back.</h2>
                        <p class="returnsPage__sidebarText">
                            If your item is damaged, incorrect, or you are not sure whether it is eligible, contact us and include your order number.
                        </p>
                        <div class="returnsPage__sidebarMeta">Mon-Fri | 09:00 - 17:00</div>
                        <VBtn color="primary" rounded="pill" size="large" class="text-none mt-6" block to="/contact">Get in touch</VBtn>
                    </div>
                </aside>
            </div>
        </VContainer>
    </section>
</template>

<style scoped lang="scss">
.returnsPage {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 38%, #f7faff 100%);
}

.returnsPage__hero {
    padding: clamp(4.75rem, 7vw, 6.5rem) 0 2.5rem;
}

.returnsPage__container {
    position: relative;
    z-index: 1;
}

.returnsPage__heroGrid,
.returnsPage__contentGrid {
    display: grid;
    gap: clamp(1.5rem, 3vw, 2rem);
}

.returnsPage__heroGrid {
    grid-template-columns: minmax(0, 1.15fr) minmax(18rem, 0.85fr);
    align-items: end;
}

.returnsPage__heroCopy,
.returnsPage__heroPanel,
.returnsPage__stepCard,
.returnsPage__sectionCard,
.returnsPage__sidebar {
    animation: returns-rise 0.8s ease both;
}

.returnsPage__heroPanel,
.returnsPage__sidebar {
    animation-delay: 0.12s;
}

.returnsPage__eyebrow,
.returnsPage__sectionEyebrow,
.returnsPage__panelLabel,
.returnsPage__sidebarLabel {
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

.returnsPage__title,
.returnsPage__panelTitle,
.returnsPage__sectionTitle,
.returnsPage__sidebarTitle,
.returnsPage__stepTitle,
.returnsPage__highlightTitle {
    color: #08173f;
}

.returnsPage__title {
    max-width: 12ch;
    margin-bottom: 1rem;
    font-size: clamp(2.35rem, 4.2vw, 4.35rem);
    line-height: 0.96;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.returnsPage__description,
.returnsPage__panelText,
.returnsPage__sectionText,
.returnsPage__sidebarText,
.returnsPage__stepDetail,
.returnsPage__highlightText,
.returnsPage__policyText {
    color: #4c5975;
    font-size: 1rem;
    line-height: 1.75;
}

.returnsPage__description,
.returnsPage__panelText,
.returnsPage__sectionText,
.returnsPage__sidebarText,
.returnsPage__stepDetail,
.returnsPage__highlightText {
    margin-bottom: 0;
}

.returnsPage__heroActions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem 1.25rem;
    margin-top: 1.75rem;
}

.returnsPage__responseCard,
.returnsPage__heroPanel,
.returnsPage__stepCard,
.returnsPage__sectionCard,
.returnsPage__sidebarCard,
.returnsPage__highlightCard,
.returnsPage__panel {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.returnsPage__responseCard {
    display: grid;
    gap: 0.2rem;
    padding: 0.9rem 1.05rem;
}

.returnsPage__responseLabel,
.returnsPage__sidebarMeta,
.returnsPage__stepNumber {
    color: #6a7590;
    font-size: 0.88rem;
}

.returnsPage__responseValue {
    color: #08173f;
    font-size: 1rem;
    line-height: 1.4;
}

.returnsPage__heroPanel,
.returnsPage__sectionCard,
.returnsPage__sidebarCard {
    padding: clamp(1.4rem, 2vw, 1.9rem);
}

.returnsPage__panelTitle,
.returnsPage__sectionTitle,
.returnsPage__sidebarTitle {
    margin-bottom: 0.85rem;
    font-size: clamp(1.5rem, 2.2vw, 2rem);
    line-height: 1.08;
    letter-spacing: -0.04rem;
}

.returnsPage__stepsGrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: clamp(2.25rem, 4vw, 3rem);
}

.returnsPage__stepCard {
    min-height: 100%;
    padding: 1.35rem;
    transition:
        transform 0.25s ease,
        box-shadow 0.25s ease,
        border-color 0.25s ease;
}

.returnsPage__stepCard:hover,
.returnsPage__highlightCard:hover {
    transform: translateY(-4px);
    border-color: rgba(1, 12, 128, 0.14);
    box-shadow: 0 22px 54px rgba(8, 27, 90, 0.12);
}

.returnsPage__stepNumber {
    display: inline-flex;
    margin-bottom: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
}

.returnsPage__stepTitle {
    margin-bottom: 0.65rem;
    font-size: 1.15rem;
    line-height: 1.3;
}

.returnsPage__contentGrid {
    grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
    align-items: start;
    padding-bottom: clamp(4rem, 7vw, 6rem);
}

.returnsPage__main {
    display: grid;
    gap: 1.25rem;
}

.returnsPage__highlightGrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin: 1.4rem 0;
}

.returnsPage__highlightCard {
    padding: 1.1rem 1rem;
    transition:
        transform 0.25s ease,
        box-shadow 0.25s ease,
        border-color 0.25s ease;
}

.returnsPage__highlightTitle {
    margin-bottom: 0.5rem;
    font-size: 1rem;
    line-height: 1.35;
}

.returnsPage__policyText {
    display: grid;
    gap: 1rem;
}

.returnsPage__policyText p {
    margin-bottom: 0;
}

.returnsPage__panels {
    gap: 0.8rem;
    background: transparent;
}

.returnsPage__panel {
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 10px 28px rgba(8, 27, 90, 0.05);
}

.returnsPage__sidebar {
    position: sticky;
    top: 1.5rem;
}

.returnsPage__sidebarMeta {
    margin-top: 1rem;
    font-weight: 700;
}

:deep(.returnsPage__panelTitle) {
    min-height: 4.2rem;
    color: #08173f;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.5;
}

:deep(.returnsPage__panelText) {
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

@media screen and (max-width: 1100px) {
    .returnsPage__heroGrid,
    .returnsPage__contentGrid,
    .returnsPage__stepsGrid {
        grid-template-columns: 1fr;
    }

    .returnsPage__title,
    .returnsPage__highlightGrid {
        max-width: 100%;
    }

    .returnsPage__highlightGrid {
        grid-template-columns: 1fr;
    }

    .returnsPage__sidebar {
        position: static;
    }
}

@media screen and (max-width: 767px) {
    .returnsPage__hero {
        padding: 3.75rem 0 2rem;
    }

    .returnsPage__title {
        font-size: clamp(2rem, 9vw, 2.8rem);
        line-height: 1;
    }

    .returnsPage__heroPanel,
    .returnsPage__stepCard,
    .returnsPage__sectionCard,
    .returnsPage__sidebarCard,
    .returnsPage__highlightCard {
        border-radius: 1.2rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .returnsPage__heroCopy,
    .returnsPage__heroPanel,
    .returnsPage__stepCard,
    .returnsPage__sectionCard,
    .returnsPage__sidebar,
    .returnsPage__highlightCard {
        animation: none;
        transition: none;
    }
}
</style>
