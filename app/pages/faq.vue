<script setup lang="ts">
useHead({
    title: "FAQ | Ecommerce"
})

const panels1 = ref<number[]>([0])
const panels2 = ref<number[]>([0])
</script>

<template>
    <section class="py-10">
        <VContainer>
            <h1 class="mb-6 pb-3 text-h4 font-weight-bold">F.A.Q</h1>
            <VRow>
                <VCol cols="12" lg="9">
                    <div class="faq-blocks">
                        <h2 class="text-h5 mb-4">Lorem ipsum</h2>
                        <VExpansionPanels v-model="panels1" multiple>
                            <VExpansionPanel>
                                <VExpansionPanelTitle>Accordion Item #1</VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <strong>This is the first item's accordion body.</strong> It is shown by default...
                                </VExpansionPanelText>
                            </VExpansionPanel>

                            <VExpansionPanel>
                                <VExpansionPanelTitle>Accordion Item #2</VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <strong>This is the second item's accordion body.</strong> It is hidden by default...
                                </VExpansionPanelText>
                            </VExpansionPanel>

                            <VExpansionPanel>
                                <VExpansionPanelTitle>Accordion Item #3</VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <strong>This is the third item's accordion body.</strong> It is hidden by default...
                                </VExpansionPanelText>
                            </VExpansionPanel>
                        </VExpansionPanels>
                        <h2 class="text-h5 mt-10 mb-4">Lorem ipsum</h2>
                        <VExpansionPanels v-model="panels2" multiple>
                            <VExpansionPanel>
                                <VExpansionPanelTitle>Accordion Item #1</VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <strong>This is the first item's accordion body.</strong> It is shown by default...
                                </VExpansionPanelText>
                            </VExpansionPanel>

                            <VExpansionPanel>
                                <VExpansionPanelTitle>Accordion Item #2</VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <strong>This is the second item's accordion body.</strong> It is hidden by default...
                                </VExpansionPanelText>
                            </VExpansionPanel>

                            <VExpansionPanel>
                                <VExpansionPanelTitle>Accordion Item #3</VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <strong>This is the third item's accordion body.</strong> It is hidden by default...
                                </VExpansionPanelText>
                            </VExpansionPanel>
                        </VExpansionPanels>
                    </div>
                </VCol>
                <VCol cols="12" lg="3">
                    <VCard class="pa-4" elevation="2">
                        <VCardText>
                            <p class="mb-3">Didn't find an answer? <br />Get in touch</p>
                            <div class="text-subtitle-2 mb-2">
                                Working time<br />
                                I-VII 6 - 11 p.m.
                            </div>
                            <VBtn color="primary" block to="/contact">Get in touch</VBtn>
                        </VCardText>
                    </VCard>
                </VCol>
            </VRow>
        </VContainer>
    </section>
</template>
