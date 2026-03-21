<script setup lang="ts">
type FaqSection = {
    id: string
    eyebrow: string
    title: string
    description: string
    items: {
        question: string
        answer: string
    }[]
}

const faqSections: FaqSection[] = [
    {
        id: "orders",
        eyebrow: "Shopping Support",
        title: "Orders and delivery",
        description: "The most common questions before checkout, after payment, and while an order is on the way.",
        items: [
            {
                question: "How quickly do you process new orders?",
                answer: "Most orders are reviewed and prepared within one business day. During promotions or holidays, processing may take a little longer, but we always follow up if timing changes."
            },
            {
                question: "Can I update my delivery details after checkout?",
                answer: "Yes, if the order has not been dispatched yet. Use the contact page as soon as possible and include your order number so the support team can check the shipment status."
            },
            {
                question: "Do you ship internationally?",
                answer: "Yes. Delivery times vary by country and carrier, but we aim to keep the process straightforward and provide tracking as soon as the parcel leaves our warehouse."
            }
        ]
    },
    {
        id: "returns",
        eyebrow: "After Purchase",
        title: "Returns, exchanges, and follow-up",
        description: "Answers for the moments when a product is not quite right or you need more help after delivery.",
        items: [
            {
                question: "What should I do if my item arrives damaged?",
                answer: "Contact us with your order number and a few photos of the issue. We will review it quickly and explain the next step, whether that is a replacement, return, or refund."
            },
            {
                question: "Can I exchange an item for something else?",
                answer: "In many cases, yes. Availability depends on stock and timing, so the fastest option is to message support and tell us what you want to change."
            },
            {
                question: "Where can I get help if I still have questions?",
                answer: "If this page does not cover it, head to the contact page. Our team can help with product guidance, order updates, payment concerns, and post-purchase issues."
            }
        ]
    }
]

const quickTopics = [
    "Order tracking and delivery timing",
    "Returns or exchange guidance",
    "Product recommendations before checkout"
]

const panelState = reactive<Record<string, number[]>>(
    Object.fromEntries(faqSections.map((section) => [section.id, [0]]))
)

useHead({
    title: "FAQ | Ecommerce"
})
</script>

<template>
    <section class="faqPage">
        <div class="faqPage__hero">
            <VContainer class="faqPage__container">
                <div class="faqPage__heroGrid">
                    <div class="faqPage__heroCopy">
                        <span class="faqPage__eyebrow">Help Center</span>
                        <h1 class="faqPage__title">Answers shaped to match the cleaner, calmer storefront experience.</h1>
                        <p class="faqPage__description">
                            Start here for the questions customers ask most often. If you need something more specific, our
                            <NuxtLink to="/contact" class="faqPage__inlineLink">contact page</NuxtLink>
                            is ready for follow-up.
                        </p>
                    </div>

                    <div class="faqPage__heroCard">
                        <span class="faqPage__heroLabel">Fast paths</span>
                        <h2 class="faqPage__heroTitle">Most requests fit into three quick support tracks.</h2>
                        <ul class="faqPage__quickList">
                            <li v-for="topic in quickTopics" :key="topic" class="faqPage__quickItem">
                                <VIcon size="18" color="primary">mdi-arrow-top-right</VIcon>
                                <span>{{ topic }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </VContainer>
        </div>

        <VContainer class="faqPage__container">
            <div class="faqPage__contentGrid">
                <div class="faqPage__sections">
                    <article v-for="section in faqSections" :key="section.id" class="faqPage__sectionCard">
                        <div class="faqPage__sectionHeader">
                            <span class="faqPage__sectionEyebrow">{{ section.eyebrow }}</span>
                            <h2 class="faqPage__sectionTitle">{{ section.title }}</h2>
                            <p class="faqPage__sectionDescription">{{ section.description }}</p>
                        </div>

                        <VExpansionPanels v-model="panelState[section.id]" multiple class="faqPage__panels">
                            <VExpansionPanel
                                v-for="item in section.items"
                                :key="item.question"
                                class="faqPage__panel"
                                rounded="xl"
                                elevation="0"
                            >
                                <VExpansionPanelTitle class="faqPage__panelTitle">
                                    {{ item.question }}
                                </VExpansionPanelTitle>
                                <VExpansionPanelText class="faqPage__panelText">
                                    {{ item.answer }}
                                </VExpansionPanelText>
                            </VExpansionPanel>
                        </VExpansionPanels>
                    </article>
                </div>

                <aside class="faqPage__sidebar">
                    <div class="faqPage__contactCard">
                        <span class="faqPage__sidebarLabel">Still need help?</span>
                        <h2 class="faqPage__sidebarTitle">Talk to the support team directly.</h2>
                        <p class="faqPage__sidebarText">
                            If your question is about a current order or a product choice, send us a message and we will point you in the right direction.
                        </p>
                        <div class="faqPage__sidebarMeta">Mon-Fri | 09:00 - 17:00</div>
                        <VBtn color="primary" rounded="pill" size="large" class="text-none mt-6" block to="/contact">Get in touch</VBtn>
                    </div>
                </aside>
            </div>
        </VContainer>
    </section>
</template>

<style scoped lang="scss">
.faqPage {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 22%),
        linear-gradient(180deg, #f7faff 0%, #ffffff 34%, #f6f9ff 100%);
}

.faqPage__hero {
    padding: clamp(4.75rem, 7vw, 6.4rem) 0 2.25rem;
}

.faqPage__container {
    position: relative;
    z-index: 1;
}

.faqPage__heroGrid,
.faqPage__contentGrid {
    display: grid;
    gap: clamp(1.4rem, 3vw, 2rem);
}

.faqPage__heroGrid {
    grid-template-columns: minmax(0, 1.15fr) minmax(18rem, 0.85fr);
    align-items: end;
}

.faqPage__heroCopy,
.faqPage__heroCard,
.faqPage__sectionCard,
.faqPage__sidebar {
    animation: faq-rise 0.8s ease both;
}

.faqPage__heroCard,
.faqPage__sidebar {
    animation-delay: 0.12s;
}

.faqPage__eyebrow,
.faqPage__sectionEyebrow,
.faqPage__heroLabel,
.faqPage__sidebarLabel {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    background: rgba(1, 12, 128, 0.07);
    color: #010c80;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.faqPage__eyebrow,
.faqPage__heroLabel,
.faqPage__sectionEyebrow,
.faqPage__sidebarLabel {
    margin-bottom: 1rem;
}

.faqPage__title,
.faqPage__heroTitle,
.faqPage__sectionTitle,
.faqPage__sidebarTitle {
    color: #08173f;
    letter-spacing: -0.05rem;
    text-wrap: balance;
}

.faqPage__title {
    max-width: 13ch;
    margin-bottom: 1rem;
    font-size: clamp(2.35rem, 4.2vw, 4.25rem);
    line-height: 0.96;
}

.faqPage__description,
.faqPage__sectionDescription,
.faqPage__sidebarText {
    color: #4d5976;
    font-size: 1rem;
    line-height: 1.75;
}

.faqPage__description {
    max-width: 40rem;
    margin-bottom: 0;
}

.faqPage__inlineLink {
    color: #010c80;
    font-weight: 700;
    text-decoration: none;
}

.faqPage__inlineLink:hover {
    text-decoration: underline;
}

.faqPage__heroCard,
.faqPage__sectionCard,
.faqPage__contactCard {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.faqPage__heroCard,
.faqPage__sectionCard,
.faqPage__contactCard {
    padding: clamp(1.4rem, 2vw, 1.9rem);
}

.faqPage__heroTitle,
.faqPage__sidebarTitle {
    margin-bottom: 0.85rem;
    font-size: clamp(1.45rem, 2.1vw, 2rem);
    line-height: 1.1;
}

.faqPage__quickList {
    display: grid;
    gap: 0.85rem;
    margin: 1.4rem 0 0;
    padding: 0;
    list-style: none;
}

.faqPage__quickItem {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    color: #33415f;
    line-height: 1.6;
}

.faqPage__contentGrid {
    grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
    align-items: start;
    padding-bottom: clamp(4rem, 7vw, 6rem);
}

.faqPage__sections {
    display: grid;
    gap: 1.25rem;
}

.faqPage__sectionTitle {
    margin-bottom: 0.7rem;
    font-size: clamp(1.6rem, 2.3vw, 2.1rem);
    line-height: 1.08;
}

.faqPage__sectionDescription {
    margin-bottom: 1.15rem;
}

.faqPage__panels {
    gap: 0.8rem;
    background: transparent;
}

.faqPage__panel {
    overflow: hidden;
    border: 1px solid rgba(8, 23, 63, 0.08);
    background: #ffffff;
    box-shadow: 0 10px 28px rgba(8, 27, 90, 0.05);
}

.faqPage__sidebar {
    position: sticky;
    top: 1.5rem;
}

.faqPage__sidebarText {
    margin-bottom: 0;
}

.faqPage__sidebarMeta {
    margin-top: 1rem;
    color: #6a7590;
    font-size: 0.88rem;
    font-weight: 700;
}

:deep(.faqPage__panelTitle) {
    min-height: 4.25rem;
    color: #08173f;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.5;
}

:deep(.faqPage__panelText) {
    color: #52607c;
    line-height: 1.75;
}

@keyframes faq-rise {
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
    .faqPage__heroGrid,
    .faqPage__contentGrid {
        grid-template-columns: 1fr;
    }

    .faqPage__title {
        max-width: 100%;
    }

    .faqPage__sidebar {
        position: static;
    }
}

@media screen and (max-width: 600px) {
    .faqPage__hero {
        padding: 3.75rem 0 2rem;
    }

    .faqPage__title {
        font-size: clamp(2rem, 9vw, 2.8rem);
        line-height: 1;
    }

    .faqPage__heroCard,
    .faqPage__sectionCard,
    .faqPage__contactCard {
        border-radius: 1.2rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .faqPage__heroCopy,
    .faqPage__heroCard,
    .faqPage__sectionCard,
    .faqPage__sidebar {
        animation: none;
    }
}
</style>
