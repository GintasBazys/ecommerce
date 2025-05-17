<script setup lang="ts">
useHead({
    title: "404 | Ecommerce"
})

definePageMeta({
    layout: "account"
})

function handleError(): void {
    clearError({ redirect: "/" })
}
</script>

<template>
    <VContainer class="py-16 text-center" max-width="520">
        <VRow justify="center">
            <VCol cols="12">
                <h1 class="text-h5 mb-6">Sorry. The page you were looking for doesn't exist.</h1>
                <VBtn color="primary" class="px-6" @click="handleError"> Go to homepage </VBtn>
            </VCol>
        </VRow>
    </VContainer>
</template>
