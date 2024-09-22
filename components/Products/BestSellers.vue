<script setup lang="ts">
const store = useProductStore()
const { bestSellers } = storeToRefs(store)

onServerPrefetch(async () => {
    await store.fetchBestSellers()
})
console.log(bestSellers)
</script>

<template>
    <section class="spacer">
        <div class="container" />
    </section>
</template>
