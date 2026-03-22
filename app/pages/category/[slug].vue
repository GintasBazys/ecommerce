<script setup lang="ts">
import type { ProductCategoryDTO, ProductDTO } from "@medusajs/types"

import { formatPrice } from "@/utils/formatPrice"

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

const { regionStoreId } = storeToRefs(useRegionStore())

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

const hasMore = computed(() => offset.value + limit < totalCount.value)
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
    (((category.value as ProductCategoryDTO & { category_children?: { id: string }[] })?.category_children ?? []) as { id: string }[]).map(
        (item) => item.id
    )
)

const childCategoryFacets = computed(() => facets.value.categories.filter((item) => directChildCategoryIds.value.includes(item.id)))

const categoryThumbnail = computed(() => {
    const images = ((category.value as ProductCategoryDTO & { product_category_image?: CategoryImage[] })?.product_category_image ??
        []) as CategoryImage[]
    return images.find((image) => image.type === "thumbnail")?.url || null
})

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
        category_id: category.value?.id,
        region_id: regionStoreId.value,
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
    if (!category.value?.id || !regionStoreId.value) {
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

const { data } = await useFetch<ProductCategoryDTO>(`/api/categories/${route.params.slug}`)
if (data.value && "error" in data.value) {
    await navigateTo("/page-not-found")
} else {
    category.value = data.value || null
    await fetchProducts("initial")
}

useHead({ title: `${category.value?.name} | Ecommerce` })

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
        offset.value = 0
        await fetchProducts("filters")
        scrollToResults()
    }
)

onMounted(() => {
    if (!import.meta.client) {
        return
    }

    const userAgent = window.navigator.userAgent || ""
    disablePanelTransitions.value = /Android/i.test(userAgent)
})
</script>

<template>
    <section class="categoryPage">
        <div
            class="categoryPage__hero"
            :style="
                categoryThumbnail
                    ? `background-image: linear-gradient(180deg, rgba(8, 24, 73, 0.6), rgba(8, 24, 73, 0.72)), url(${categoryThumbnail});`
                    : ''
            "
        >
            <VContainer class="categoryPage__heroContainer">
                <span class="categoryPage__eyebrow">Category Edit</span>
                <h1 class="categoryPage__title">{{ category?.name }}</h1>
                <p class="categoryPage__description">{{ category?.description }}</p>
            </VContainer>
        </div>
        <VContainer class="categoryPage__container">
            <div class="categoryPage__layout">
                <aside class="categoryPage__sidebar">
                    <div class="categoryPage__sidebarCard">
                        <div class="categoryPage__sidebarHeader">
                            <div>
                                <span class="categoryPage__sidebarEyebrow">Filters</span>
                                <h2 class="categoryPage__sidebarTitle">Refine this category</h2>
                            </div>
                            <VBtn v-if="activeFilterCount" variant="text" color="primary" class="text-none px-0" @click="clearAllFilters">
                                Clear all
                            </VBtn>
                        </div>

                        <VExpansionPanels
                            multiple
                            class="categoryPage__filterPanels"
                            :class="{ 'categoryPage__filterPanels--reducedMotion': disablePanelTransitions }"
                        >
                            <VExpansionPanel v-if="childCategoryFacets.length" elevation="0" rounded="xl">
                                <VExpansionPanelTitle>Subcategories</VExpansionPanelTitle>
                                <VExpansionPanelText>
                                    <div class="categoryPage__filterList">
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
                                    <div class="categoryPage__filterList">
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
                                    <div class="categoryPage__filterList">
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
                                    <div class="categoryPage__filterList">
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
                                    <div class="categoryPage__priceBox">
                                        <div class="categoryPage__priceSummary">{{ priceSummary }}</div>
                                        <VRangeSlider
                                            v-model="priceRange"
                                            :min="facets.price.min"
                                            :max="facets.price.max"
                                            :step="priceStep"
                                            color="primary"
                                            thumb-label="always"
                                            hide-details
                                        />
                                        <div class="categoryPage__priceActions">
                                            <VBtn variant="outlined" rounded="pill" class="text-none" @click="resetPriceRange">Reset</VBtn>
                                            <VBtn color="primary" rounded="pill" class="text-none" @click="applyPriceRange">Apply</VBtn>
                                        </div>
                                    </div>
                                </VExpansionPanelText>
                            </VExpansionPanel>
                        </VExpansionPanels>
                    </div>
                </aside>
                <div class="categoryPage__content">
                    <div class="categoryPage__toolbar">
                        <div class="categoryPage__toolbarCopy">
                            <span class="categoryPage__results">{{ totalCount }} products</span>
                            <p class="categoryPage__resultsMeta">
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
                            class="categoryPage__sortSelect"
                            :loading="sortLoading"
                            :disabled="loadingRef"
                        />
                    </div>
                    <VProgressLinear v-if="loadingRef" indeterminate color="primary" class="categoryPage__progress" />
                    <div v-if="gridIsInitialLoading" class="categoryPage__grid categoryPage__grid--skeleton">
                        <VSkeletonLoader v-for="n in 6" :key="n" type="image, article, actions" class="categoryPage__skeleton" />
                    </div>
                    <div v-else-if="products.length" class="categoryPage__grid">
                        <div
                            v-for="(product, index) in products"
                            :key="product.id"
                            v-intersect="{
                                handler: onIntersectLast,
                                options: {}
                            }"
                            class="categoryPage__gridItem"
                            :class="{ 'js-last-item': index === products.length - 1 }"
                        >
                            <ProductCard :product="product" />
                        </div>
                    </div>
                    <div v-else class="categoryPage__emptyState">
                        <h2 class="categoryPage__emptyTitle">No products match these filters.</h2>
                        <p class="categoryPage__emptyText">Try clearing some filters or adjusting the selected price range.</p>
                        <VBtn color="primary" rounded="pill" class="text-none" @click="clearAllFilters">Reset filters</VBtn>
                    </div>
                    <div v-if="products.length" class="categoryPage__footer">
                        <VProgressCircular v-if="loadingRef && hasMore" indeterminate color="primary" />
                        <span v-else-if="!hasMore">You have reached the end of this category.</span>
                    </div>
                </div>
            </div>
        </VContainer>
    </section>
</template>

<style scoped lang="scss">
.categoryPage {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f7faff 0%, #ffffff 36%, #f6f9ff 100%);
}

.categoryPage__hero {
    background: linear-gradient(180deg, rgba(8, 24, 73, 0.74), rgba(8, 24, 73, 0.8)), linear-gradient(130deg, #102a77 0%, #08173f 100%);
    background-position: center;
    background-size: cover;
}

.categoryPage__heroContainer {
    padding: clamp(4.5rem, 8vw, 6.75rem) 1rem;
    text-align: center;
}

.categoryPage__eyebrow,
.categoryPage__sidebarEyebrow {
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

.categoryPage__sidebarEyebrow {
    margin-bottom: 0.55rem;
    background: rgba(1, 12, 128, 0.07);
    color: #010c80;
}

.categoryPage__title {
    max-width: 13ch;
    margin: 0 auto 1rem;
    color: #ffffff;
    font-size: clamp(2.3rem, 4.6vw, 4.45rem);
    line-height: 0.96;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.categoryPage__description {
    max-width: 44rem;
    margin: 0 auto;
    color: rgba(255, 255, 255, 0.88);
    font-size: 1rem;
    line-height: 1.8;
}

.categoryPage__container {
    padding-top: 2rem;
    padding-bottom: clamp(4rem, 7vw, 6rem);
}

.categoryPage__layout {
    display: grid;
    grid-template-columns: minmax(16rem, 18rem) minmax(0, 1fr);
    gap: 1.5rem;
    align-items: start;
}

.categoryPage__sidebar {
    position: sticky;
    top: 1.5rem;
}

.categoryPage__sidebarCard,
.categoryPage__toolbar,
.categoryPage__emptyState {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.5rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.categoryPage__sidebarCard {
    padding: 1.15rem;
}

.categoryPage__sidebarHeader {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.categoryPage__sidebarTitle {
    color: #08173f;
    font-size: 1.3rem;
    line-height: 1.15;
}

.categoryPage__filterPanels {
    gap: 0.8rem;
    background: transparent;
}

.categoryPage__filterPanels :deep(.v-expansion-panel) {
    border: 1px solid rgba(8, 23, 63, 0.08);
    background: #ffffff;
    box-shadow: none;
}

.categoryPage__filterPanels--reducedMotion :deep(.v-expansion-panel-text__wrapper),
.categoryPage__filterPanels--reducedMotion :deep(.v-expansion-panel-title),
.categoryPage__filterPanels--reducedMotion :deep(.v-expansion-panel-title__icon) {
    transition: none !important;
}

.categoryPage__filterPanels--reducedMotion :deep(.v-expansion-panel-text__wrapper) {
    will-change: auto;
}

.categoryPage__filterList {
    display: grid;
    gap: 0.35rem;
}

.categoryPage__priceBox {
    display: grid;
    gap: 1rem;
}

.categoryPage__priceSummary,
.categoryPage__results,
.categoryPage__sidebarTitle,
.categoryPage__emptyTitle {
    color: #08173f;
}

.categoryPage__priceSummary {
    font-weight: 700;
}

.categoryPage__priceActions {
    display: flex;
    gap: 0.75rem;
}

.categoryPage__content {
    min-width: 0;
}

.categoryPage__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.1rem;
    margin-bottom: 1rem;
}

.categoryPage__toolbarCopy {
    min-width: 0;
}

.categoryPage__results {
    display: block;
    font-size: 1.05rem;
    font-weight: 700;
}

.categoryPage__resultsMeta,
.categoryPage__emptyText {
    margin: 0.25rem 0 0;
    color: #5a6580;
    font-size: 0.95rem;
    line-height: 1.65;
}

.categoryPage__sortSelect {
    flex: 0 0 17rem;
    max-width: 17rem;
}

.categoryPage__progress {
    margin-bottom: 1rem;
    border-radius: 999px;
}

.categoryPage__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
}

.categoryPage__gridItem {
    min-width: 0;
}

.categoryPage__grid--skeleton {
    align-items: stretch;
}

.categoryPage__skeleton {
    border-radius: 1.2rem;
}

.categoryPage__footer {
    display: flex;
    justify-content: center;
    padding-top: 1.5rem;
    color: #5a6580;
    font-size: 0.95rem;
}

.categoryPage__emptyState {
    display: grid;
    justify-items: center;
    gap: 0.75rem;
    padding: 2rem 1.5rem;
    text-align: center;
}

.categoryPage__emptyTitle {
    font-size: 1.4rem;
    line-height: 1.15;
}

.categoryPage :deep(.productCard) {
    box-shadow: 0 16px 44px rgba(8, 27, 90, 0.08);
}

@media screen and (max-width: 1280px) {
    .categoryPage__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media screen and (max-width: 1100px) {
    .categoryPage__layout {
        grid-template-columns: 1fr;
    }

    .categoryPage__sidebar {
        position: static;
    }

    .categoryPage__sidebarCard,
    .categoryPage__toolbar,
    .categoryPage__emptyState {
        backdrop-filter: none;
    }
}

@media screen and (max-width: 767px) {
    .categoryPage__heroContainer {
        padding: 3.75rem 1rem;
    }

    .categoryPage__title {
        font-size: clamp(2rem, 9vw, 2.9rem);
        line-height: 1;
    }

    .categoryPage__toolbar {
        flex-direction: column;
        align-items: stretch;
    }

    .categoryPage__sortSelect {
        flex-basis: auto;
        max-width: 100%;
    }

    .categoryPage__grid {
        grid-template-columns: 1fr;
    }

    .categoryPage__priceActions {
        flex-direction: column;
    }
}
</style>
