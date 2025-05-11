<script setup lang="ts">
import type { ProductCategoryDTO, ProductDTO } from "@medusajs/types"

definePageMeta({
    layout: "default"
})

const { regionStoreId } = storeToRefs(useRegionStore())

const route = useRoute()
const category = ref<ProductCategoryDTO | null>(null)
const products = ref<ProductDTO[]>([])
const offset = ref(0)
const limit = 9
const totalCount = ref(0)
const loadingRef = ref(false)

const fetchProducts = async () => {
    if (!category.value?.handle) return

    loadingRef.value = true

    const { data: productData, error } = await useFetch<{
        products: ProductDTO[]
        count: number
    }>(`/api/products/products`, {
        query: {
            category_id: category.value.id,
            region_id: regionStoreId.value,
            limit,
            offset: offset.value
        }
    })

    if (!error.value && productData.value) {
        const newProducts = Array.isArray(productData.value?.products) ? productData.value.products : []

        if (offset.value === 0) {
            products.value = newProducts
        } else {
            products.value = [...products.value, ...newProducts]
        }

        totalCount.value = productData.value.count
    }

    loadingRef.value = false
}

const { data } = await useFetch<ProductCategoryDTO>(`/api/categories/${route.params.slug}`)
if (data.value && "error" in data.value) {
    await navigateTo("/page-not-found")
} else {
    category.value = data.value || null
    await fetchProducts()
}

useHead({
    title: `${category.value?.name} | Ecommerce`
})

//TODO remove sentinel element and add last item class to product
//TODO implement sort when store API supports sorting by price
const infiniteSentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver

onMounted(() => {
    observer = new IntersectionObserver(
        async ([entry]) => {
            if (entry.isIntersecting && !loadingRef.value && offset.value + limit < totalCount.value) {
                offset.value += limit
                await fetchProducts()
            }
        },
        {
            root: null,
            rootMargin: "200px",
            threshold: 0
        }
    )

    if (infiniteSentinel.value) {
        observer.observe(infiniteSentinel.value)
    }
})

onUnmounted(() => {
    observer.disconnect()
})
</script>

<template>
    <section>
        <VContainer fluid class="pa-0">
            <VSheet
                height="300"
                class="d-flex position-relative align-center justify-center text-white py-6"
                :style="
                    category?.metadata?.collectionImage
                        ? `background: url(${category.metadata.collectionImage}) center/cover no-repeat;`
                        : 'background-color: #4A90E2;'
                "
            >
                <div class="position-absolute top-0 left-0 w-100 h-100" style="background-color: rgba(0, 0, 0, 0.5); z-index: 1"></div>
                <VRow class="fill-height" align="center" justify="center" style="z-index: 1">
                    <VCol cols="12" class="text-center">
                        <h1 class="text-h3 font-weight-bold">{{ category?.name }}</h1>
                    </VCol>
                </VRow>
            </VSheet>
        </VContainer>
        <VContainer class="my-6">
            <VRow>
                <VCol v-for="product in products" :key="product.id" class="pa-0" cols="12" sm="6" md="4" lg="3">
                    <ProductCard :product="product" />
                </VCol>
            </VRow>
            <div ref="infiniteSentinel" style="height: 1px"></div>
            <VRow justify="center" class="mt-4">
                <VProgressCircular v-if="loadingRef" indeterminate color="primary" />
            </VRow>
        </VContainer>
    </section>
</template>
