<script setup lang="ts">
import { ClientOnly } from "#components"

const store = useProductStore()
const { products } = storeToRefs(store)

const regionStore = useRegionStore()
const { regionStoreId } = storeToRefs(regionStore)

await useAsyncData("product", async () => {
    await store.fetchData(regionStoreId.value ?? "")
    return store.products ?? null
})

const containerRef = ref(null)
useSwiper(containerRef, {
    breakpoints: {
        "280": {
            slidesPerView: 1.5
        },
        "768": {
            slidesPerView: 3
        },
        "1024": {
            slidesPerView: 4
        }
    },
    spaceBetween: 0,
    grabCursor: true
})
</script>

<template>
    <section class="spacer showcase-section position-relative">
        <VContainer class="max-w-4xl mx-auto px-4">
            <div class="text-center">
                <h2 class="text-3xl font-bold mb-2">Latest Offers</h2>
                <p class="text-gray-600 mb-6">
                    Browse our latest deals and promotions. These fresh arrivals combine top quality with unbeatable prices—don’t miss out!
                </p>
            </div>
            <ClientOnly>
                <swiper-container ref="containerRef" class="px-2">
                    <swiper-slide v-for="product in products" :key="product.id">
                        <ProductCard :product="product" />
                    </swiper-slide>
                </swiper-container>
            </ClientOnly>
        </VContainer>
    </section>
</template>
