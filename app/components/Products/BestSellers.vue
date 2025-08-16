<script setup lang="ts">
import type { ProductDTO } from "@medusajs/types"

const { bestSellers } = storeToRefs(useProductStore())

const { regionStoreId } = storeToRefs(useRegionStore())

const { data: sellers } = await useAsyncData<ProductDTO[]>(
    `product-bestsellers-${regionStoreId.value}`,
    async () => {
        await useProductStore().fetchBestSellers(regionStoreId.value ?? "")
        return useProductStore().bestSellers ?? []
    },
    {
        default: () => []
    }
)
</script>

<template>
  <section v-if="sellers" class="spacer position-relative">
    <VContainer class="max-w-4xl mx-auto px-4">
      <div class="text-center">
        <h2 class="text-3xl font-bold mb-2">Bestsellers</h2>
        <p class="text-gray-600 mb-6">
          Discover our most popular picks, chosen by customers for their quality and value. These products are flying off the
          shelves!
        </p>
      </div>
      <ClientOnly>
        <swiper-container
          class="px-2"
          :breakpoints="{
            280: { slidesPerView: 1.5 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 }
          }"
          :space-between="0"
          :grab-cursor="true"
        >
          <swiper-slide v-for="product in bestSellers" :key="product.id">
            <ProductCard :product="product" />
          </swiper-slide>
        </swiper-container>
      </ClientOnly>
    </VContainer>
  </section>
</template>
