<script setup lang="ts">
import type { Product } from "@medusajs/medusa"

const store = useProductStore()
const { products } = storeToRefs(store)

const regionStore = useRegionStore()
const { regionStoreId } = storeToRefs(regionStore)

await useAsyncData("product", async () => {
    await store.fetchData(regionStoreId.value ?? "")
    return store.products ?? null
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
                <Swiper
                    class="showcaseSwiper"
                    :space-between="20"
                    :grab-cursor="true"
                    :breakpoints="{
                        '280': {
                            slidesPerView: 1.5
                        },
                        '768': {
                            slidesPerView: 3
                        },
                        '992': {
                            slidesPerView: 4
                        }
                    }"
                >
                    <SwiperSlide v-for="product in products" :key="product.id">
                        <ProductCard :product="product as Product" />
                    </SwiperSlide>
                </Swiper>
            </ClientOnly>
        </div>
    </section>
</template>
