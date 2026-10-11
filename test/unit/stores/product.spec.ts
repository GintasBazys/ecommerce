import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import type { Ref } from 'vue'

import { createSetupStore } from '../../utils/stores'

type ProductStore = ReturnType<typeof import('../../../app/stores/product').useProductStore>

const regionState = {
    status: 'ready',
}

let fetchMock: ReturnType<typeof vi.fn>

async function createProductStore(): Promise<ProductStore> {
    return createSetupStore<ProductStore>(() => import('../../../app/stores/product'), 'useProductStore', {
        useLocaleStore: () => ({ currentLocale: ref('en') }),
        useRegionStore: () => regionState,
        storeToRefs: (store: { currentLocale: Ref<string> }) => store,
    })
}

describe('useProductStore regional guards', () => {
    beforeEach(() => {
        regionState.status = 'ready'
        fetchMock = vi.fn()
        vi.stubGlobal('$fetch', fetchMock)
        vi.stubGlobal('computed', computed)
    })

    it('does not request products before regional context is ready', async () => {
        regionState.status = 'error'
        const store = await createProductStore()

        await store.fetchData('reg_123', 'lt')
        await store.fetchBestSellers('reg_123', 'lt')

        expect(fetchMock).not.toHaveBeenCalled()
    })

    it('requires both validated region and country values', async () => {
        const store = await createProductStore()

        await store.fetchData('reg_123')
        await store.fetchBestSellers(undefined, 'lt')

        expect(fetchMock).not.toHaveBeenCalled()
    })
})
