<script setup lang="ts">
import OrderInvoice from "@/components/Orders/OrderInvoice.vue"

definePageMeta({
    layout: "account",
    middleware: ["auth"]
})

useHead({ title: "Order Details | Ecommerce" })
</script>

<template>
  <OrderInvoice />
</template>
