<script setup lang="ts">
import type { ProductCategoryDTO } from "@medusajs/types"
import type { SchemaNode } from "~/composables/useStructuredData"
import type { CategoryImage } from "~/types/category-listing"

import CategoryFiltersPanel from "~/components/Category/CategoryFiltersPanel.vue"
import CategoryHero from "~/components/Category/CategoryHero.vue"
import CategoryPagination from "~/components/Category/CategoryPagination.vue"
import CategoryResultsGrid from "~/components/Category/CategoryResultsGrid.vue"
import CategoryToolbar from "~/components/Category/CategoryToolbar.vue"
import NotFoundPageContent from "~/components/Shared/NotFoundPageContent.vue"
import { ALL_PRODUCTS_URL_HANDLE, CATEGORY_HANDLE, PRODUCT_URL_HANDLE } from "~/utils/consts"

definePageMeta({ layout: "default" })

const ALL_PRODUCTS_SLUG = "all-products"
const ALL_PRODUCTS_DESCRIPTION =
    "Browse the full product catalog with category filters, sorting, and clear paginated navigation across every listing page."

const route = useRoute()
const event = useRequestEvent()
const { regionStoreId, selectedCountryCode } = storeToRefs(useRegionStore())
const { absoluteUrl } = useSiteIdentity()

const isMobileFilterDrawerOpen = ref<boolean>(false)
const notFoundPath = ref<string | null>(null)
const productsStartRef = ref<HTMLElement | null>(null)
const category = ref<ProductCategoryDTO | null>(null)
const isAllProductsPage = computed<boolean>(() => String(route.params.slug || "") === ALL_PRODUCTS_SLUG)

const {
    products,
    totalCount,
    loadingRef,
    sortLoading,
    filterLoading,
    facets,
    sortOption,
    sortOptions,
    selectedChildCategoryIds,
    selectedCollectionIds,
    selectedTypeIds,
    selectedTagIds,
    inStockOnly,
    priceRange,
    isChangingCategoryPage,
    currentPage,
    totalPages,
    offset,
    activeFilterCount,
    childCategoryFacets,
    hasFacetedQuery,
    priceSummary,
    priceStep,
    gridIsInitialLoading,
    paginationLabel,
    paginationItems,
    buildPageLink,
    applyQueryStateFromRoute,
    resetCategoryPageState,
    fetchProducts,
    clearAllFilters,
    resetPriceRange,
    applyPriceRange
} = useCategoryListing({
    category,
    isAllProductsPage,
    regionStoreId,
    selectedCountryCode
})

const categoryThumbnail = computed(() => {
    if (isAllProductsPage.value) {
        return null
    }

    const images = ((category.value as ProductCategoryDTO & { product_category_image?: CategoryImage[] })?.product_category_image ??
        []) as CategoryImage[]
    return images.find((image) => image.type === "thumbnail")?.url || null
})

const heroFallbackImage = computed(() => (isAllProductsPage.value ? "/images/hero-premium.jpg" : "/images/hero-main.jpg"))
const heroImage = computed(() => categoryThumbnail.value || heroFallbackImage.value)
const categoryPath = computed<string>(() =>
    isAllProductsPage.value ? ALL_PRODUCTS_URL_HANDLE : `${CATEGORY_HANDLE}/${String(route.params.slug || "")}`
)
const pageHeading = computed<string>(() => (isAllProductsPage.value ? "All Products" : category.value?.name || "Category"))
const basePageDescription = computed<string>(() => (isAllProductsPage.value ? ALL_PRODUCTS_DESCRIPTION : category.value?.description || ""))
const sidebarTitle = computed<string>(() => (isAllProductsPage.value ? "Refine every product" : "Refine this category"))
const emptyStateText = computed<string>(() => "Try clearing some filters or adjusting the selected price range.")
const heroEyebrow = computed<string>(() => (isAllProductsPage.value ? "Store catalog" : "Category"))
const currentListingPath = computed<string>(() => {
    if (currentPage.value <= 1) {
        return categoryPath.value
    }

    return `${categoryPath.value}?page=${currentPage.value}`
})
const canonicalPath = computed<string>(() => (hasFacetedQuery.value ? categoryPath.value : currentListingPath.value))
const metaTitle = computed<string>(() => {
    if (currentPage.value <= 1) {
        return `${pageHeading.value} | Medusa Commerce`
    }

    return `${pageHeading.value} - Page ${currentPage.value} | Medusa Commerce`
})
const metaDescription = computed<string>(() => {
    const baseDescription = basePageDescription.value || `Browse products in ${pageHeading.value}.`

    if (currentPage.value <= 1) {
        return baseDescription
    }

    return `${baseDescription} Page ${currentPage.value} of ${totalPages.value}.`
})
const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: pageHeading.value }])

const collectionSchema = computed<SchemaNode | null>(() => {
    if (notFoundPath.value || !pageHeading.value) {
        return null
    }

    return {
        "@type": "CollectionPage",
        "@id": `${absoluteUrl(canonicalPath.value)}#collection`,
        name: pageHeading.value,
        description: metaDescription.value || undefined,
        url: absoluteUrl(canonicalPath.value),
        mainEntity: products.value.length
            ? {
                  "@type": "ItemList",
                  numberOfItems: totalCount.value,
                  itemListElement: products.value.map((product, index) => ({
                      "@type": "ListItem",
                      position: offset.value + index + 1,
                      url: absoluteUrl(product.handle ? `${PRODUCT_URL_HANDLE}/${product.handle}` : categoryPath.value),
                      name: product.title
                  }))
              }
            : undefined
    }
})

const breadcrumbSchema = computed<SchemaNode | null>(() =>
    notFoundPath.value
        ? null
        : createBreadcrumbSchema(
              [
                  { name: "Home", path: "/" },
                  { name: pageHeading.value, path: categoryPath.value }
              ],
              absoluteUrl
          )
)

function markNotFound() {
    notFoundPath.value = route.fullPath

    if (event) {
        setResponseStatus(event, 404)
    }
}

async function loadCategoryPage() {
    isChangingCategoryPage.value = true
    notFoundPath.value = null
    category.value = null
    resetCategoryPageState()
    applyQueryStateFromRoute(route.query)

    if (!isAllProductsPage.value) {
        try {
            category.value = await $fetch<ProductCategoryDTO | null>(`/api/categories/${String(route.params.slug || "")}`)
        } catch {
            category.value = null
        }

        if (!category.value) {
            markNotFound()
            isChangingCategoryPage.value = false
            return
        }
    }

    try {
        await fetchProducts("initial")
    } finally {
        isChangingCategoryPage.value = false
    }
}

await loadCategoryPage()

useHead(() => {
    if (notFoundPath.value) {
        return {
            title: "404 | Medusa Commerce",
            meta: [
                {
                    name: "description",
                    content: "The requested page could not be found. Continue browsing current products and active storefront pages."
                },
                { name: "robots", content: "noindex,follow" }
            ]
        }
    }

    const links: { rel: string; href: string }[] = [{ rel: "canonical", href: absoluteUrl(canonicalPath.value) }]

    if (!hasFacetedQuery.value && totalPages.value > 1) {
        if (currentPage.value > 1) {
            links.push({
                rel: "prev",
                href: absoluteUrl(currentPage.value - 1 === 1 ? categoryPath.value : `${categoryPath.value}?page=${currentPage.value - 1}`)
            })
        }

        if (currentPage.value < totalPages.value) {
            links.push({ rel: "next", href: absoluteUrl(`${categoryPath.value}?page=${currentPage.value + 1}`) })
        }
    }

    return {
        title: metaTitle.value,
        link: links,
        meta: [
            { name: "description", content: metaDescription.value },
            { name: "robots", content: hasFacetedQuery.value ? "noindex,follow" : "index,follow" }
        ]
    }
})

watch(
    () => String(route.params.slug || ""),
    async (nextSlug, previousSlug) => {
        if (!nextSlug || nextSlug === previousSlug) {
            return
        }

        await loadCategoryPage()
    }
)

watch(currentPage, async (page, previousPage) => {
    if (!import.meta.client || !previousPage || page === previousPage) {
        return
    }

    await nextTick()
    productsStartRef.value?.scrollIntoView({ behavior: "smooth", block: "start" })
})

watch(isMobileFilterDrawerOpen, (isOpen) => {
    if (!import.meta.client) {
        return
    }

    document.body.style.overflow = isOpen ? "hidden" : ""
})

onUnmounted(() => {
    if (!import.meta.client) {
        return
    }

    document.body.style.overflow = ""
})

useStructuredData(() => [collectionSchema.value, breadcrumbSchema.value], "category-structured-data")
</script>

<template>
    <NotFoundPageContent v-if="notFoundPath" :requested-path="notFoundPath" />
    <section v-else class="bg-linear-to-b from-brand-50 via-white to-brand-50">
        <CategoryHero
            :breadcrumb-items="breadcrumbItems"
            :hero-eyebrow="heroEyebrow"
            :page-heading="pageHeading"
            :description="basePageDescription"
            :hero-image="heroImage"
            :is-all-products-page="isAllProductsPage"
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
                        <button
                            type="button"
                            class="absolute inset-0 bg-slate-950/45 backdrop-blur-xs"
                            @click="isMobileFilterDrawerOpen = false"
                        ></button>
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
                                class="absolute inset-x-0 bottom-0 max-h-screen overflow-y-auto rounded-t-panel bg-white p-4 shadow-2xl will-change-transform sm:p-5"
                            >
                                <CategoryFiltersPanel
                                    v-model:selected-child-category-ids="selectedChildCategoryIds"
                                    v-model:selected-collection-ids="selectedCollectionIds"
                                    v-model:selected-type-ids="selectedTypeIds"
                                    v-model:selected-tag-ids="selectedTagIds"
                                    v-model:in-stock-only="inStockOnly"
                                    v-model:price-range="priceRange"
                                    :sidebar-title="sidebarTitle"
                                    :active-filter-count="activeFilterCount"
                                    :child-category-facets="childCategoryFacets"
                                    :facets="facets"
                                    :price-summary="priceSummary"
                                    :price-step="priceStep"
                                    :show-mobile-close="true"
                                    @clear-all="clearAllFilters"
                                    @reset-price-range="resetPriceRange"
                                    @apply-price-range="applyPriceRange"
                                    @close="isMobileFilterDrawerOpen = false"
                                />
                            </div>
                        </Transition>
                    </div>
                </Transition>
            </Teleport>

            <div class="grid gap-6 xl:flex xl:items-start xl:gap-8">
                <aside
                    class="hidden xl:sticky xl:top-20 xl:grid xl:max-h-screen-sticky-header xl:w-96 xl:shrink-0 xl:self-start xl:overflow-y-auto xl:pr-2 xl:pb-2"
                >
                    <CategoryFiltersPanel
                        v-model:selected-child-category-ids="selectedChildCategoryIds"
                        v-model:selected-collection-ids="selectedCollectionIds"
                        v-model:selected-type-ids="selectedTypeIds"
                        v-model:selected-tag-ids="selectedTagIds"
                        v-model:in-stock-only="inStockOnly"
                        v-model:price-range="priceRange"
                        :sidebar-title="sidebarTitle"
                        :active-filter-count="activeFilterCount"
                        :child-category-facets="childCategoryFacets"
                        :facets="facets"
                        :price-summary="priceSummary"
                        :price-step="priceStep"
                        @clear-all="clearAllFilters"
                        @reset-price-range="resetPriceRange"
                        @apply-price-range="applyPriceRange"
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
                        @open-filters="isMobileFilterDrawerOpen = true"
                    />

                    <CategoryResultsGrid
                        :loading="loadingRef"
                        :grid-is-initial-loading="gridIsInitialLoading"
                        :products="products"
                        :empty-state-text="emptyStateText"
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
