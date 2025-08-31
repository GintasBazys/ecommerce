<script setup lang="ts">
useHead({
    title: "Returns | Ecommerce"
})

const faqPanels = ref<number[]>([])
</script>

<template>
    <section class="py-10">
        <VContainer>
            <h1 class="text-h4 text-center mb-2">RETURNS</h1>
            <div class="text-center mb-8">Follow these easy steps to return your unwanted product hassle-free.</div>

            <VRow justify="center" class="mb-10" dense>
                <VCol cols="12" md="8" lg="4" class="mb-4">
                    <VCard class="pa-4">
                        <VCardTitle class="text-h5">1. Start Your Return</VCardTitle>
                        <VCardText>
                            Initiate your return by logging into your account and selecting the item you wish to return. Follow the
                            on-screen instructions to receive your return label.
                        </VCardText>
                    </VCard>
                </VCol>
                <VCol cols="12" md="8" lg="4" class="mb-4">
                    <VCard class="pa-4">
                        <VCardTitle class="text-h5">2. Package the Item</VCardTitle>
                        <VCardText>
                            Securely pack the item in its original packaging. Attach the return label provided and make sure the package is
                            ready for shipment.
                        </VCardText>
                    </VCard>
                </VCol>
                <VCol cols="12" md="8" lg="4" class="mb-4">
                    <VCard class="pa-4">
                        <VCardTitle class="text-h5">3. Ship It Back</VCardTitle>
                        <VCardText>
                            Drop off the package at the nearest courier or schedule a pickup. Once we receive your return, we’ll process
                            your refund or exchange.
                        </VCardText>
                    </VCard>
                </VCol>
            </VRow>
            <div class="mb-10">
                <h2 class="text-h5 text-center font-weight-bold mb-6">Return policy</h2>
                <p>
                    We want you to be completely satisfied with your purchase. If, for any reason, you are not happy with your product, you
                    may return it within 30 days of receipt for a full refund or exchange. All returned items must be in their original
                    condition, unworn or unused, and in the original packaging with all tags and accessories intact.
                </p>
                <p>
                    To initiate a return, simply log into your account and follow the return instructions. You will receive a prepaid
                    shipping label to send the item back to us. Please note that return shipping is free for domestic orders. For
                    international returns, the cost of return shipping will be deducted from your refund.
                </p>
                <p class="mb-4">
                    Certain items such as final sale products, personalized items, and perishable goods are not eligible for return. If you
                    received a damaged or defective item, please contact our customer service team within 48 hours of delivery, and we will
                    arrange a replacement or full refund.
                </p>
            </div>

            <h2 class="text-h6 text-center mb-4">Return policy FAQ's</h2>
            <VExpansionPanels v-model="faqPanels" multiple>
                <VExpansionPanel>
                    <VExpansionPanelTitle>Our return policy</VExpansionPanelTitle>
                    <VExpansionPanelText>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam temporibus dolores nulla. Dicta dolorum sit amet,
                        aut eaque aperiam, voluptatum odit placeat quibusdam mollitia iure in sint soluta maiores cumque?
                    </VExpansionPanelText>
                </VExpansionPanel>
                <VExpansionPanel>
                    <VExpansionPanelTitle>International returns</VExpansionPanelTitle>
                    <VExpansionPanelText>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam temporibus dolores nulla. Dicta dolorum sit amet,
                        aut eaque aperiam, voluptatum odit placeat quibusdam mollitia iure in sint soluta maiores cumque?
                    </VExpansionPanelText>
                </VExpansionPanel>
                <VExpansionPanel>
                    <VExpansionPanelTitle>Refund process</VExpansionPanelTitle>
                    <VExpansionPanelText>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas sint odit eum placeat aperiam quasi exercitationem
                        quae iusto! Perspiciatis quas maxime quia, eaque odit maiores perferendis laudantium
                    </VExpansionPanelText></VExpansionPanel
                ></VExpansionPanels
            ></VContainer
        >
    </section>
</template>
