<script setup lang="ts">
import type { Product } from "@medusajs/medusa"

useHead({
    title: "Search | Ecommerce"
})

const searchCounter = ref<number>(0)
const searchQuery = ref<string>("")
const products = ref<Product[]>([])

interface SearchResponse {
    products: Product[]
    count: number
}

const handleSearch = async (e: Event) => {
    e.preventDefault()
    try {
        const response = await $fetch<SearchResponse>("/api/search", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: {
                q: searchQuery.value
            }
        })
        searchCounter.value = response.count
        products.value = response.products
    } catch (error) {
        console.error("Error during search:", error)
    }
}
</script>

<template>
    <section class="spacer">
        <div class="container">
            <h1 class="mb-4 pb-3">
                Search <span class="text-primary fw-bold search-counter">({{ searchCounter }})</span>
            </h1>
            <form @submit="handleSearch">
                <div class="input-group p-0 mt-3 my-5">
                    <input
                        id="search-input"
                        v-model="searchQuery"
                        required
                        class="form-control my-0 py-3 px-4 border-end-0 border"
                        type="search"
                        placeholder="Search..."
                    />
                    <span class="input-group-append">
                        <button class="btn p-3 bg-white border-start-0 border" type="submit">
                            <NuxtImg src="/images/search.svg" alt="Search" width="24" height="24" loading="lazy" />
                        </button>
                    </span>
                </div>
            </form>
            <div class="search-results">
                <template v-if="products.length > 0">
                    <ProductCard v-for="product in products" :key="product.id" :product="product as Product" />
                </template>
            </div>
        </div>
    </section>
</template>
