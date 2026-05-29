import type { ProductCategoryDTO } from "@medusajs/types"
import type { Ref } from "vue"

import { useCategoryListingFilters } from "~/composables/category/useCategoryListingFilters"
import { useCategoryListingPagination } from "~/composables/category/useCategoryListingPagination"
import { useCategoryListingQuery } from "~/composables/category/useCategoryListingQuery"
import { useCategoryProductsFetch } from "~/composables/category/useCategoryProductsFetch"

type UseCategoryListingOptions = {
    category: Ref<ProductCategoryDTO | null>
    isAllProductsPage: Readonly<Ref<boolean>>
    regionStoreId: Ref<string | null | undefined>
    selectedCountryCode: Ref<string | null | undefined>
}

export function useCategoryListing({ category, isAllProductsPage, regionStoreId, selectedCountryCode }: UseCategoryListingOptions) {
    const route = useRoute()
    const limit = 12
    const isChangingCategoryPage = ref<boolean>(false)
    const totalCount = ref<number>(0)

    const filters = useCategoryListingFilters({ category, isAllProductsPage })
    const queryState = useCategoryListingQuery({ filters })
    const pagination = useCategoryListingPagination({
        totalCount,
        limit,
        buildQueryState: queryState.buildQueryState
    })
    const fetchState = useCategoryProductsFetch({
        category,
        isAllProductsPage,
        regionStoreId,
        selectedCountryCode,
        currentPage: pagination.currentPage,
        totalCount,
        limit,
        filters,
        facets: filters.facets,
        priceRange: filters.priceRange,
        syncRouteToPage: queryState.syncRouteToPage
    })

    function resetCategoryPageState(): void {
        fetchState.resetProductState()
        filters.resetFacetState()
        filters.clearAllFilters()
    }

    watch(filters.sortOption, async () => {
        if (queryState.isApplyingQueryState.value || isChangingCategoryPage.value) {
            return
        }

        await queryState.syncRouteToPage(1)
        await fetchState.fetchProducts("sort")
    })

    watch(regionStoreId, async (value, previousValue) => {
        if (!value || value === previousValue || fetchState.products.value.length) {
            return
        }

        await fetchState.fetchProducts("initial")
    })

    watch(filters.selectedFiltersKey, async () => {
        if (isChangingCategoryPage.value || queryState.isApplyingQueryState.value) {
            return
        }

        await queryState.syncRouteToPage(1)
        await fetchState.fetchProducts("filters")
    })

    watch(
        () => route.query,
        async (query, previousQuery) => {
            if (queryState.isSyncingQuery.value || JSON.stringify(query) === JSON.stringify(previousQuery)) {
                return
            }

            const queryStateChanged = queryState.getQueryStateKey(query) !== queryState.getQueryStateKey(previousQuery)
            queryState.applyQueryStateFromRoute(query)

            if (queryStateChanged && pagination.currentPage.value > 1) {
                await queryState.syncRouteToPage(1)
                await fetchState.fetchProducts("filters")
                return
            }

            await fetchState.fetchProducts(queryStateChanged ? "filters" : "pagination")
        }
    )

    return {
        limit,
        products: fetchState.products,
        totalCount,
        loadingRef: fetchState.loadingRef,
        errorRef: fetchState.errorRef,
        sortLoading: fetchState.sortLoading,
        filterLoading: fetchState.filterLoading,
        facets: filters.facets,
        priceRange: filters.priceRange,
        sortOption: filters.sortOption,
        sortOptions: filters.sortOptions,
        selectedChildCategoryIds: filters.selectedChildCategoryIds,
        selectedCollectionIds: filters.selectedCollectionIds,
        selectedTypeIds: filters.selectedTypeIds,
        selectedTagIds: filters.selectedTagIds,
        selectedMinPrice: filters.selectedMinPrice,
        selectedMaxPrice: filters.selectedMaxPrice,
        inStockOnly: filters.inStockOnly,
        isChangingCategoryPage,
        isSyncingQuery: queryState.isSyncingQuery,
        isApplyingQueryState: queryState.isApplyingQueryState,
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        offset: pagination.offset,
        activeFilterCount: filters.activeFilterCount,
        activeFilterChips: filters.activeFilterChips,
        childCategoryFacets: filters.childCategoryFacets,
        hasFacetedQuery: filters.hasFacetedQuery,
        gridIsInitialLoading: fetchState.gridIsInitialLoading,
        paginationLabel: pagination.paginationLabel,
        paginationItems: pagination.paginationItems,
        buildPageLink: pagination.buildPageLink,
        applyQueryStateFromRoute: queryState.applyQueryStateFromRoute,
        resetCategoryPageState,
        fetchProducts: fetchState.fetchProducts,
        clearAllFilters: filters.clearAllFilters,
        removeFilterChip: filters.removeFilterChip
    }
}
