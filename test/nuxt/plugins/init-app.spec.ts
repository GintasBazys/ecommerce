import { describe, expect, it } from 'vitest'
import { useNuxtApp } from '#app'

import { hasReadyRegionalContext } from '~/plugins/init-app'
import { useRegionStore } from '~/stores/region'
import { REGION_ERROR_MESSAGE } from '~/utils/region'

type SerializedRegionState = {
    status: string
    errorMessage: string | null
    regionStoreId: string | null
}

describe('init-app regional hydration', () => {
    it('preserves an SSR regional failure and blocks dependent initialization after hydration', () => {
        const nuxtApp = useNuxtApp()
        const regionStore = nuxtApp.runWithContext(() => useRegionStore())
        regionStore.status = 'error'
        regionStore.errorMessage = REGION_ERROR_MESSAGE

        try {
            const hydratedState = JSON.parse(JSON.stringify(regionStore.$state)) as SerializedRegionState

            expect(hydratedState).toMatchObject({
                status: 'error',
                errorMessage: REGION_ERROR_MESSAGE,
                regionStoreId: null,
            })
            expect(hasReadyRegionalContext(hydratedState)).toBe(false)
        } finally {
            regionStore.status = 'idle'
            regionStore.errorMessage = null
            regionStore.regionStoreId = null
            regionStore.selectedCountryCode = null
            regionStore.regions = []
        }
    })
})
