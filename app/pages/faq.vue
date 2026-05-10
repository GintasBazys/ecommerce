<script setup lang="ts">
import type { FaqSection } from "~/types/content-pages"

import { createBreadcrumbSchema, type SchemaNode, useSiteIdentity, useStructuredData } from "~/composables/shared/useStructuredData"

const route = useRoute()
const { absoluteUrl } = useSiteIdentity()

const faqSections: FaqSection[] = [
    {
        id: "orders",
        eyebrow: "Shopping Support",
        title: "Orders and delivery",
        description: "The questions customers ask most often before checkout, after payment, and while an order is on the way.",
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

useHead({
    title: "FAQ | Medusa Commerce"
})

useSeoMeta({
    description: "Browse common answers about delivery, orders, returns, exchanges, and support before contacting the Medusa Commerce team."
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
    <NuxtIsland name="FaqContent" />
</template>
