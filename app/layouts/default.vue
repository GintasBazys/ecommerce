<script setup lang="ts">
import PoliciesBlock from "@/components/About/PoliciesBlock.vue"

const { cart } = storeToRefs(useCartStore())
</script>

<template>
  <main>
    <div>
      <slot></slot>
    </div>
    <NewsletterComponent />
    <PoliciesBlock />
    <CartDrawer v-if="cart" />
  </main>
</template>
