import type { LocationQuery, LocationQueryRaw, LocationQueryValue } from "vue-router"

import type { CategoryListingFilterState } from "~/composables/category/useCategoryListingFilters"
import { categorySortOptions } from "~/composables/category/useCategoryListingFilters"

type UseCategoryListingQueryOptions = {
    filters: CategoryListingFilterState
}

export function parseQueryList(value: LocationQueryValue | LocationQueryValue[] | undefined): string[] {
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

export function parseQueryNumber(value: LocationQueryValue | LocationQueryValue[] | undefined): number | null {
    const rawValue = Array.isArray(value) ? value[0] : value

    if (typeof rawValue !== "string" || rawValue.trim() === "") {
        return null
    }

    const parsedValue = Number(rawValue)
    return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : null
}

export function useCategoryListingQuery({ filters }: UseCategoryListingQueryOptions) {
    const router = useRouter()
    const isSyncingQuery = ref<boolean>(false)
    const isApplyingQueryState = ref<boolean>(false)

    function buildQueryState(page = 1): LocationQueryRaw {
        const query: LocationQueryRaw = {}

        if (page > 1) {
            query.page = String(page)
        }

        if (filters.sortOption.value !== categorySortOptions[0]!.value) {
            query.sort = filters.sortOption.value
        }

        if (filters.selectedChildCategoryIds.value.length) {
            query.subcategories = filters.selectedChildCategoryIds.value.join(",")
        }

        if (filters.selectedCollectionIds.value.length) {
            query.collections = filters.selectedCollectionIds.value.join(",")
        }

        if (filters.selectedTypeIds.value.length) {
            query.types = filters.selectedTypeIds.value.join(",")
        }

        if (filters.selectedTagIds.value.length) {
            query.tags = filters.selectedTagIds.value.join(",")
        }

        if (filters.inStockOnly.value) {
            query.stock = "1"
        }

        if (filters.selectedMinPrice.value !== null) {
            query.min_price = String(filters.selectedMinPrice.value)
        }

        if (filters.selectedMaxPrice.value !== null) {
            query.max_price = String(filters.selectedMaxPrice.value)
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

    function applyQueryStateFromRoute(query: LocationQuery): void {
        isApplyingQueryState.value = true

        const parsedSort = Array.isArray(query.sort) ? query.sort[0] : query.sort
        const sortExists = categorySortOptions.some((option) => option.value === parsedSort)
        filters.sortOption.value = sortExists && typeof parsedSort === "string" ? parsedSort : categorySortOptions[0]!.value

        filters.selectedChildCategoryIds.value = parseQueryList(query.subcategories)
        filters.selectedCollectionIds.value = parseQueryList(query.collections)
        filters.selectedTypeIds.value = parseQueryList(query.types)
        filters.selectedTagIds.value = parseQueryList(query.tags)
        filters.inStockOnly.value = query.stock === "1"
        filters.selectedMinPrice.value = parseQueryNumber(query.min_price)
        filters.selectedMaxPrice.value = parseQueryNumber(query.max_price)

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

    return {
        isSyncingQuery,
        isApplyingQueryState,
        buildQueryState,
        getQueryStateKey,
        applyQueryStateFromRoute,
        syncRouteToPage
    }
}
