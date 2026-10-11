import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { hasReadyRegionalContext } from '~/plugins/init-app'
import { useRegionStore } from '~/stores/region'

const mocks = vi.hoisted(() => ({
    requestFetch: vi.fn(),
}))

mockNuxtImport('useRequestFetch', () => () => mocks.requestFetch)

describe('regional recovery integration', () => {
    beforeEach(() => {
        mocks.requestFetch.mockReset()
    })

    it('preserves an initial failure and accepts one successful manual retry', async () => {
        const regionStore = useRegionStore()
        regionStore.status = 'idle'
        regionStore.errorMessage = null
        regionStore.regionStoreId = null
        regionStore.selectedCountryCode = null
        regionStore.regions = []
        mocks.requestFetch.mockRejectedValueOnce(new Error('upstream unavailable'))

        await expect(regionStore.fetchRegion()).resolves.toEqual({ success: false })

        const hydratedState = JSON.parse(JSON.stringify(regionStore.$state)) as typeof regionStore.$state
        expect(hydratedState.status).toBe('error')
        expect(hasReadyRegionalContext(hydratedState)).toBe(false)
        expect(mocks.requestFetch).toHaveBeenCalledTimes(1)

        mocks.requestFetch.mockResolvedValueOnce({
            regions: [{ id: 'reg_eu', countries: [{ iso_2: 'LT' }] }],
        })
        await expect(regionStore.fetchRegion()).resolves.toEqual({ success: true })

        expect(regionStore.status).toBe('ready')
        expect(hasReadyRegionalContext(regionStore)).toBe(true)
        expect(mocks.requestFetch).toHaveBeenCalledTimes(2)
    })
})
