<script setup lang="ts">
useHead({
    title: "About | Ecommerce"
})
</script>

<template>
    <section>
        <VContainer style="visibility: hidden; height: 0; padding: 0">
            <VRow>
                <VCol cols="12" md="10">
                    <h1 class="pb-3 text-h4 font-weight-bold">About page</h1>
                </VCol>
            </VRow>
        </VContainer>
        <AboutCta :extra-spacer-class="'pb-0'" />
        <AboutCards />
        <AboutColumns />
    </section>
</template>
