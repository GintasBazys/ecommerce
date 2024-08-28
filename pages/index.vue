<script setup lang="ts">
import { useProductStore } from "~/stores/product"
import { useRouter, useRoute } from "vue-router"

const store = useProductStore()
const { products, limit, totalCount } = storeToRefs(store)

const router = useRouter()
const route = useRoute()

const totalPages = computed(() => Math.ceil(totalCount.value / limit.value))

const goToPage = (page: number) => {
    const newOffset = (page - 1) * limit.value
    store.$patch({ limit: limit.value, offset: newOffset })
    store.fetchData()

    if (page > 1) {
        router.replace({ query: { ...route.query, page: String(page) } })
    } else {
        const { page, ...otherParams } = route.query
        router.replace({ query: { ...otherParams } })
    }
}

watch(
    () => route.query.page,
    (newPage) => {
        const pageNumber = parseInt(newPage as string, 10) || 1
        goToPage(pageNumber)
    },
    { immediate: true }
)

const pageNumbers = computed(() => {
    return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})
</script>

<template>
    <section class="container">
        <div class="row">
            <div v-for="product in products" :key="product.id" class="col-12 col-md-6 col-lg-4">
                <ProductCard :product="product" />
            </div>
        </div>
        <nav aria-label="Page navigation example">
            <ul class="pagination">
                <li v-for="page in pageNumbers" :key="page" class="page-item">
                    <button class="page-link" @click="goToPage(page)">
                        {{ page }}
                    </button>
                </li>
            </ul>
        </nav>
        <h1>Home page</h1>
        <NuxtLink to="/about">About page</NuxtLink>
    </section>
</template>
