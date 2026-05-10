<script setup lang="ts">
const LazyCartDrawer = defineAsyncComponent(() => import("@/components/Cart/CartDrawer.vue"))
const { cart, openCartDrawer } = storeToRefs(useCartStore())
</script>

<template>
    <main>
        <div>
            <slot></slot>
        </div>
        <NuxtIsland name="PoliciesBlock" />
        <LazyCartDrawer v-if="cart && openCartDrawer" />
    </main>
</template>
