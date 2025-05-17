<script setup lang="ts">
import type { Policies } from "@/types/interfaces"

const policies = ref<Policies[]>([
    {
        icon: "mdi-truck-fast",
        title: "Free Shipping",
        description: "Enjoy free shipping on orders over $50."
    },
    {
        icon: "mdi-lock-outline",
        title: "Secure Payment",
        description: "Your data is protected with top-grade encryption."
    },
    {
        icon: "mdi-headset",
        title: "24/7 Support",
        description: "We’re here to help you anytime, anywhere."
    }
])
</script>

<template>
    <VContainer fluid class="shop-policies py-12">
        <VContainer>
            <VRow>
                <VCol v-for="policy in policies" :key="policy.title" cols="12" md="4" class="text-center mb-8">
                    <VIcon size="48" class="mb-4">
                        {{ policy.icon }}
                    </VIcon>
                    <h3 class="text-h6 font-weight-medium mb-2">
                        {{ policy.title }}
                    </h3>
                    <p class="text-body-2">
                        {{ policy.description }}
                    </p>
                </VCol>
            </VRow>
        </VContainer>
    </VContainer>
</template>

<style scoped>
.shop-policies {
    background-color: #f9f9f9;
}
</style>
