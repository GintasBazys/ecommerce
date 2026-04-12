<script setup lang="ts">
import type { SchemaNode } from "~/composables/useStructuredData"

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

const route = useRoute()
const { absoluteUrl } = useSiteIdentity()
const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: "FAQ" }])

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

const quickTopics = ["Order tracking and delivery timing", "Returns or exchange guidance", "Product recommendations before checkout"]

const panelState = reactive<Record<string, number[]>>(Object.fromEntries(faqSections.map((section) => [section.id, [0]])))

useHead({
    title: "FAQ | Ecommerce"
})

const faqSchema = computed<SchemaNode>(() => ({
    "@type": "FAQPage",
    "@id": `${absoluteUrl(route.path)}#faq`,
    mainEntity: faqSections.flatMap((section) =>
        section.items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer
            }
        }))
    )
}))

const breadcrumbSchema = computed<SchemaNode>(() =>
    createBreadcrumbSchema(
        [
            { name: "Home", path: "/" },
            { name: "FAQ", path: route.path }
        ],
        absoluteUrl
    )
)

useStructuredData(() => [faqSchema.value, breadcrumbSchema.value], "faq-structured-data")
</script>

<template>
    <section class="faq-page">
        <div class="faq-page__hero">
            <VContainer class="faq-page__container">
                <div class="faq-page__hero-grid">
                    <div class="faq-page__hero-copy">
                        <AppBreadcrumbs :items="breadcrumbItems" class="faq-page__breadcrumbs" />
                        <span class="faq-page__eyebrow">Help Center</span>
                        <h1 class="faq-page__title">Answers shaped to match the cleaner, calmer storefront experience.</h1>
                        <p class="faq-page__description">
                            Start here for the questions customers ask most often. If you need something more specific, our
                            <NuxtLink to="/contact" class="faq-page__inline-link">contact page</NuxtLink>
                            is ready for follow-up.
                        </p>
                    </div>
                    <div class="faq-page__hero-card">
                        <span class="faq-page__hero-label">Fast paths</span>
                        <h2 class="faq-page__hero-title">Most requests fit into three quick support tracks.</h2>
                        <ul class="faq-page__quick-list">
                            <li v-for="topic in quickTopics" :key="topic" class="faq-page__quick-item">
                                <VIcon size="18" color="primary">mdi-arrow-top-right</VIcon>
                                <span>{{ topic }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </VContainer>
        </div>
        <VContainer class="faq-page__container">
            <div class="faq-page__content-grid">
                <div class="faq-page__sections">
                    <article v-for="section in faqSections" :key="section.id" class="faq-page__section-card">
                        <div class="faq-page__section-header">
                            <span class="faq-page__section-eyebrow">{{ section.eyebrow }}</span>
                            <h2 class="faq-page__section-title">{{ section.title }}</h2>
                            <p class="faq-page__section-description">{{ section.description }}</p>
                        </div>

                        <VExpansionPanels v-model="panelState[section.id]" multiple class="faq-page__panels">
                            <VExpansionPanel
                                v-for="item in section.items"
                                :key="item.question"
                                class="faq-page__panel"
                                rounded="xl"
                                elevation="0"
                            >
                                <VExpansionPanelTitle class="faq-page__panel-title">
                                    {{ item.question }}
                                </VExpansionPanelTitle>
                                <VExpansionPanelText class="faq-page__panel-text">
                                    {{ item.answer }}
                                </VExpansionPanelText>
                            </VExpansionPanel>
                        </VExpansionPanels>
                    </article>
                </div>
                <aside class="faq-page__sidebar">
                    <div class="faq-page__contact-card">
                        <span class="faq-page__sidebar-label">Still need help?</span>
                        <h2 class="faq-page__sidebar-title">Talk to the support team directly.</h2>
                        <p class="faq-page__sidebar-text">
                            If your question is about a current order or a product choice, send us a message and we will point you in the
                            right direction.
                        </p>
                        <div class="faq-page__sidebar-meta">Mon-Fri | 09:00 - 17:00</div>
                        <VBtn color="primary" rounded="pill" size="large" class="text-none mt-6" block to="/contact">Get in touch</VBtn>
                    </div>
                </aside>
            </div>
        </VContainer>
    </section>
</template>

<style scoped lang="scss">
.faq-page {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 22%),
        linear-gradient(180deg, #f7faff 0%, #ffffff 34%, #f6f9ff 100%);
}

.faq-page__hero {
    padding: 6.4rem 0 2.25rem;
}

.faq-page__container {
    position: relative;
    z-index: 1;
}

.faq-page__hero-grid,
.faq-page__content-grid {
    display: grid;
    gap: 2rem;
}

.faq-page__hero-grid {
    grid-template-columns: minmax(0, 1.15fr) minmax(18rem, 0.85fr);
    align-items: end;
}

.faq-page__hero-copy,
.faq-page__hero-card,
.faq-page__section-card,
.faq-page__sidebar {
    animation: faq-rise 0.8s ease both;
}

.faq-page__breadcrumbs {
    margin-bottom: 1rem;
}

.faq-page__hero-card,
.faq-page__sidebar {
    animation-delay: 0.12s;
}

.faq-page__eyebrow,
.faq-page__section-eyebrow,
.faq-page__hero-label,
.faq-page__sidebar-label {
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

.faq-page__eyebrow,
.faq-page__hero-label,
.faq-page__section-eyebrow,
.faq-page__sidebar-label {
    margin-bottom: 1rem;
}

.faq-page__title,
.faq-page__hero-title,
.faq-page__section-title,
.faq-page__sidebar-title {
    color: #08173f;
    letter-spacing: -0.05rem;
    text-wrap: balance;
}

.faq-page__title {
    max-width: 13ch;
    margin-bottom: 1rem;
    font-size: 4.25rem;
    line-height: 0.96;
}

.faq-page__description,
.faq-page__section-description,
.faq-page__sidebar-text {
    color: #4d5976;
    font-size: 1rem;
    line-height: 1.75;
}

.faq-page__description {
    max-width: 40rem;
    margin-bottom: 0;
}

.faq-page__inline-link {
    color: #010c80;
    font-weight: 700;
    text-decoration: none;
}

.faq-page__inline-link:hover {
    text-decoration: underline;
}

.faq-page__hero-card,
.faq-page__section-card,
.faq-page__contact-card {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.faq-page__hero-card,
.faq-page__section-card,
.faq-page__contact-card {
    padding: 1.9rem;
}

.faq-page__hero-title,
.faq-page__sidebar-title {
    margin-bottom: 0.85rem;
    font-size: 2rem;
    line-height: 1.1;
}

.faq-page__quick-list {
    display: grid;
    gap: 0.85rem;
    margin: 1.4rem 0 0;
    padding: 0;
    list-style: none;
}

.faq-page__quick-item {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    color: #33415f;
    line-height: 1.6;
}

.faq-page__content-grid {
    grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
    align-items: start;
    padding-bottom: 6rem;
}

.faq-page__sections {
    display: grid;
    gap: 1.25rem;
}

.faq-page__section-title {
    margin-bottom: 0.7rem;
    font-size: 2.1rem;
    line-height: 1.08;
}

.faq-page__section-description {
    margin-bottom: 1.15rem;
}

.faq-page__panels {
    gap: 0.8rem;
    background: transparent;
}

.faq-page__panel {
    overflow: hidden;
    border: 1px solid rgba(8, 23, 63, 0.08);
    background: #ffffff;
    box-shadow: 0 10px 28px rgba(8, 27, 90, 0.05);
}

.faq-page__sidebar {
    position: sticky;
    top: 1.5rem;
}

.faq-page__sidebar-text {
    margin-bottom: 0;
}

.faq-page__sidebar-meta {
    margin-top: 1rem;
    color: #6a7590;
    font-size: 0.88rem;
    font-weight: 700;
}

:deep(.faq-page__panel-title) {
    min-height: 4.25rem;
    color: #08173f;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.5;
}

:deep(.faq-page__panel-text) {
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
    .faq-page__hero-grid,
    .faq-page__content-grid {
        grid-template-columns: 1fr;
        gap: 1.6rem;
    }

    .faq-page__title {
        max-width: 100%;
        font-size: 3.25rem;
    }

    .faq-page__hero-card,
    .faq-page__section-card,
    .faq-page__contact-card {
        padding: 1.6rem;
    }

    .faq-page__hero-title,
    .faq-page__sidebar-title {
        font-size: 1.7rem;
    }

    .faq-page__section-title {
        font-size: 1.85rem;
    }

    .faq-page__content-grid {
        padding-bottom: 4.75rem;
    }

    .faq-page__sidebar {
        position: static;
    }
}

@media screen and (max-width: 600px) {
    .faq-page__hero {
        padding: 3.75rem 0 2rem;
    }

    .faq-page__title {
        font-size: 2.8rem;
        line-height: 1;
    }

    .faq-page__hero-card,
    .faq-page__section-card,
    .faq-page__contact-card {
        border-radius: 1.2rem;
        padding: 1.4rem;
    }

    .faq-page__hero-title,
    .faq-page__sidebar-title {
        font-size: 1.45rem;
    }

    .faq-page__section-title {
        font-size: 1.6rem;
    }

    .faq-page__content-grid {
        gap: 1.4rem;
        padding-bottom: 4rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .faq-page__hero-copy,
    .faq-page__hero-card,
    .faq-page__section-card,
    .faq-page__sidebar {
        animation: none;
    }
}
</style>
