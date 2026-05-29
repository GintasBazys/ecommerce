import type { ProductCategoryDTO } from "@medusajs/types"
import type { Ref } from "vue"

import type { CategoryListingFilterState } from "~/composables/category/useCategoryListingFilters"
import { createEmptyPriceRange } from "~/composables/category/useCategoryListingFilters"
import type { CategoryPriceRange, CategoryProductsFacets, CategoryProductsResponse } from "~/types/category-listing"

export type CategoryListingFetchSource = "initial" | "sort" | "filters" | "pagination"

type UseCategoryProductsFetchOptions = {
    category: Ref<ProductCategoryDTO | null>
    isAllProductsPage: Readonly<Ref<boolean>>
    regionStoreId: Ref<string | null | undefined>
    selectedCountryCode: Ref<string | null | undefined>
    currentPage: Readonly<Ref<number>>
    totalCount: Ref<number>
    limit: number
    filters: CategoryListingFilterState
    facets: Ref<CategoryProductsFacets>
    priceRange: Ref<CategoryPriceRange>
    syncRouteToPage: (_page: number) => Promise<void>
}

export function useCategoryProductsFetch({
    category,
    isAllProductsPage,
    regionStoreId,
    selectedCountryCode,
    currentPage,
    totalCount,
    limit,
    filters,
    facets,
    priceRange,
    syncRouteToPage
}: UseCategoryProductsFetchOptions) {
    const products = ref<CategoryProductsResponse["products"]>([])
    const loadingRef = ref<boolean>(false)
    const errorRef = ref<string | null>(null)
    const sortLoading = ref<boolean>(false)
    const filterLoading = ref<boolean>(false)

    const gridIsInitialLoading = computed<boolean>(() => loadingRef.value && products.value.length === 0)

    function resetProductState(): void {
        products.value = []
        totalCount.value = 0
    }

    function buildProductQuery(page = currentPage.value) {
        return {
            category_id: isAllProductsPage.value ? undefined : category.value?.id,
            region_id: regionStoreId.value,
            country_code: selectedCountryCode.value,
            limit,
            offset: (page - 1) * limit,
            order: filters.sortOption.value,
            child_category_ids: filters.selectedChildCategoryIds.value.join(",") || undefined,
            collection_ids: filters.selectedCollectionIds.value.join(",") || undefined,
            type_ids: filters.selectedTypeIds.value.join(",") || undefined,
            tag_ids: filters.selectedTagIds.value.join(",") || undefined,
            in_stock_only: filters.inStockOnly.value ? "true" : undefined,
            min_price: filters.selectedMinPrice.value ?? undefined,
            max_price: filters.selectedMaxPrice.value ?? undefined
        }
    }

    async function fetchProducts(source: CategoryListingFetchSource = "initial", page = currentPage.value): Promise<void> {
        if (!regionStoreId.value || (!isAllProductsPage.value && !category.value?.id)) {
            return
        }

        loadingRef.value = true
        errorRef.value = null
        sortLoading.value = source === "sort"
        filterLoading.value = source === "filters"

        try {
            const response = await $fetch<CategoryProductsResponse>("/api/products/category-products", {
                query: buildProductQuery(page)
            })

            const newProducts = Array.isArray(response?.products) ? response.products : []
            const nextTotalPages = Math.max(1, Math.ceil(response.count / limit))

            if (page > nextTotalPages) {
                await syncRouteToPage(nextTotalPages)
                await fetchProducts(source, nextTotalPages)
                return
            }

            products.value = newProducts
            totalCount.value = response.count
            facets.value = response.facets
            priceRange.value = response.priceRange ?? createEmptyPriceRange()
        } catch (error) {
            console.error("Error fetching category products", error)
            errorRef.value = "We could not load products right now. Please try again."
        } finally {
            loadingRef.value = false
            sortLoading.value = false
            filterLoading.value = false
        }
    }

    return {
        products,
        totalCount,
        loadingRef,
        errorRef,
        sortLoading,
        filterLoading,
        gridIsInitialLoading,
        resetProductState,
        fetchProducts
    }
}
