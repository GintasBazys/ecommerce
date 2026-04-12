<script setup lang="ts">
import type { ProductCategoryDTO, ProductDTO } from "@medusajs/types"
import type { SchemaNode } from "~/composables/useStructuredData"

import { formatPrice } from "@/utils/formatPrice"
import { ALL_PRODUCTS_URL_HANDLE, CATEGORY_HANDLE, PRODUCT_URL_HANDLE } from "~/utils/consts"

definePageMeta({ layout: "default" })

type CategoryImage = {
    type?: string
    url?: string
}

type FacetItem = {
    id: string
    label: string
    count: number
}

type PriceRange = [number, number]

type CategoryProduct = ProductDTO & {
    collection?: { id: string; title?: string } | null
    type?: { id: string; value?: string } | null
    tags?: { id: string; value?: string }[]
    categories?: { id: string; name?: string; parent_category_id?: string | null }[]
}

type CategoryProductsResponse = {
    products: CategoryProduct[]
    count: number
    facets: {
        categories: FacetItem[]
        collections: FacetItem[]
        types: FacetItem[]
        tags: FacetItem[]
        price: {
            min: number
            max: number
            currencyCode: string | null
        }
    }
}

const ALL_PRODUCTS_SLUG = "all-products"
const ALL_PRODUCTS_DESCRIPTION =
    "Browse the full product catalog with the same filters, sorting, and endless discovery flow as every other category page."

const { regionStoreId, selectedCountryCode } = storeToRefs(useRegionStore())
const { absoluteUrl } = useSiteIdentity()

const route = useRoute()
const disablePanelTransitions = ref(false)
const category = ref<ProductCategoryDTO | null>(null)
const products = ref<CategoryProduct[]>([])
const offset = ref(0)
const limit = 9
const totalCount = ref(0)
const loadingRef = ref(false)
const sortLoading = ref(false)
const filterLoading = ref(false)
const facets = ref<CategoryProductsResponse["facets"]>({
    categories: [],
    collections: [],
    types: [],
    tags: [],
    price: {
        min: 0,
        max: 0,
        currencyCode: null
    }
})

const sortOptions = [
    { text: "From latest", value: "-created_at" },
    { text: "From oldest", value: "created_at" },
    { text: "Price: low → high", value: "variants.calculated_price.calculated_amount" },
    { text: "Price: high → low", value: "-variants.calculated_price.calculated_amount" },
    { text: "Title: A → Z", value: "title" },
    { text: "Title: Z → A", value: "-title" }
]
const sortOption = ref<string>(sortOptions[0]!.value)

const selectedChildCategoryIds = ref<string[]>([])
const selectedCollectionIds = ref<string[]>([])
const selectedTypeIds = ref<string[]>([])
const selectedTagIds = ref<string[]>([])
const inStockOnly = ref(false)
const priceRange = ref<PriceRange>([0, 0])
const appliedPriceRange = ref<PriceRange>([0, 0])
const initialPriceRangeApplied = ref(false)
const isChangingCategoryPage = ref(false)
const isAllProductsPage = computed(() => String(route.params.slug || "") === ALL_PRODUCTS_SLUG)

const hasMore = computed(() => products.value.length < totalCount.value)
const activeFilterCount = computed(() => {
    let count = 0

    count += selectedChildCategoryIds.value.length
    count += selectedCollectionIds.value.length
    count += selectedTypeIds.value.length
    count += selectedTagIds.value.length

    if (inStockOnly.value) {
        count += 1
    }

    if (appliedPriceRange.value[0] > facets.value.price.min || appliedPriceRange.value[1] < facets.value.price.max) {
        count += 1
    }

    return count
})

const directChildCategoryIds = computed(() =>
    isAllProductsPage.value
        ? []
        : (
              ((category.value as ProductCategoryDTO & { category_children?: { id: string }[] })?.category_children ?? []) as {
                  id: string
              }[]
          ).map((item) => item.id)
)

const childCategoryFacets = computed(() => facets.value.categories.filter((item) => directChildCategoryIds.value.includes(item.id)))

const categoryThumbnail = computed(() => {
    if (isAllProductsPage.value) {
        return null
    }

    const images = ((category.value as ProductCategoryDTO & { product_category_image?: CategoryImage[] })?.product_category_image ??
        []) as CategoryImage[]
    return images.find((image) => image.type === "thumbnail")?.url || null
})

const categoryPath = computed<string>(() =>
    isAllProductsPage.value ? ALL_PRODUCTS_URL_HANDLE : `${CATEGORY_HANDLE}/${String(route.params.slug || "")}`
)
const pageTitle = computed<string>(() => (isAllProductsPage.value ? "All Products" : category.value?.name || "Category"))
const pageDescription = computed<string>(() => (isAllProductsPage.value ? ALL_PRODUCTS_DESCRIPTION : category.value?.description || ""))
const sidebarTitle = computed<string>(() => (isAllProductsPage.value ? "Refine every product" : "Refine this category"))
const emptyStateText = computed<string>(() =>
    isAllProductsPage.value
        ? "Try clearing some filters or adjusting the selected price range."
        : "Try clearing some filters or adjusting the selected price range."
)
const footerEndText = computed<string>(() =>
    isAllProductsPage.value ? "You have reached the end of all products." : "You have reached the end of this category."
)

const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: pageTitle.value }])

const collectionSchema = computed<SchemaNode | null>(() => {
    if (!pageTitle.value) {
        return null
    }

    return {
        "@type": "CollectionPage",
        "@id": `${absoluteUrl(categoryPath.value)}#collection`,
        name: pageTitle.value,
        description: pageDescription.value || undefined,
        url: absoluteUrl(categoryPath.value),
        mainEntity: products.value.length
            ? {
                  "@type": "ItemList",
                  numberOfItems: totalCount.value,
                  itemListElement: products.value.map((product, index) => ({
                      "@type": "ListItem",
                      position: index + 1,
                      url: absoluteUrl(product.handle ? `${PRODUCT_URL_HANDLE}/${product.handle}` : categoryPath.value),
                      name: product.title
                  }))
              }
            : undefined
    }
})

const breadcrumbSchema = computed<SchemaNode | null>(() =>
    createBreadcrumbSchema(
        [
            { name: "Home", path: "/" },
            { name: pageTitle.value, path: categoryPath.value }
        ],
        absoluteUrl
    )
)

const priceSummary = computed(() => {
    if (!facets.value.price.currencyCode) {
        return `${appliedPriceRange.value[0]} - ${appliedPriceRange.value[1]}`
    }

    return `${formatPrice(appliedPriceRange.value[0], facets.value.price.currencyCode)} - ${formatPrice(appliedPriceRange.value[1], facets.value.price.currencyCode)}`
})

const priceStep = computed(() => {
    const difference = Math.max(facets.value.price.max - facets.value.price.min, 1)

    if (difference > 50000) {
        return 1000
    }

    if (difference > 10000) {
        return 500
    }

    return 100
})

const gridIsInitialLoading = computed(() => loadingRef.value && products.value.length === 0)

function createPriceRange(min: number, max: number): PriceRange {
    return [min, max]
}

function createEmptyFacets(): CategoryProductsResponse["facets"] {
    return {
        categories: [],
        collections: [],
        types: [],
        tags: [],
        price: {
            min: 0,
            max: 0,
            currencyCode: null
        }
    }
}

function resetCategoryPageState() {
    category.value = null
    products.value = []
    totalCount.value = 0
    offset.value = 0
    facets.value = createEmptyFacets()
    selectedChildCategoryIds.value = []
    selectedCollectionIds.value = []
    selectedTypeIds.value = []
    selectedTagIds.value = []
    inStockOnly.value = false
    priceRange.value = createPriceRange(0, 0)
    appliedPriceRange.value = createPriceRange(0, 0)
    initialPriceRangeApplied.value = false
}

function syncPriceRange(force = false) {
    const nextMin = facets.value.price.min
    const nextMax = facets.value.price.max

    if (!initialPriceRangeApplied.value || force) {
        priceRange.value = createPriceRange(nextMin, nextMax)
        appliedPriceRange.value = createPriceRange(nextMin, nextMax)
        initialPriceRangeApplied.value = true
    }
}

function buildProductQuery() {
    return {
        category_id: isAllProductsPage.value ? undefined : category.value?.id,
        region_id: regionStoreId.value,
        country_code: selectedCountryCode.value,
        limit,
        offset: offset.value,
        order: sortOption.value,
        child_category_ids: selectedChildCategoryIds.value.join(",") || undefined,
        collection_ids: selectedCollectionIds.value.join(",") || undefined,
        type_ids: selectedTypeIds.value.join(",") || undefined,
        tag_ids: selectedTagIds.value.join(",") || undefined,
        in_stock_only: inStockOnly.value ? "true" : undefined,
        min_price: appliedPriceRange.value[0] > facets.value.price.min ? appliedPriceRange.value[0] : undefined,
        max_price: appliedPriceRange.value[1] < facets.value.price.max ? appliedPriceRange.value[1] : undefined
    }
}

async function fetchProducts(source: "initial" | "sort" | "filters" | "pagination" = "initial") {
    if (!regionStoreId.value || (!isAllProductsPage.value && !category.value?.id)) {
        return
    }

    loadingRef.value = true
    sortLoading.value = source === "sort"
    filterLoading.value = source === "filters"

    try {
        const response = await $fetch<CategoryProductsResponse>("/api/products/category-products", {
            query: buildProductQuery()
        })

        const newProducts = Array.isArray(response?.products) ? response.products : []

        if (offset.value === 0) {
            products.value = newProducts
        } else {
            products.value = [...products.value, ...newProducts]
        }

        totalCount.value = response.count
        facets.value = response.facets
        syncPriceRange(source === "initial")
    } catch (error) {
        console.error("Error fetching category products", error)
    } finally {
        loadingRef.value = false
        sortLoading.value = false
        filterLoading.value = false
    }
}

function scrollToResults() {
    if (import.meta.client) {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }
}

function clearAllFilters() {
    selectedChildCategoryIds.value = []
    selectedCollectionIds.value = []
    selectedTypeIds.value = []
    selectedTagIds.value = []
    inStockOnly.value = false
    priceRange.value = createPriceRange(facets.value.price.min, facets.value.price.max)
    appliedPriceRange.value = createPriceRange(facets.value.price.min, facets.value.price.max)
}

function resetPriceRange() {
    priceRange.value = createPriceRange(facets.value.price.min, facets.value.price.max)
    appliedPriceRange.value = createPriceRange(facets.value.price.min, facets.value.price.max)
}

async function applyPriceRange() {
    appliedPriceRange.value = createPriceRange(priceRange.value[0], priceRange.value[1])
}

async function loadCategoryPage() {
    isChangingCategoryPage.value = true
    resetCategoryPageState()

    if (!isAllProductsPage.value) {
        const { data } = await useFetch<ProductCategoryDTO | null>(() => `/api/categories/${String(route.params.slug || "")}`)

        if (!data.value) {
            isChangingCategoryPage.value = false
            await navigateTo("/page-not-found")
            return
        }

        category.value = data.value
    }

    try {
        await fetchProducts("initial")
    } finally {
        isChangingCategoryPage.value = false
    }
}

await loadCategoryPage()

useHead(() => ({ title: `${pageTitle.value} | Ecommerce` }))

const onIntersectLast = async (isIntersecting: boolean, entries: IntersectionObserverEntry[]) => {
    if (!isIntersecting || loadingRef.value || !hasMore.value) {
        return
    }

    const entry = entries?.[0]
    const target = entry?.target as HTMLElement | undefined
    if (!target || !target.classList.contains("js-last-item")) {
        return
    }

    offset.value += limit
    await fetchProducts("pagination")
}

watch(sortOption, async () => {
    offset.value = 0
    await fetchProducts("sort")
    scrollToResults()
})

watch(regionStoreId, async (value, previousValue) => {
    if (!value || value === previousValue || products.value.length) {
        return
    }

    offset.value = 0
    await fetchProducts("initial")
})

watch(
    () =>
        JSON.stringify({
            childCategories: selectedChildCategoryIds.value,
            collections: selectedCollectionIds.value,
            types: selectedTypeIds.value,
            tags: selectedTagIds.value,
            inStockOnly: inStockOnly.value,
            price: appliedPriceRange.value
        }),
    async () => {
        if (isChangingCategoryPage.value) {
            return
        }

        offset.value = 0
        await fetchProducts("filters")
        scrollToResults()
    }
)

watch(
    () => String(route.params.slug || ""),
    async (nextSlug, previousSlug) => {
        if (!nextSlug || nextSlug === previousSlug) {
            return
        }

        await loadCategoryPage()
    }
)

onMounted(() => {
    if (!import.meta.client) {
        return
    }

    const userAgent = window.navigator.userAgent || ""
    disablePanelTransitions.value = /Android/i.test(userAgent)
})

useStructuredData(() => [collectionSchema.value, breadcrumbSchema.value], "category-structured-data")
</script>

<template>
    <section class="category-page">
        <div
            class="category-page__hero"
            :style="
                categoryThumbnail
                    ? `background-image: linear-gradient(180deg, rgba(8, 24, 73, 0.6), rgba(8, 24, 73, 0.72)), url(${categoryThumbnail});`
                    : ''
            "
        >
            <VContainer class="category-page__hero-container">
                <AppBreadcrumbs :items="breadcrumbItems" tone="inverse" class="category-page__breadcrumbs" />
                <span class="category-page__eyebrow">{{ isAllProductsPage ? "Store Catalog" : "Category Edit" }}</span>
                <h1 class="category-page__title">{{ pageTitle }}</h1>
                <p class="category-page__description">{{ pageDescription }}</p>
            </VContainer>
        </div>
        <VContainer class="category-page__container">
            <div class="category-page__layout">
                <aside class="category-page__sidebar">
                    <div class="category-page__sidebar-card">
                        <div class="category-page__sidebar-header">
                            <div>
                                <span class="category-page__sidebar-eyebrow">Filters</span>
                                <h2 class="category-page__sidebar-title">{{ sidebarTitle }}</h2>
                            </div>
                            <VBtn v-if="activeFilterCount" variant="text" color="primary" class="text-none px-0" @click="clearAllFilters">
                                Clear all
                            </VBtn>
                        </div>

                        <VExpansionPanels
                            multiple
                            class="category-page__filter-panels"
                            :class="{ 'category-page__filter-panels--reduced-motion': disablePanelTransitions }"
                        >
                            <VExpansionPanel v-if="childCategoryFacets.length" elevation="0" rounded="xl">
                                <VExpansionPanelTitle>Subcategories</VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <div class="category-page__filter-list">
                                        <VCheckbox
                                            v-for="item in childCategoryFacets"
                                            :key="item.id"
                                            v-model="selectedChildCategoryIds"
                                            :label="`${item.label} (${item.count})`"
                                            :value="item.id"
                                            hide-details
                                            density="comfortable"
                                            color="primary"
                                        />
                                    </div>
                                </VExpansionPanelText>
                            </VExpansionPanel>
                            <VExpansionPanel v-if="facets.types.length" elevation="0" rounded="xl">
                                <VExpansionPanelTitle>Product types</VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <div class="category-page__filter-list">
                                        <VCheckbox
                                            v-for="item in facets.types"
                                            :key="item.id"
                                            v-model="selectedTypeIds"
                                            :label="`${item.label} (${item.count})`"
                                            :value="item.id"
                                            hide-details
                                            density="comfortable"
                                            color="primary"
                                        />
                                    </div>
                                </VExpansionPanelText>
                            </VExpansionPanel>
                            <VExpansionPanel v-if="facets.collections.length" elevation="0" rounded="xl">
                                <VExpansionPanelTitle>Collections</VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <div class="category-page__filter-list">
                                        <VCheckbox
                                            v-for="item in facets.collections"
                                            :key="item.id"
                                            v-model="selectedCollectionIds"
                                            :label="`${item.label} (${item.count})`"
                                            :value="item.id"
                                            hide-details
                                            density="comfortable"
                                            color="primary"
                                        />
                                    </div>
                                </VExpansionPanelText>
                            </VExpansionPanel>
                            <VExpansionPanel v-if="facets.tags.length" elevation="0" rounded="xl">
                                <VExpansionPanelTitle>Tags</VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <div class="category-page__filter-list">
                                        <VCheckbox
                                            v-for="item in facets.tags"
                                            :key="item.id"
                                            v-model="selectedTagIds"
                                            :label="`${item.label} (${item.count})`"
                                            :value="item.id"
                                            hide-details
                                            density="comfortable"
                                            color="primary"
                                        />
                                    </div>
                                </VExpansionPanelText>
                            </VExpansionPanel>
                            <VExpansionPanel elevation="0" rounded="xl">
                                <VExpansionPanelTitle>Availability</VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <VCheckbox
                                        v-model="inStockOnly"
                                        label="Only show products in stock"
                                        hide-details
                                        density="comfortable"
                                        color="primary"
                                    />
                                </VExpansionPanelText>
                            </VExpansionPanel>
                            <VExpansionPanel v-if="facets.price.max > facets.price.min" elevation="0" rounded="xl">
                                <VExpansionPanelTitle>Price</VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <div class="category-page__price-box">
                                        <div class="category-page__price-summary">{{ priceSummary }}</div>
                                        <VRangeSlider
                                            v-model="priceRange"
                                            :min="facets.price.min"
                                            :max="facets.price.max"
                                            :step="priceStep"
                                            color="primary"
                                            thumb-label="always"
                                            hide-details
                                        />
                                        <div class="category-page__price-actions">
                                            <VBtn variant="outlined" rounded="pill" class="text-none" @click="resetPriceRange">Reset</VBtn>
                                            <VBtn color="primary" rounded="pill" class="text-none" @click="applyPriceRange">Apply</VBtn>
                                        </div>
                                    </div>
                                </VExpansionPanelText>
                            </VExpansionPanel>
                        </VExpansionPanels>
                    </div>
                </aside>
                <div class="category-page__content">
                    <div class="category-page__toolbar">
                        <div class="category-page__toolbar-copy">
                            <span class="category-page__results">{{ totalCount }} products</span>
                            <p class="category-page__results-meta">
                                <template v-if="sortLoading">Updating sort order...</template>
                                <template v-else-if="filterLoading">Refreshing filtered results...</template>
                                <template v-else-if="activeFilterCount">{{ activeFilterCount }} active filters</template>
                                <template v-else>
                                    Medusa-backed filters for categories, collections, types, tags, stock, and price.
                                </template>
                            </p>
                        </div>
                        <VSelect
                            v-model="sortOption"
                            :items="sortOptions"
                            item-title="text"
                            item-value="value"
                            label="Sort by"
                            variant="outlined"
                            density="comfortable"
                            class="category-page__sort-select"
                            :loading="sortLoading"
                            :disabled="loadingRef"
                        />
                    </div>
                    <VProgressLinear v-if="loadingRef" indeterminate color="primary" class="category-page__progress" />
                    <div v-if="gridIsInitialLoading" class="category-page__grid category-page__grid--skeleton">
                        <VSkeletonLoader v-for="n in 6" :key="n" type="image, article, actions" class="category-page__skeleton" />
                    </div>
                    <div v-else-if="products.length" class="category-page__grid">
                        <div
                            v-for="(product, index) in products"
                            :key="product.id"
                            v-intersect="{
                                handler: onIntersectLast,
                                options: {}
                            }"
                            class="category-page__grid-item"
                            :class="{ 'js-last-item': index === products.length - 1 }"
                        >
                            <ProductCard :product="product" />
                        </div>
                    </div>
                    <div v-else class="category-page__empty-state">
                        <h2 class="category-page__empty-title">No products match these filters.</h2>
                        <p class="category-page__empty-text">{{ emptyStateText }}</p>
                        <VBtn color="primary" rounded="pill" class="text-none" @click="clearAllFilters">Reset filters</VBtn>
                    </div>
                    <div v-if="products.length" class="category-page__footer">
                        <VProgressCircular v-if="loadingRef && hasMore" indeterminate color="primary" />
                        <span v-else-if="!hasMore">{{ footerEndText }}</span>
                    </div>
                </div>
            </div>
        </VContainer>
    </section>
</template>

<style scoped lang="scss">
.category-page {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f7faff 0%, #ffffff 36%, #f6f9ff 100%);
}

.category-page__hero {
    background: linear-gradient(180deg, rgba(8, 24, 73, 0.74), rgba(8, 24, 73, 0.8)), linear-gradient(130deg, #102a77 0%, #08173f 100%);
    background-position: center;
    background-size: cover;
}

.category-page__hero-container {
    padding: 6.75rem 1rem;
    text-align: center;
}

.category-page__breadcrumbs {
    margin: 0 auto 1rem;
}

.category-page__eyebrow,
.category-page__sidebar-eyebrow {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: 0.45rem 0.9rem;
    margin-bottom: 1rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    color: #ffffff;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.category-page__sidebar-eyebrow {
    margin-bottom: 0.55rem;
    background: rgba(1, 12, 128, 0.07);
    color: #010c80;
}

.category-page__title {
    max-width: 13ch;
    margin: 0 auto 1rem;
    color: #ffffff;
    font-size: 4.45rem;
    line-height: 0.96;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.category-page__description {
    max-width: 44rem;
    margin: 0 auto;
    color: rgba(255, 255, 255, 0.88);
    font-size: 1rem;
    line-height: 1.8;
}

.category-page__container {
    padding-top: 2rem;
    padding-bottom: 6rem;
}

.category-page__layout {
    display: grid;
    grid-template-columns: minmax(16rem, 18rem) minmax(0, 1fr);
    gap: 1.5rem;
    align-items: start;
}

.category-page__sidebar {
    position: sticky;
    top: 1.5rem;
}

.category-page__sidebar-card,
.category-page__toolbar,
.category-page__empty-state {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.5rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.category-page__sidebar-card {
    padding: 1.15rem;
}

.category-page__sidebar-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.category-page__sidebar-title {
    color: #08173f;
    font-size: 1.3rem;
    line-height: 1.15;
}

.category-page__filter-panels {
    gap: 0.8rem;
    background: transparent;
}

.category-page__filter-panels :deep(.v-expansion-panel) {
    border: 1px solid rgba(8, 23, 63, 0.08);
    background: #ffffff;
    box-shadow: none;
}

.category-page__filter-panels--reduced-motion :deep(.v-expansion-panel-text__wrapper),
.category-page__filter-panels--reduced-motion :deep(.v-expansion-panel-title),
.category-page__filter-panels--reduced-motion :deep(.v-expansion-panel-title__icon) {
    transition: none !important;
}

.category-page__filter-panels--reduced-motion :deep(.v-expansion-panel-text__wrapper) {
    will-change: auto;
}

.category-page__filter-list {
    display: grid;
    gap: 0.35rem;
}

.category-page__price-box {
    display: grid;
    gap: 1rem;
}

.category-page__price-summary,
.category-page__results,
.category-page__sidebar-title,
.category-page__empty-title {
    color: #08173f;
}

.category-page__price-summary {
    font-weight: 700;
}

.category-page__price-actions {
    display: flex;
    gap: 0.75rem;
}

.category-page__content {
    min-width: 0;
}

.category-page__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.1rem;
    margin-bottom: 1rem;
}

.category-page__toolbar-copy {
    min-width: 0;
}

.category-page__results {
    display: block;
    font-size: 1.05rem;
    font-weight: 700;
}

.category-page__results-meta,
.category-page__empty-text {
    margin: 0.25rem 0 0;
    color: #5a6580;
    font-size: 0.95rem;
    line-height: 1.65;
}

.category-page__sort-select {
    flex: 0 0 17rem;
    max-width: 17rem;
}

.category-page__progress {
    margin-bottom: 1rem;
    border-radius: 999px;
}

.category-page__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
}

.category-page__grid-item {
    min-width: 0;
}

.category-page__grid--skeleton {
    align-items: stretch;
}

.category-page__skeleton {
    border-radius: 1.2rem;
}

.category-page__footer {
    display: flex;
    justify-content: center;
    padding-top: 1.5rem;
    color: #5a6580;
    font-size: 0.95rem;
}

.category-page__empty-state {
    display: grid;
    justify-items: center;
    gap: 0.75rem;
    padding: 2rem 1.5rem;
    text-align: center;
}

.category-page__empty-title {
    font-size: 1.4rem;
    line-height: 1.15;
}

.category-page :deep(.product-card) {
    box-shadow: 0 16px 44px rgba(8, 27, 90, 0.08);
}

@media screen and (max-width: 1280px) {
    .category-page__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media screen and (max-width: 1100px) {
    .category-page__hero-container {
        padding: 5rem 1rem;
    }

    .category-page__title {
        font-size: 3.5rem;
    }

    .category-page__container {
        padding-bottom: 4.5rem;
    }

    .category-page__layout {
        grid-template-columns: 1fr;
    }

    .category-page__sidebar {
        position: static;
    }

    .category-page__sidebar-card,
    .category-page__toolbar,
    .category-page__empty-state {
        backdrop-filter: none;
    }
}

@media screen and (max-width: 767px) {
    .category-page__hero-container {
        padding: 3.75rem 1rem;
    }

    .category-page__title {
        font-size: 2.9rem;
        line-height: 1;
    }

    .category-page__container {
        padding-bottom: 4rem;
    }

    .category-page__toolbar {
        flex-direction: column;
        align-items: stretch;
    }

    .category-page__sort-select {
        flex-basis: auto;
        max-width: 100%;
    }

    .category-page__grid {
        grid-template-columns: 1fr;
    }

    .category-page__price-actions {
        flex-direction: column;
    }
}
</style>
