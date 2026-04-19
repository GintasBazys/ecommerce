<script setup lang="ts">
import type { ProductCategoryDTO, ProductDTO } from "@medusajs/types"
import type { ComponentPublicInstance } from "vue"
import type { LocationQuery, LocationQueryRaw, LocationQueryValue } from "vue-router"
import type { SchemaNode } from "~/composables/useStructuredData"

import { formatPrice } from "@/utils/formatPrice"
import CategoryFiltersPanel from "~/components/Category/CategoryFiltersPanel.vue"
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
const router = useRouter()
const disablePanelTransitions = ref(false)
const isMobileFilterDrawerOpen = ref(false)
const category = ref<ProductCategoryDTO | null>(null)
const products = ref<CategoryProduct[]>([])
const offset = ref(0)
const limit = 9
const totalCount = ref(0)
const loadingRef = ref(false)
const sortLoading = ref(false)
const filterLoading = ref(false)
const lastProductTrigger = ref<HTMLElement | null>(null)
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
const isSyncingQuery = ref(false)
const isApplyingQueryState = ref(false)
const pendingQueryPrice = ref<{ min?: number; max?: number } | null>(null)
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

const heroFallbackImage = computed(() => (isAllProductsPage.value ? "/images/hero-premium.jpg" : "/images/hero-main.jpg"))
const heroImage = computed(() => categoryThumbnail.value || heroFallbackImage.value)

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
const heroEyebrow = computed<string>(() => (isAllProductsPage.value ? "Store catalog" : "Category"))
const browsingNotes = computed<string[]>(() => [
    isAllProductsPage.value ? "Full catalog with live Medusa filters" : "Focused category view with live inventory and pricing",
    "Two products per row on mobile for faster scanning",
    activeFilterCount.value ? `${activeFilterCount.value} active filters applied` : "Sort and filters stay available in this pass"
])

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
let lastProductObserver: IntersectionObserver | null = null

function createPriceRange(min: number, max: number): PriceRange {
    return [min, max]
}

function parseQueryList(value: LocationQueryValue | LocationQueryValue[] | undefined): string[] {
    if (Array.isArray(value)) {
        return value.flatMap((item) => parseQueryList(item)).filter(Boolean)
    }

    if (typeof value !== "string") {
        return []
    }

    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
}

function parseQueryNumber(value: LocationQueryValue | LocationQueryValue[] | undefined): number | undefined {
    const source = Array.isArray(value) ? value[0] : value

    if (typeof source !== "string" || source.trim() === "") {
        return undefined
    }

    const parsed = Number(source)
    return Number.isFinite(parsed) ? parsed : undefined
}

function clampPriceValue(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}

function buildQueryState(): LocationQueryRaw {
    const query: LocationQueryRaw = {}

    if (sortOption.value !== sortOptions[0]!.value) {
        query.sort = sortOption.value
    }

    if (selectedChildCategoryIds.value.length) {
        query.subcategories = selectedChildCategoryIds.value.join(",")
    }

    if (selectedCollectionIds.value.length) {
        query.collections = selectedCollectionIds.value.join(",")
    }

    if (selectedTypeIds.value.length) {
        query.types = selectedTypeIds.value.join(",")
    }

    if (selectedTagIds.value.length) {
        query.tags = selectedTagIds.value.join(",")
    }

    if (inStockOnly.value) {
        query.stock = "1"
    }

    if (appliedPriceRange.value[0] > facets.value.price.min) {
        query.minPrice = String(appliedPriceRange.value[0])
    }

    if (appliedPriceRange.value[1] < facets.value.price.max) {
        query.maxPrice = String(appliedPriceRange.value[1])
    }

    return query
}

function applyQueryStateFromRoute(query: LocationQuery): void {
    isApplyingQueryState.value = true

    const parsedSort = Array.isArray(query.sort) ? query.sort[0] : query.sort
    const sortExists = sortOptions.some((option) => option.value === parsedSort)
    sortOption.value = sortExists && typeof parsedSort === "string" ? parsedSort : sortOptions[0]!.value

    selectedChildCategoryIds.value = parseQueryList(query.subcategories)
    selectedCollectionIds.value = parseQueryList(query.collections)
    selectedTypeIds.value = parseQueryList(query.types)
    selectedTagIds.value = parseQueryList(query.tags)
    inStockOnly.value = query.stock === "1"

    const queryMinPrice = parseQueryNumber(query.minPrice)
    const queryMaxPrice = parseQueryNumber(query.maxPrice)
    pendingQueryPrice.value = queryMinPrice !== undefined || queryMaxPrice !== undefined ? { min: queryMinPrice, max: queryMaxPrice } : null

    isApplyingQueryState.value = false
}

async function syncRouteQuery(): Promise<void> {
    isSyncingQuery.value = true

    try {
        await router.replace({ query: buildQueryState() })
    } finally {
        isSyncingQuery.value = false
    }
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
        const nextRange = createPriceRange(nextMin, nextMax)
        const queryPrice = pendingQueryPrice.value

        if (queryPrice) {
            const clampedMin = clampPriceValue(queryPrice.min ?? nextMin, nextMin, nextMax)
            const clampedMax = clampPriceValue(queryPrice.max ?? nextMax, clampedMin, nextMax)

            priceRange.value = createPriceRange(clampedMin, clampedMax)
            appliedPriceRange.value = createPriceRange(clampedMin, clampedMax)
            pendingQueryPrice.value = null
        } else {
            priceRange.value = nextRange
            appliedPriceRange.value = nextRange
        }

        initialPriceRangeApplied.value = true
    }
}

function buildProductQuery() {
    const initialMinPrice = !initialPriceRangeApplied.value ? pendingQueryPrice.value?.min : undefined
    const initialMaxPrice = !initialPriceRangeApplied.value ? pendingQueryPrice.value?.max : undefined

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
        min_price: initialMinPrice ?? (appliedPriceRange.value[0] > facets.value.price.min ? appliedPriceRange.value[0] : undefined),
        max_price: initialMaxPrice ?? (appliedPriceRange.value[1] < facets.value.price.max ? appliedPriceRange.value[1] : undefined)
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
    applyQueryStateFromRoute(route.query)

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

function setLastProductTrigger(element: Element | ComponentPublicInstance | null): void {
    lastProductTrigger.value = element instanceof HTMLElement ? element : null
}

async function loadMoreProducts(): Promise<void> {
    if (loadingRef.value || !hasMore.value) {
        return
    }

    offset.value += limit
    await fetchProducts("pagination")
}

watch(sortOption, async () => {
    if (isApplyingQueryState.value || isChangingCategoryPage.value) {
        return
    }

    offset.value = 0
    await syncRouteQuery()
    await fetchProducts("sort")
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
        if (isChangingCategoryPage.value || isApplyingQueryState.value) {
            return
        }

        offset.value = 0
        await syncRouteQuery()
        await fetchProducts("filters")
    }
)

watch(
    () => route.query,
    async (query, previousQuery) => {
        if (isSyncingQuery.value || JSON.stringify(query) === JSON.stringify(previousQuery)) {
            return
        }

        applyQueryStateFromRoute(query)
        offset.value = 0
        await fetchProducts("filters")
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

    lastProductObserver = new IntersectionObserver(
        (entries) => {
            const entry = entries[0]

            if (!entry?.isIntersecting) {
                return
            }

            void loadMoreProducts()
        },
        {
            rootMargin: "240px 0px"
        }
    )
})

watch(lastProductTrigger, (element, previousElement) => {
    if (!import.meta.client || !lastProductObserver) {
        return
    }

    if (previousElement) {
        lastProductObserver.unobserve(previousElement)
    }

    if (element) {
        lastProductObserver.observe(element)
    }
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

    if (lastProductObserver) {
        lastProductObserver.disconnect()
        lastProductObserver = null
    }
})

useStructuredData(() => [collectionSchema.value, breadcrumbSchema.value], "category-structured-data")
</script>

<template>
    <section
        class="bg-[radial-gradient(circle_at_top_left,rgba(1,12,128,0.07),transparent_24%),linear-gradient(180deg,#f7faff_0%,#ffffff_36%,#f6f9ff_100%)]"
    >
        <div class="px-0 pb-8 pt-15 sm:pt-18 xl:pt-23">
            <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
                <div class="grid items-end gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] xl:gap-10">
                    <div class="max-w-160 xl:pb-6">
                        <AppBreadcrumbs :items="breadcrumbItems" class="mb-4" />
                        <span
                            class="inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-amber-900"
                        >
                            {{ heroEyebrow }}
                        </span>
                        <h1
                            class="mt-4 text-[2.1rem] font-bold leading-none tracking-[-0.06rem] text-slate-950 sm:text-[2.9rem] sm:leading-[0.98] xl:max-w-[11ch] xl:text-[4.1rem] xl:leading-[0.96]"
                        >
                            {{ pageTitle }}
                        </h1>
                        <p class="mt-4 max-w-152 text-base leading-7 text-slate-600 sm:text-[1.05rem] sm:leading-8">
                            {{ pageDescription }}
                        </p>
                    </div>

                    <div
                        class="relative rounded-[1.75rem] border border-white/80 bg-white/90 p-3 shadow-[0_14px_34px_rgba(8,27,90,0.08)] sm:rounded-4xl sm:p-4"
                    >
                        <div class="relative overflow-hidden rounded-[1.4rem] sm:rounded-[1.75rem]">
                            <NuxtImg
                                :src="heroImage"
                                :alt="`${pageTitle} category image`"
                                width="1200"
                                height="1411"
                                sizes="100vw lg:45vw"
                                format="webp"
                                quality="68"
                                loading="lazy"
                                decoding="async"
                                class="block aspect-[1.08] w-full object-cover object-center"
                            />
                            <div
                                class="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.24),transparent_45%,rgba(255,255,255,0.08))]"
                            ></div>
                        </div>

                        <div
                            class="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 px-4 py-2 text-[0.78rem] font-semibold tracking-[0.08em] text-slate-950 shadow-[0_8px_20px_rgba(8,27,90,0.1)] sm:left-5 sm:top-5"
                        >
                            <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                            {{ isAllProductsPage ? "All products" : "Curated category view" }}
                        </div>

                        <div
                            class="absolute inset-x-3 bottom-3 rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.9),rgba(15,23,42,0.9))] p-4 text-white shadow-[0_10px_26px_rgba(2,6,23,0.18)] sm:inset-x-5 sm:bottom-5 sm:p-5"
                        >
                            <span class="text-[0.73rem] font-bold uppercase tracking-[0.14em] text-amber-200">Browse smarter</span>
                            <ul class="mt-4 grid gap-3">
                                <li
                                    v-for="note in browsingNotes"
                                    :key="note"
                                    class="flex items-start gap-3 text-sm leading-6 text-slate-100"
                                >
                                    <span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-300"></span>
                                    <span>{{ note }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

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
                            class="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
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
                                class="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[1.8rem] bg-white p-4 shadow-[0_-18px_40px_rgba(8,27,90,0.14)] will-change-transform sm:p-5"
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
                                    :disable-panel-transitions="disablePanelTransitions"
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

            <div class="grid gap-6 xl:grid-cols-[minmax(17rem,19rem)_minmax(0,1fr)] xl:gap-8">
                <aside class="hidden xl:grid xl:gap-4 xl:sticky xl:top-6 xl:self-start">
                    <CategoryFiltersPanel
                        v-model:selected-child-category-ids="selectedChildCategoryIds"
                        v-model:selected-collection-ids="selectedCollectionIds"
                        v-model:selected-type-ids="selectedTypeIds"
                        v-model:selected-tag-ids="selectedTagIds"
                        v-model:in-stock-only="inStockOnly"
                        v-model:price-range="priceRange"
                        :sidebar-title="sidebarTitle"
                        :active-filter-count="activeFilterCount"
                        :disable-panel-transitions="disablePanelTransitions"
                        :child-category-facets="childCategoryFacets"
                        :facets="facets"
                        :price-summary="priceSummary"
                        :price-step="priceStep"
                        @clear-all="clearAllFilters"
                        @reset-price-range="resetPriceRange"
                        @apply-price-range="applyPriceRange"
                    />
                </aside>

                <div class="min-w-0">
                    <div
                        class="mb-4 rounded-3xl border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] p-4 shadow-[0_14px_36px_rgba(8,27,90,0.06)] sm:p-5"
                    >
                        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div class="min-w-0">
                                <span class="block text-[1.05rem] font-bold text-slate-950">{{ totalCount }} products</span>
                                <p class="mt-1 text-sm leading-6 text-slate-600">
                                    <template v-if="sortLoading">Updating sort order...</template>
                                    <template v-else-if="filterLoading">Refreshing filtered results...</template>
                                    <template v-else-if="activeFilterCount">{{ activeFilterCount }} active filters</template>
                                    <template v-else
                                    >Medusa-backed filters for categories, collections, types, tags, stock, and price.</template
                                    >
                                </p>
                            </div>
                            <div class="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
                                <button
                                    type="button"
                                    class="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-[0_8px_20px_rgba(8,27,90,0.04)] xl:hidden"
                                    @click="isMobileFilterDrawerOpen = true"
                                >
                                    <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" stroke="currentColor" stroke-width="1.8">
                                        <path d="M3 5H17" stroke-linecap="round" />
                                        <path d="M6 10H14" stroke-linecap="round" />
                                        <path d="M8 15H12" stroke-linecap="round" />
                                    </svg>
                                    <span>{{ activeFilterCount ? `Filters (${activeFilterCount})` : "Filters" }}</span>
                                </button>
                                <label class="grid gap-1 text-sm font-semibold text-slate-700">
                                    <span>Sort by</span>
                                    <div class="relative w-full sm:min-w-60 lg:max-w-68">
                                        <select
                                            v-model="sortOption"
                                            class="min-h-11 w-full appearance-none rounded-2xl border border-slate-300 bg-white px-4 pr-10 text-sm font-medium text-slate-900 outline-hidden transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                            :disabled="loadingRef"
                                        >
                                            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                                                {{ option.text }}
                                            </option>
                                        </select>
                                        <span class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-500">
                                            <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" stroke="currentColor" stroke-width="1.8">
                                                <path d="M5 7.5L10 12.5L15 7.5" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div v-if="loadingRef" class="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div class="h-full w-1/3 animate-[category-progress_1.2s_ease-in-out_infinite] rounded-full bg-brand-700"></div>
                    </div>

                    <div v-if="gridIsInitialLoading" class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                        <div
                            v-for="n in 6"
                            :key="n"
                            class="overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white p-3 shadow-[0_8px_20px_rgba(8,27,90,0.04)]"
                        >
                            <div class="aspect-[0.82] w-full animate-pulse rounded-[0.9rem] bg-slate-200"></div>
                            <div class="mt-3 h-4 w-2/3 animate-pulse rounded bg-slate-200"></div>
                            <div class="mt-2 h-3 w-5/6 animate-pulse rounded bg-slate-200"></div>
                            <div class="mt-4 h-9 w-full animate-pulse rounded-full bg-slate-200"></div>
                        </div>
                    </div>

                    <div v-else-if="products.length" class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                        <div
                            v-for="(product, index) in products"
                            :key="product.id"
                            :ref="index === products.length - 1 ? setLastProductTrigger : undefined"
                            class="min-w-0"
                        >
                            <ProductCard :product="product" compact />
                        </div>
                    </div>

                    <div
                        v-else
                        class="grid justify-items-center gap-3 rounded-3xl border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] px-6 py-8 text-center shadow-[0_14px_36px_rgba(8,27,90,0.06)]"
                    >
                        <h2 class="text-[1.4rem] font-semibold leading-[1.15] text-slate-950">No products match these filters.</h2>
                        <p class="max-w-120 text-sm leading-6 text-slate-600">{{ emptyStateText }}</p>
                        <button
                            type="button"
                            class="inline-flex min-h-11 items-center justify-center rounded-full bg-[#cda45e] px-5 text-sm font-semibold text-slate-950 transition hover:bg-[#d8b57a]"
                            @click="clearAllFilters"
                        >
                            Reset filters
                        </button>
                    </div>

                    <div v-if="products.length" class="flex justify-center pt-6 text-sm text-slate-600">
                        <span
                            v-if="loadingRef && hasMore"
                            class="inline-flex h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700"
                        ></span>
                        <span v-else-if="!hasMore">{{ footerEndText }}</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
@keyframes category-progress {
    0% {
        transform: translateX(-120%);
    }

    100% {
        transform: translateX(420%);
    }
}
</style>
