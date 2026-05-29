<script setup lang="ts">
import CategoryFilterChips from "~/components/Category/CategoryFilterChips.vue"
import CategoryFiltersPanel from "~/components/Category/CategoryFiltersPanel.vue"
import CategoryPagination from "~/components/Category/CategoryPagination.vue"
import CategoryResultsGrid from "~/components/Category/CategoryResultsGrid.vue"
import CategoryToolbar from "~/components/Category/CategoryToolbar.vue"
import BaseButton from "~/components/Shared/BaseButton.vue"
import NotFoundPageContent from "~/components/Shared/NotFoundPageContent.vue"
import { useCategoryListing } from "~/composables/category/useCategoryListing"
import { useCategoryPageData } from "~/composables/category/useCategoryPageData"
import { useCategoryPageSeo } from "~/composables/category/useCategoryPageSeo"
import { useViewportDrawer } from "~/composables/shared/useViewportDrawer"

definePageMeta({ layout: "default" })

const route = useRoute()
const { regionStoreId, selectedCountryCode } = storeToRefs(useRegionStore())

const productsStartRef = useTemplateRef<HTMLElement>("productsStartRef")
const mobileFilterDrawerRef = useTemplateRef<HTMLElement>("mobileFilterDrawerRef")
const mobileFilterTitleId = "mobile-filter-title"
const mobileFilterDescriptionId = "mobile-filter-description"
const {
    category,
    notFoundPath,
    isAllProductsPage,
    heroImage,
    categoryPath,
    pageHeading,
    basePageDescription,
    sidebarTitle,
    emptyStateText,
    heroEyebrow,
    breadcrumbItems,
    loadCategoryPage
} = useCategoryPageData()
const {
    isOpen: isMobileFilterDrawerOpen,
    drawerStyle: mobileFilterDrawerStyle,
    openDrawer: openMobileFilters,
    closeDrawer: closeMobileFilters
} = useViewportDrawer(mobileFilterDrawerRef)

const {
    products,
    totalCount,
    loadingRef,
    errorRef,
    sortLoading,
    filterLoading,
    facets,
    priceRange,
    sortOption,
    sortOptions,
    selectedChildCategoryIds,
    selectedCollectionIds,
    selectedTypeIds,
    selectedTagIds,
    selectedMinPrice,
    selectedMaxPrice,
    inStockOnly,
    isChangingCategoryPage,
    currentPage,
    totalPages,
    offset,
    activeFilterCount,
    activeFilterChips,
    childCategoryFacets,
    hasFacetedQuery,
    gridIsInitialLoading,
    paginationLabel,
    paginationItems,
    buildPageLink,
    applyQueryStateFromRoute,
    resetCategoryPageState,
    fetchProducts,
    clearAllFilters,
    removeFilterChip
} = useCategoryListing({
    category,
    isAllProductsPage,
    regionStoreId,
    selectedCountryCode
})

await loadCategoryPage({ isChangingCategoryPage, resetCategoryPageState, applyQueryStateFromRoute, fetchProducts })

useCategoryPageSeo({
    notFoundPath,
    pageHeading,
    basePageDescription,
    categoryPath,
    hasFacetedQuery,
    currentPage,
    totalPages,
    totalCount,
    products,
    offset
})

watch(
    () => String(route.params.slug || ""),
    async (nextSlug, previousSlug) => {
        if (!nextSlug || nextSlug === previousSlug) {
            return
        }

        await loadCategoryPage({ isChangingCategoryPage, resetCategoryPageState, applyQueryStateFromRoute, fetchProducts })
    }
)

watch(currentPage, async (page, previousPage) => {
    if (!import.meta.client || !previousPage || page === previousPage) {
        return
    }

    await nextTick()
    productsStartRef.value?.scrollIntoView({ behavior: "smooth", block: "start" })
})

</script>

<template>
    <NotFoundPageContent v-if="notFoundPath" :requested-path="notFoundPath" />
    <section v-else class="from-brand-50 to-brand-50 bg-linear-to-b via-white">
        <NuxtIsland
            name="CategoryHero"
            :props="{
                breadcrumbItems,
                heroEyebrow,
                pageHeading,
                description: basePageDescription,
                heroImage,
                isAllProductsPage
            }"
        />

        <div class="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:pb-20">
            <Teleport to="body">
                <Transition
                    enter-active-class="transition duration-300 ease-out"
                    enter-from-class="opacity-0"
                    enter-to-class="opacity-100"
                    leave-active-class="transition duration-200 ease-in"
                    leave-from-class="opacity-100"
                    leave-to-class="opacity-0"
                >
                    <div v-if="isMobileFilterDrawerOpen" class="fixed inset-0 z-50 xl:hidden">
                        <BaseButton
                            type="button"
                            class="absolute inset-0 bg-slate-950/45 backdrop-blur-xs"
                            aria-label="Close filters"
                            @click="closeMobileFilters"
                        />
                        <Transition
                            enter-active-class="transition duration-300 ease-out"
                            enter-from-class="translate-y-full"
                            enter-to-class="translate-y-0"
                            leave-active-class="transition duration-200 ease-in"
                            leave-from-class="translate-y-0"
                            leave-to-class="translate-y-full"
                        >
                            <div
                                v-if="isMobileFilterDrawerOpen"
                                ref="mobileFilterDrawerRef"
                                class="mobile-filter-drawer rounded-t-panel absolute inset-x-0 bottom-0 overflow-y-auto overscroll-contain bg-white p-4 shadow-2xl will-change-transform sm:p-5"
                                :style="mobileFilterDrawerStyle"
                                role="dialog"
                                aria-modal="true"
                                :aria-labelledby="mobileFilterTitleId"
                                :aria-describedby="mobileFilterDescriptionId"
                                tabindex="-1"
                            >
                                <h2 :id="mobileFilterTitleId" class="sr-only">Filter products</h2>
                                <p :id="mobileFilterDescriptionId" class="sr-only">
                                    Refine the current product listing by category and availability.
                                </p>
                                <CategoryFiltersPanel
                                    v-model:selected-child-category-ids="selectedChildCategoryIds"
                                    v-model:selected-collection-ids="selectedCollectionIds"
                                    v-model:selected-type-ids="selectedTypeIds"
                                    v-model:selected-tag-ids="selectedTagIds"
                                    v-model:selected-min-price="selectedMinPrice"
                                    v-model:selected-max-price="selectedMaxPrice"
                                    v-model:in-stock-only="inStockOnly"
                                    :sidebar-title="sidebarTitle"
                                    :active-filter-count="activeFilterCount"
                                    :child-category-facets="childCategoryFacets"
                                    :facets="facets"
                                    :price-range="priceRange"
                                    :show-mobile-close="true"
                                    @clear-all="clearAllFilters"
                                    @close="closeMobileFilters"
                                />
                            </div>
                        </Transition>
                    </div>
                </Transition>
            </Teleport>

            <div class="grid gap-6 xl:flex xl:items-start xl:gap-8">
                <aside
                    class="xl:max-h-screen-sticky-header hidden xl:sticky xl:top-20 xl:grid xl:w-96 xl:shrink-0 xl:self-start xl:overflow-y-auto xl:pr-2 xl:pb-2"
                >
                    <CategoryFiltersPanel
                        v-model:selected-child-category-ids="selectedChildCategoryIds"
                        v-model:selected-collection-ids="selectedCollectionIds"
                        v-model:selected-type-ids="selectedTypeIds"
                        v-model:selected-tag-ids="selectedTagIds"
                        v-model:selected-min-price="selectedMinPrice"
                        v-model:selected-max-price="selectedMaxPrice"
                        v-model:in-stock-only="inStockOnly"
                        :sidebar-title="sidebarTitle"
                        :active-filter-count="activeFilterCount"
                        :child-category-facets="childCategoryFacets"
                        :facets="facets"
                        :price-range="priceRange"
                        @clear-all="clearAllFilters"
                    />
                </aside>

                <div ref="productsStartRef" class="min-w-0 xl:flex-1">
                    <CategoryToolbar
                        v-model:sort-option="sortOption"
                        :total-count="totalCount"
                        :sort-loading="sortLoading"
                        :filter-loading="filterLoading"
                        :loading="loadingRef"
                        :grid-is-initial-loading="gridIsInitialLoading"
                        :current-page="currentPage"
                        :active-filter-count="activeFilterCount"
                        :sort-options="sortOptions"
                        @open-filters="openMobileFilters"
                    />

                    <CategoryFilterChips
                        :chips="activeFilterChips"
                        :active-filter-count="activeFilterCount"
                        @remove="removeFilterChip"
                        @clear-all="clearAllFilters"
                    />

                    <CategoryResultsGrid
                        :loading="loadingRef"
                        :error-message="errorRef"
                        :grid-is-initial-loading="gridIsInitialLoading"
                        :products="products"
                        :empty-state-text="emptyStateText"
                        @retry="fetchProducts('initial')"
                        @clear-all="clearAllFilters"
                    />

                    <CategoryPagination
                        v-if="products.length"
                        :current-page="currentPage"
                        :total-pages="totalPages"
                        :pagination-items="paginationItems"
                        :pagination-label="paginationLabel"
                        :build-page-link="buildPageLink"
                    />
                </div>
            </div>
        </div>
    </section>
</template>
