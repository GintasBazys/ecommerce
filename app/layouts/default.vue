<script setup lang="ts">
const LazyCartDrawer = defineAsyncComponent(() => import("@/components/Cart/CartDrawer.vue"))
const LazyPoliciesBlock = defineAsyncComponent(() => import("@/components/About/PoliciesBlock.vue"))
const { cart, openCartDrawer } = storeToRefs(useCartStore())
</script>

<template>
    <main>
        <div>
            <slot></slot>
        </div>
        <LazyPoliciesBlock />
        <LazyCartDrawer v-if="cart && openCartDrawer" />
    </main>
</template>
