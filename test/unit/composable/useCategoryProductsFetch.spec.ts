import type { ProductCategoryDTO } from '@medusajs/types'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'

import type { CategoryListingFilterState } from '../../../app/composables/category/useCategoryListingFilters'
import type { CategoryPriceRange, CategoryProductsFacets } from '../../../app/types/category-listing'

const regionStatus = ref<'idle' | 'loading' | 'ready' | 'error'>('error')
const currentLocale = ref<'en' | 'lt'>('en')
let fetchMock: ReturnType<typeof vi.fn>

function filters(): CategoryListingFilterState {
    return {
        sortOption: ref('-created_at'),
        selectedChildCategoryIds: ref([]),
        selectedCollectionIds: ref([]),
        selectedTypeIds: ref([]),
        selectedTagIds: ref([]),
        selectedMinPrice: ref(null),
        selectedMaxPrice: ref(null),
        inStockOnly: ref(false),
    }
}

describe('useCategoryProductsFetch regional guards', () => {
    beforeEach(() => {
        vi.resetModules()
        regionStatus.value = 'error'
        currentLocale.value = 'en'
        fetchMock = vi.fn()
        vi.stubGlobal('ref', ref)
        vi.stubGlobal('computed', computed)
        vi.stubGlobal('$fetch', fetchMock)
        vi.stubGlobal('useRegionStore', () => ({ status: regionStatus }))
        vi.stubGlobal('useLocaleStore', () => ({ currentLocale }))
        vi.stubGlobal('storeToRefs', (store: object) => store)
    })

    it('shows regional unavailability instead of requesting or rendering valid empty results', async () => {
        const { useCategoryProductsFetch } = await import('../../../app/composables/category/useCategoryProductsFetch')
        const state = useCategoryProductsFetch({
            category: ref({ id: 'pcat_123' } as ProductCategoryDTO),
            isAllProductsPage: computed(() => false),
            regionStoreId: ref(null),
            selectedCountryCode: ref(null),
            currentPage: computed(() => 1),
            totalCount: ref(0),
            limit: 12,
            filters: filters(),
            facets: ref<CategoryProductsFacets>({ categories: [], collections: [], types: [], tags: [] }),
            priceRange: ref<CategoryPriceRange>({ min: null, max: null, currencyCode: null }),
            syncRouteToPage: vi.fn(),
        })

        await state.fetchProducts()

        expect(fetchMock).not.toHaveBeenCalled()
        expect(state.regionUnavailable.value).toBe(true)
        expect(state.errorRef.value).toContain('We could not load delivery countries and regional prices')
    })
})
