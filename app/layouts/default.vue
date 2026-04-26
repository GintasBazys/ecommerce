<script setup lang="ts">
const LazyCartDrawer = defineAsyncComponent(() => import("@/components/Cart/CartDrawer.vue"))
const LazyPoliciesBlock = defineAsyncComponent(() => import("@/components/About/PoliciesBlock.vue"))
const { cart, openCartDrawer } = storeToRefs(useCartStore())
const isClientHydrated = ref<boolean>(false)
const showDeferredSections = ref<boolean>(false)

onMounted(() => {
    isClientHydrated.value = true

    const revealDeferredSections = () => {
        showDeferredSections.value = true
    }

    const requestIdleCallback = window.requestIdleCallback

    if (typeof requestIdleCallback === "function") {
        requestIdleCallback(revealDeferredSections)
        return
    }

    window.setTimeout(revealDeferredSections, 1200)
})
</script>

<template>
    <main>
        <div>
            <slot></slot>
        </div>
        <LazyPoliciesBlock v-if="showDeferredSections" />
        <LazyCartDrawer v-if="isClientHydrated && cart && openCartDrawer" />
    </main>
</template>
