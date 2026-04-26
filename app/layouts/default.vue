<script setup lang="ts">
import PoliciesBlock from "@/components/About/PoliciesBlock.vue"

const LazyCartDrawer = defineAsyncComponent(() => import("@/components/Cart/CartDrawer.vue"))
const { cart, openCartDrawer } = storeToRefs(useCartStore())
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
        <LazyCartDrawer v-if="isClientHydrated && cart && openCartDrawer" />
    </main>
</template>
