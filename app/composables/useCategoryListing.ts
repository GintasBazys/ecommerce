import type { ProductCategoryDTO } from "@medusajs/types"
import type { Ref } from "vue"
import type { LocationQuery, LocationQueryRaw, LocationQueryValue } from "vue-router"

import { formatPrice } from "@/utils/formatPrice"
import type {
    CategoryProductsFacets,
    CategoryProductsResponse,
    CategorySortOption,
    FacetItem,
    PriceRange
} from "~/types/category-listing"

type FetchSource = "initial" | "sort" | "filters" | "pagination"

type UseCategoryListingOptions = {
    category: Ref<ProductCategoryDTO | null>
    isAllProductsPage: Ref<boolean>
    regionStoreId: Ref<string | null | undefined>
    selectedCountryCode: Ref<string | null | undefined>
}
export const categorySortOptions: CategorySortOption[] = [
    { text: "From latest", value: "-created_at" },
    { text: "From oldest", value: "created_at" },
    { text: "Price: low → high", value: "variants.calculated_price.calculated_amount" },
    { text: "Price: high → low", value: "-variants.calculated_price.calculated_amount" },
    { text: "Title: A → Z", value: "title" },
    { text: "Title: Z → A", value: "-title" }
]

function createPriceRange(min: number, max: number): PriceRange {
    return [min, max]
}

function createEmptyFacets(): CategoryProductsFacets {
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

function parsePage(value: LocationQueryValue | LocationQueryValue[] | undefined): number {
    const source = Array.isArray(value) ? value[0] : value

    if (typeof source !== "string" || source.trim() === "") {
        return 1
    }

    const parsed = Number.parseInt(source, 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
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

export function useCategoryListing({ category, isAllProductsPage, regionStoreId, selectedCountryCode }: UseCategoryListingOptions) {
    const route = useRoute()
    const router = useRouter()

    const products = ref<CategoryProductsResponse["products"]>([])
    const totalCount = ref(0)
    const loadingRef = ref(false)
    const sortLoading = ref(false)
    const filterLoading = ref(false)
    const facets = ref<CategoryProductsFacets>(createEmptyFacets())
    const limit = 10
    const sortOption = ref<string>(categorySortOptions[0]!.value)
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

    const currentPage = computed<number>(() => parsePage(route.query.page))
    const totalPages = computed<number>(() => Math.max(1, Math.ceil(totalCount.value / limit)))
    const offset = computed<number>(() => (currentPage.value - 1) * limit)

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

    const childCategoryFacets = computed<FacetItem[]>(() =>
        facets.value.categories.filter((item) => directChildCategoryIds.value.includes(item.id))
    )

    const hasFacetedQuery = computed<boolean>(() => activeFilterCount.value > 0 || sortOption.value !== categorySortOptions[0]!.value)

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
    const paginationLabel = computed<string>(() => `Page ${currentPage.value} of ${totalPages.value}`)
    const paginationItems = computed<(number | string)[]>(() => {
        if (totalPages.value <= 7) {
            return Array.from({ length: totalPages.value }, (_, index) => index + 1)
        }

        const pages = new Set<number>([1, totalPages.value, currentPage.value])

        if (currentPage.value > 1) {
            pages.add(currentPage.value - 1)
        }

        if (currentPage.value < totalPages.value) {
            pages.add(currentPage.value + 1)
        }

        const sortedPages = [...pages].sort((left, right) => left - right)
        const items: (number | string)[] = []

        for (const page of sortedPages) {
            const previousPage = items.at(-1)

            if (typeof previousPage === "number" && page - previousPage > 1) {
                items.push(`ellipsis-${previousPage}-${page}`)
            }

            items.push(page)
        }

        return items
    })

    function buildQueryState(page = currentPage.value): LocationQueryRaw {
        const query: LocationQueryRaw = {}

        if (page > 1) {
            query.page = String(page)
        }

        if (sortOption.value !== categorySortOptions[0]!.value) {
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

    function getQueryStateKey(query: LocationQuery): string {
        return JSON.stringify({
            sort: Array.isArray(query.sort) ? query.sort[0] : query.sort,
            subcategories: parseQueryList(query.subcategories),
            collections: parseQueryList(query.collections),
            types: parseQueryList(query.types),
            tags: parseQueryList(query.tags),
            stock: query.stock === "1",
            minPrice: parseQueryNumber(query.minPrice),
            maxPrice: parseQueryNumber(query.maxPrice)
        })
    }

    function buildPageLink(page: number): { query: LocationQueryRaw } {
        return {
            query: buildQueryState(page)
        }
    }

    function applyQueryStateFromRoute(query: LocationQuery): void {
        isApplyingQueryState.value = true

        const parsedSort = Array.isArray(query.sort) ? query.sort[0] : query.sort
        const sortExists = categorySortOptions.some((option) => option.value === parsedSort)
        sortOption.value = sortExists && typeof parsedSort === "string" ? parsedSort : categorySortOptions[0]!.value

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

    async function syncRouteToPage(page: number): Promise<void> {
        isSyncingQuery.value = true

        try {
            await router.replace({ query: buildQueryState(page) })
        } finally {
            isSyncingQuery.value = false
        }
    }

    function resetCategoryPageState() {
        products.value = []
        totalCount.value = 0
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

    function buildProductQuery(page = currentPage.value) {
        const initialMinPrice = !initialPriceRangeApplied.value ? pendingQueryPrice.value?.min : undefined
        const initialMaxPrice = !initialPriceRangeApplied.value ? pendingQueryPrice.value?.max : undefined

        return {
            category_id: isAllProductsPage.value ? undefined : category.value?.id,
            region_id: regionStoreId.value,
            country_code: selectedCountryCode.value,
            limit,
            offset: (page - 1) * limit,
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

    async function fetchProducts(source: FetchSource = "initial", page = currentPage.value) {
        if (!regionStoreId.value || (!isAllProductsPage.value && !category.value?.id)) {
            return
        }

        loadingRef.value = true
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

    watch(sortOption, async () => {
        if (isApplyingQueryState.value || isChangingCategoryPage.value) {
            return
        }

        await syncRouteToPage(1)
        await fetchProducts("sort")
    })

    watch(regionStoreId, async (value, previousValue) => {
        if (!value || value === previousValue || products.value.length) {
            return
        }

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

            await syncRouteToPage(1)
            await fetchProducts("filters")
        }
    )

    watch(
        () => route.query,
        async (query, previousQuery) => {
            if (isSyncingQuery.value || JSON.stringify(query) === JSON.stringify(previousQuery)) {
                return
            }

            const queryStateChanged = getQueryStateKey(query) !== getQueryStateKey(previousQuery)
            applyQueryStateFromRoute(query)

            if (queryStateChanged && currentPage.value > 1) {
                await syncRouteToPage(1)
                await fetchProducts("filters")
                return
            }

            await fetchProducts(queryStateChanged ? "filters" : "pagination")
        }
    )

    return {
        limit,
        products,
        totalCount,
        loadingRef,
        sortLoading,
        filterLoading,
        facets,
        sortOption,
        sortOptions: categorySortOptions,
        selectedChildCategoryIds,
        selectedCollectionIds,
        selectedTypeIds,
        selectedTagIds,
        inStockOnly,
        priceRange,
        appliedPriceRange,
        isChangingCategoryPage,
        isSyncingQuery,
        isApplyingQueryState,
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
    }
}
