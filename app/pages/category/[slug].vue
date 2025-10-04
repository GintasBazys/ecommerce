<script setup lang="ts">
import { nextTick } from "vue"

import type { ProductCategoryDTO, ProductDTO } from "@medusajs/types"

definePageMeta({ layout: "default" })

const { regionStoreId } = storeToRefs(useRegionStore())

const route = useRoute()
const category = ref<ProductCategoryDTO | null>(null)
const products = ref<ProductDTO[]>([])
const offset = ref<number>(0)
const limit = 9
const totalCount = ref<number>(0)
const loadingRef = ref<boolean>(false)

const sortOptions = [
    { text: "From latest", value: "-created_at" },
    { text: "From oldest", value: "created_at" },
    { text: "Price: low → high", value: "variants.calculated_price.calculated_amount" },
    { text: "Price: high → low", value: "-variants.calculated_price.calculated_amount" },
    { text: "Title: A → Z", value: "title" },
    { text: "Title: Z → A", value: "-title" }
]
const sortOption = ref<string>(sortOptions[0]!.value)

const hasMore = computed(() => offset.value + limit < totalCount.value)

const fetchProducts = async () => {
    if (!category.value?.handle) return
    loadingRef.value = true
    try {
        const isPriceSort = sortOption.value.includes("variants.calculated_price")
        const endpoint = isPriceSort ? "/api/products/products-price" : "/api/products/products"

        const productData = await $fetch<{ products: ProductDTO[]; count: number }>(endpoint, {
            query: {
                category_id: category.value.id,
                region_id: regionStoreId.value,
                limit,
                offset: offset.value,
                order: sortOption.value
            }
        })

        const newProducts = Array.isArray(productData?.products) ? productData.products : []

        if (offset.value === 0) {
            products.value = newProducts
        } else {
            products.value = [...products.value, ...newProducts]
        }

        totalCount.value = productData.count
        await nextTick()
    } catch (e) {
        console.error("Error fetching products", e)
    } finally {
        loadingRef.value = false
    }
}

const { data } = await useFetch<ProductCategoryDTO>(`/api/categories/${route.params.slug}`)
if (data.value && "error" in data.value) {
    await navigateTo("/page-not-found")
} else {
    category.value = data.value || null
    await fetchProducts()
}

useHead({ title: `${category.value?.name} | Ecommerce` })

const onIntersectLast = async (isIntersecting: boolean, entries: IntersectionObserverEntry[]) => {
    if (!isIntersecting || loadingRef.value || !hasMore.value) return

    const entry = entries?.[0]
    const target = entry?.target as HTMLElement | undefined
    if (!target || !target.classList.contains("js-last-item")) return

    offset.value += limit
    await fetchProducts()
}

watch(sortOption, async () => {
    offset.value = 0
    await fetchProducts()
    window?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
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
            <VRow justify="center">
                <VCol lg="8">
                    <p style="text-align: center">{{ category?.description }}</p>
                </VCol>
            </VRow>
        </VContainer>
        <VDivider class="mt-6" />
        <VContainer v-if="products.length > 0" class="my-6">
            <VRow class="mb-4" align="center">
                <VCol cols="12" sm="6" md="4" lg="3">
                    <VSelect
                        v-model="sortOption"
                        :items="sortOptions"
                        item-title="text"
                        item-value="value"
                        label="Sort by"
                        outlined
                        dense
                    />
                </VCol>
            </VRow>
            <VRow>
                <VCol
                    v-for="(product, index) in products"
                    :key="product.id"
                    v-intersect="{
                        handler: onIntersectLast,
                        options: { root: null, rootMargin: '300px', threshold: 0 }
                    }"
                    cols="12"
                    sm="6"
                    md="4"
                    lg="3"
                    class="pa-0"
                    :class="{ 'js-last-item': index === products.length - 1 }"
                >
                    <ProductCard :product="product" />
                </VCol>
            </VRow>
            <VRow justify="center" class="mt-4">
                <VProgressCircular v-if="loadingRef" indeterminate color="primary" />
            </VRow>
        </VContainer>
    </section>
</template>
