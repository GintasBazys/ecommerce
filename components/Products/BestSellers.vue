<script setup lang="ts">
const store = useProductStore()
const { bestSellers } = storeToRefs(store)

onServerPrefetch(async () => {
    await store.fetchBestSellers()
})
</script>

<template>
    <section class="spacer">
        <div class="container" />
    </section>
</template>
