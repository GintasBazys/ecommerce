<script setup lang="ts">
import type { ProductDTO } from "@medusajs/types"

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
        "992": {
            slidesPerView: 4
        }
    },
    spaceBetween: 20,
    grabCursor: true
})
</script>

<template>
    <section class="spacer showcase-section position-relative">
        <div class="container">
            <h2 class="text-center mb-4">Latest Offers</h2>
            <p class="text-center mb-4 mb-lg-5">
                Cosmo lacus meleifend menean diverra loremous. Nullam sit amet orci rutrum risus laoreet semper vel non magna. Mauris vel
                sem a lectus vehicula ultricies. Etiam semper sollicitudin lectus indous scelerisque.
            </p>
            <ClientOnly>
                <swiper-container ref="containerRef" class="showcaseSwiper">
                    <swiper-slide v-for="product in products" :key="product.id">
                        <ProductCard :product="product as ProductDTO" />
                    </swiper-slide> </swiper-container
            ></ClientOnly>
        </div>
    </section>
</template>
