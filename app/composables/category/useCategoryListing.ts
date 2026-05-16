import type { ProductCategoryDTO } from "@medusajs/types"
import type { Ref } from "vue"
import type { LocationQuery, LocationQueryRaw, LocationQueryValue } from "vue-router"

import type {
    ActiveCategoryFilterChip,
    CategoryPriceRange,
    CategoryProductsFacets,
    CategoryProductsResponse,
    CategorySelectionGroup,
    CategorySortOption,
    FacetItem
} from "~/types/category-listing"
import { useCategoryListingPagination } from "~/composables/category/useCategoryListingPagination"
import { DEFAULT_CURENCY } from "~/utils/consts"
import { formatPrice } from "~/utils/formatPrice"

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
    { text: "Price: Low to high", value: "price_asc" },
    { text: "Price: High to low", value: "price_desc" },
    { text: "Title: A → Z", value: "title" },
    { text: "Title: Z → A", value: "-title" }
]

function createEmptyFacets(): CategoryProductsFacets {
    return {
        categories: [],
        collections: [],
        types: [],
        tags: []
    }
}

function createEmptyPriceRange(): CategoryPriceRange {
    return {
        min: null,
        max: null,
        currencyCode: null
    }
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

function parseQueryNumber(value: LocationQueryValue | LocationQueryValue[] | undefined): number | null {
    const rawValue = Array.isArray(value) ? value[0] : value

    if (typeof rawValue !== "string" || rawValue.trim() === "") {
        return null
    }

    const parsedValue = Number(rawValue)
    return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : null
}

export function useCategoryListing({ category, isAllProductsPage, regionStoreId, selectedCountryCode }: UseCategoryListingOptions) {
    const route = useRoute()
    const router = useRouter()

    const products = ref<CategoryProductsResponse["products"]>([])
    const totalCount = ref<number>(0)
    const loadingRef = ref<boolean>(false)
    const errorRef = ref<string | null>(null)
    const sortLoading = ref<boolean>(false)
    const filterLoading = ref<boolean>(false)
    const facets = ref<CategoryProductsFacets>(createEmptyFacets())
    const priceRange = ref<CategoryPriceRange>(createEmptyPriceRange())
    const limit = 12
    const sortOption = ref<string>(categorySortOptions[0]!.value)
    const selectedChildCategoryIds = ref<string[]>([])
    const selectedCollectionIds = ref<string[]>([])
    const selectedTypeIds = ref<string[]>([])
    const selectedTagIds = ref<string[]>([])
    const selectedMinPrice = ref<number | null>(null)
    const selectedMaxPrice = ref<number | null>(null)
    const inStockOnly = ref<boolean>(false)
    const isChangingCategoryPage = ref<boolean>(false)
    const isSyncingQuery = ref<boolean>(false)
    const isApplyingQueryState = ref<boolean>(false)

    const activeFilterCount = computed<number>(() => {
        let count = 0

        count += selectedChildCategoryIds.value.length
        count += selectedCollectionIds.value.length
        count += selectedTypeIds.value.length
        count += selectedTagIds.value.length

        if (inStockOnly.value) {
            count += 1
        }

        if (selectedMinPrice.value !== null || selectedMaxPrice.value !== null) {
            count += 1
        }

        return count
    })

    const directChildCategoryIds = computed<string[]>(() =>
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

    const currencyCode = computed<string>(() => priceRange.value.currencyCode?.toUpperCase() || DEFAULT_CURENCY)

    const activeFilterChips = computed<ActiveCategoryFilterChip[]>(() => {
        const chips: ActiveCategoryFilterChip[] = []

        chips.push(
            ...buildFacetChips(selectedChildCategoryIds.value, facets.value.categories, "child", "Category"),
            ...buildFacetChips(selectedTypeIds.value, facets.value.types, "type", "Type"),
            ...buildFacetChips(selectedCollectionIds.value, facets.value.collections, "collection", "Collection"),
            ...buildFacetChips(selectedTagIds.value, facets.value.tags, "tag", "Tag")
        )

        if (inStockOnly.value) {
            chips.push({ id: "stock", group: "stock", label: "In stock" })
        }

        const priceLabel = buildPriceChipLabel()

        if (priceLabel) {
            chips.push({ id: "price", group: "price", label: priceLabel })
        }

        return chips
    })

    const hasFacetedQuery = computed<boolean>(() => activeFilterCount.value > 0 || sortOption.value !== categorySortOptions[0]!.value)

    const gridIsInitialLoading = computed<boolean>(() => loadingRef.value && products.value.length === 0)

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

        if (selectedMinPrice.value !== null) {
            query.min_price = String(selectedMinPrice.value)
        }

        if (selectedMaxPrice.value !== null) {
            query.max_price = String(selectedMaxPrice.value)
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
            minPrice: parseQueryNumber(query.min_price),
            maxPrice: parseQueryNumber(query.max_price)
        })
    }

    const { currentPage, totalPages, offset, paginationLabel, paginationItems, buildPageLink } = useCategoryListingPagination({
        totalCount,
        limit,
        buildQueryState
    })

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
        selectedMinPrice.value = parseQueryNumber(query.min_price)
        selectedMaxPrice.value = parseQueryNumber(query.max_price)

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
        priceRange.value = createEmptyPriceRange()
        selectedChildCategoryIds.value = []
        selectedCollectionIds.value = []
        selectedTypeIds.value = []
        selectedTagIds.value = []
        selectedMinPrice.value = null
        selectedMaxPrice.value = null
        inStockOnly.value = false
    }

    function buildProductQuery(page = currentPage.value) {
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
            min_price: selectedMinPrice.value ?? undefined,
            max_price: selectedMaxPrice.value ?? undefined
        }
    }

    async function fetchProducts(source: FetchSource = "initial", page = currentPage.value) {
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

    function clearAllFilters() {
        selectedChildCategoryIds.value = []
        selectedCollectionIds.value = []
        selectedTypeIds.value = []
        selectedTagIds.value = []
        selectedMinPrice.value = null
        selectedMaxPrice.value = null
        inStockOnly.value = false
    }

    function buildFacetChips(
        selectedIds: string[],
        facetItems: FacetItem[],
        group: CategorySelectionGroup,
        fallbackLabel: string
    ): ActiveCategoryFilterChip[] {
        const labelsById = new Map(facetItems.map((item) => [item.id, item.label]))

        return selectedIds.map((id) => ({
            id: `${group}-${id}`,
            group,
            value: id,
            label: labelsById.get(id) || `Selected ${fallbackLabel.toLowerCase()}`
        }))
    }

    function buildPriceChipLabel(): string | null {
        if (selectedMinPrice.value === null && selectedMaxPrice.value === null) {
            return null
        }

        if (selectedMinPrice.value !== null && selectedMaxPrice.value !== null) {
            return `Price: ${formatPrice(selectedMinPrice.value, currencyCode.value)} - ${formatPrice(selectedMaxPrice.value, currencyCode.value)}`
        }

        if (selectedMinPrice.value !== null) {
            return `Price: from ${formatPrice(selectedMinPrice.value, currencyCode.value)}`
        }

        return `Price: up to ${formatPrice(selectedMaxPrice.value ?? 0, currencyCode.value)}`
    }

    function removeFilterChip(chip: ActiveCategoryFilterChip): void {
        if (chip.group === "price") {
            selectedMinPrice.value = null
            selectedMaxPrice.value = null
            return
        }

        if (chip.group === "stock") {
            inStockOnly.value = false
            return
        }

        if (!chip.value) {
            return
        }

        if (chip.group === "child") {
            selectedChildCategoryIds.value = selectedChildCategoryIds.value.filter((id) => id !== chip.value)
            return
        }

        if (chip.group === "collection") {
            selectedCollectionIds.value = selectedCollectionIds.value.filter((id) => id !== chip.value)
            return
        }

        if (chip.group === "type") {
            selectedTypeIds.value = selectedTypeIds.value.filter((id) => id !== chip.value)
            return
        }

        selectedTagIds.value = selectedTagIds.value.filter((id) => id !== chip.value)
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
                minPrice: selectedMinPrice.value,
                maxPrice: selectedMaxPrice.value,
                inStockOnly: inStockOnly.value
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
        errorRef,
        sortLoading,
        filterLoading,
        facets,
        priceRange,
        sortOption,
        sortOptions: categorySortOptions,
        selectedChildCategoryIds,
        selectedCollectionIds,
        selectedTypeIds,
        selectedTagIds,
        selectedMinPrice,
        selectedMaxPrice,
        inStockOnly,
        isChangingCategoryPage,
        isSyncingQuery,
        isApplyingQueryState,
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
    }
}
