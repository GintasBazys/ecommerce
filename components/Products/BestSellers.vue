<script setup lang="ts">
const store = useProductStore()
const { bestSellers } = storeToRefs(store)

onServerPrefetch(async () => {
    await store.fetchBestSellers()
})
</script>

<template>
    <section class="spacer">
        <div class="container">
            <div class="row">
                <div v-for="product in bestSellers" :key="product.id" class="col-lg-4 col-md-6">
                    <ProductCard :product="product" />
                </div>
            </div>
        </div>
    </section>
</template>
