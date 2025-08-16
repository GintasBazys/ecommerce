<script setup lang="ts">
import type { SearchResponse } from "@/types/interfaces"
import type { ProductDTO } from "@medusajs/types"

useHead({
    title: "Search | Ecommerce"
})

const searchCounter = ref<number>(0)
const searchQuery = ref<string>("")
const products = ref<ProductDTO[]>([])
const isLoading = ref<boolean>(false)
const hasSearched = ref<boolean>(false)
const lastSearchQuery = ref<string>("")
const searchHistory = ref<string[]>([])

const { regionStoreId } = storeToRefs(useRegionStore())
const regionId: string = regionStoreId.value ?? ""

if (typeof window !== "undefined") {
    searchHistory.value = JSON.parse(localStorage.getItem("searchHistory") || "[]")
}

function updateSearchHistory(query: string): void {
    if (!searchHistory.value.includes(query)) {
        searchHistory.value.unshift(query)
        if (searchHistory.value.length > 5) {
            searchHistory.value.pop()
        }
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory.value))
    }
}

async function handleSearch(e: Event): Promise<void> {
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
            params: regionId ? { region_id: regionId } : {},
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

function reRunSearch(query: string): void {
    searchQuery.value = query
    handleSearch(new Event("submit"))
}

function deleteHistoryItem(index: number): void {
    searchHistory.value.splice(index, 1)
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory.value))
}
</script>

<template>
  <VContainer class="py-10 mt-10">
    <VRow>
      <VCol cols="12">
        <h1 class="text-h4 font-weight-bold mb-6">
          Search
          <span class="text-primary">({{ searchCounter }})</span>
        </h1>

        <VForm @submit.prevent="handleSearch">
          <VTextField
            v-model="searchQuery"
            label="Search..."
            outlined
            dense
            clearable
            append-inner-icon="mdi-magnify"
            :loading="isLoading"
          />
        </VForm>
      </VCol>

      <VCol v-if="searchHistory.length" cols="12" class="mt-4">
        <h3 class="text-h6 mb-2">Recent Searches</h3>
        <VList dense>
          <VListItem v-for="(query, index) in searchHistory" :key="index" class="d-flex justify-space-between align-center">
            <VBtn text color="primary" @click="reRunSearch(query)">
              {{ query }}
            </VBtn>
            <VBtn icon @click="deleteHistoryItem(index)">
              <VIcon color="red">mdi-delete</VIcon>
            </VBtn>
          </VListItem>
        </VList>
      </VCol>

      <VCol v-if="isLoading" cols="12" class="text-center py-6">
        <VProgressCircular indeterminate color="primary" size="40" class="mb-3" />
        <div>Loading results...</div>
      </VCol>

      <VCol cols="12" class="search-results">
        <template v-if="!isLoading && products.length">
          <VRow>
            <VCol v-for="product in products" :key="product.id" cols="12" sm="6" md="4">
              <ProductCard :product="product as ProductDTO" />
            </VCol>
          </VRow>
        </template>
        <p v-else-if="!isLoading && hasSearched">No results found.</p>
      </VCol>
    </VRow>
  </VContainer>
</template>
