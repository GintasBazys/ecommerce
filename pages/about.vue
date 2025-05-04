<script setup lang="ts">
useHead({
    title: "About | Ecommerce"
})
</script>

<template>
    <section>
        <VContainer class="py-12">
            <VRow justify="center">
                <VCol cols="12" md="10">
                    <VCard flat class="pa-4">
                        <VCardTitle class="text-h4 mb-6">About page</VCardTitle>
                    </VCard>
                </VCol>
            </VRow>
        </VContainer>

        <AboutCta :extra-spacer-class="'pb-0'" />
        <AboutCards />
        <AboutColumns />
    </section>
</template>
