<script setup lang="ts">
import AppHeader from "~/components/Header/AppHeader.vue"
import { useProductStore } from "~/stores/product"
const store = useProductStore()
await callOnce(() => store.fetchData())
</script>
<template>
    <NuxtLoadingIndicator />
    <AppHeader />
    <NuxtPage />
</template>

<style>
.page-enter-active,
.page-leave-active {
    transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
    opacity: 0;
    filter: blur(1rem);
}
</style>
