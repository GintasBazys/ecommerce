<script setup lang="ts">
import PoliciesBlock from "@/components/About/PoliciesBlock.vue"

const { cart } = storeToRefs(useCartStore())
const isClientHydrated = ref<boolean>(false)

onMounted(() => {
    isClientHydrated.value = true
})
</script>

<template>
    <main>
        <div>
            <slot></slot>
        </div>
        <NewsletterComponent />
        <PoliciesBlock />
        <CartDrawer v-if="isClientHydrated && cart" />
    </main>
</template>
