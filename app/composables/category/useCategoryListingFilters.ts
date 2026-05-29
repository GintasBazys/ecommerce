import type { ProductCategoryDTO } from "@medusajs/types"
import type { Ref } from "vue"

import type {
    ActiveCategoryFilterChip,
    CategoryPriceRange,
    CategoryProductsFacets,
    CategorySelectionGroup,
    CategorySortOption,
    FacetItem
} from "~/types/category-listing"
import { DEFAULT_CURENCY } from "~/utils/consts"
import { formatPrice } from "~/utils/formatPrice"

type UseCategoryListingFiltersOptions = {
    category: Ref<ProductCategoryDTO | null>
    isAllProductsPage: Readonly<Ref<boolean>>
}

export type CategoryListingFilterState = {
    sortOption: Ref<string>
    selectedChildCategoryIds: Ref<string[]>
    selectedCollectionIds: Ref<string[]>
    selectedTypeIds: Ref<string[]>
    selectedTagIds: Ref<string[]>
    selectedMinPrice: Ref<number | null>
    selectedMaxPrice: Ref<number | null>
    inStockOnly: Ref<boolean>
}

export const categorySortOptions: CategorySortOption[] = [
    { text: "From latest", value: "-created_at" },
    { text: "From oldest", value: "created_at" },
    { text: "Price: Low to high", value: "price_asc" },
    { text: "Price: High to low", value: "price_desc" },
    { text: "Title: A → Z", value: "title" },
    { text: "Title: Z → A", value: "-title" }
]

export function createEmptyFacets(): CategoryProductsFacets {
    return {
        categories: [],
        collections: [],
        types: [],
        tags: []
    }
}

export function createEmptyPriceRange(): CategoryPriceRange {
    return {
        min: null,
        max: null,
        currencyCode: null
    }
}

export function useCategoryListingFilters({ category, isAllProductsPage }: UseCategoryListingFiltersOptions) {
    const facets = ref<CategoryProductsFacets>(createEmptyFacets())
    const priceRange = ref<CategoryPriceRange>(createEmptyPriceRange())
    const sortOption = ref<string>(categorySortOptions[0]!.value)
    const selectedChildCategoryIds = ref<string[]>([])
    const selectedCollectionIds = ref<string[]>([])
    const selectedTypeIds = ref<string[]>([])
    const selectedTagIds = ref<string[]>([])
    const selectedMinPrice = ref<number | null>(null)
    const selectedMaxPrice = ref<number | null>(null)
    const inStockOnly = ref<boolean>(false)

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

    const selectedFiltersKey = computed<string>(() =>
        JSON.stringify({
            childCategories: selectedChildCategoryIds.value,
            collections: selectedCollectionIds.value,
            types: selectedTypeIds.value,
            tags: selectedTagIds.value,
            minPrice: selectedMinPrice.value,
            maxPrice: selectedMaxPrice.value,
            inStockOnly: inStockOnly.value
        })
    )

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

    function resetFacetState(): void {
        facets.value = createEmptyFacets()
        priceRange.value = createEmptyPriceRange()
    }

    function clearAllFilters(): void {
        selectedChildCategoryIds.value = []
        selectedCollectionIds.value = []
        selectedTypeIds.value = []
        selectedTagIds.value = []
        selectedMinPrice.value = null
        selectedMaxPrice.value = null
        inStockOnly.value = false
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

    return {
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
        activeFilterCount,
        activeFilterChips,
        childCategoryFacets,
        hasFacetedQuery,
        selectedFiltersKey,
        resetFacetState,
        clearAllFilters,
        removeFilterChip
    }
}
