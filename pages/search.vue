<script setup lang="ts">
import { ref } from "vue"
import type { ProductDTO } from "@medusajs/types"

useHead({
    title: "Search | Ecommerce"
})

interface SearchResponse {
    products: ProductDTO[]
    count: number
}

const searchCounter = ref<number>(0)
const searchQuery = ref<string>("")
const products = ref<ProductDTO[]>([])
const isLoading = ref<boolean>(false)
const hasSearched = ref<boolean>(false)
const lastSearchQuery = ref<string>("")
const searchHistory = ref<string[]>([])
const regionStore = useRegionStore()
const { regionStoreId } = storeToRefs(regionStore)

const regionId = regionStoreId.value ?? ""

if (typeof window !== "undefined") {
    searchHistory.value = JSON.parse(localStorage.getItem("searchHistory") || "[]")
}

const updateSearchHistory = (query: string) => {
    if (!searchHistory.value.includes(query)) {
        searchHistory.value.unshift(query)
        if (searchHistory.value.length > 5) {
            searchHistory.value.pop()
        }
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory.value))
    }
}

const handleSearch = async (e: Event) => {
    e.preventDefault()

    if (searchQuery.value === lastSearchQuery.value) {
        return
    }

    lastSearchQuery.value = searchQuery.value
    updateSearchHistory(searchQuery.value)

    isLoading.value = true
    try {
        const response = await $fetch<SearchResponse>("/api/search", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            params: {
                ...(regionId ? { region_id: regionId } : {})
            },
            body: {
                q: searchQuery.value
            }
        })
        searchCounter.value = response.count
        products.value = response.products
    } catch (error) {
        console.error("Error during search:", error)
    } finally {
        isLoading.value = false
        hasSearched.value = true
    }
}

const reRunSearch = (query: string) => {
    searchQuery.value = query
    handleSearch(new Event("submit"))
}

const deleteHistoryItem = (index: number) => {
    searchHistory.value.splice(index, 1)
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory.value))
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
                        <button class="btn p-3 bg-white border-start-0 border" type="submit" :disabled="isLoading">
                            <NuxtImg src="/images/search.svg" alt="Search" width="24" height="24" loading="lazy" />
                        </button>
                    </span>
                </div>
            </form>

            <div v-if="searchHistory.length" class="search-history mb-4">
                <h3>Recent Searches</h3>
                <ul class="list-group">
                    <li
                        v-for="(query, index) in searchHistory"
                        :key="index"
                        class="list-group-item d-flex justify-content-between align-items-center"
                    >
                        <span class="text-primary cursor-pointer" @click="reRunSearch(query)">{{ query }}</span>
                        <button class="btn btn-sm btn-danger" @click="deleteHistoryItem(index)">Delete</button>
                    </li>
                </ul>
            </div>

            <div v-if="isLoading" class="text-center my-4 d-flex flex-column gap-3 align-items-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <span>Loading results...</span>
            </div>
            <div class="search-results">
                <template v-if="!isLoading && products.length > 0">
                    <ProductCard v-for="product in products" :key="product.id" :product="product as ProductDTO" />
                </template>
                <p v-if="!isLoading && hasSearched && !products.length">No results found.</p>
            </div>
        </div>
    </section>
</template>
