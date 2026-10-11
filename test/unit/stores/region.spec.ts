import type { RegionDTO } from '@medusajs/types'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { createSetupStore } from '../../utils/stores'

type RegionStore = ReturnType<typeof import('../../../app/stores/region').useRegionStore>

const cookies = {
    region_id: ref<string | null>(null),
    country_code: ref<string | null>(null),
}

let requestFetch: ReturnType<typeof vi.fn>

function region(id: string, countryCodes: string[]): RegionDTO {
    return {
        id,
        countries: countryCodes.map((iso_2) => ({ iso_2 })),
    } as RegionDTO
}

async function createRegionStore(): Promise<RegionStore> {
    return createSetupStore<RegionStore>(() => import('../../../app/stores/region'), 'useRegionStore', {
        useCookie: (name: keyof typeof cookies) => cookies[name],
        useRequestFetch: () => requestFetch,
    })
}

describe('useRegionStore', () => {
    beforeEach(() => {
        cookies.region_id.value = null
        cookies.country_code.value = null
        requestFetch = vi.fn()
    })

    it('treats cookie values as candidates while regional state is idle', async () => {
        cookies.region_id.value = 'reg_cookie'
        cookies.country_code.value = 'lt'

        const store = await createRegionStore()

        expect(store.status.value).toBe('idle')
        expect(store.regionStoreId.value).toBeNull()
        expect(store.selectedCountryCode.value).toBeNull()
        expect(store.errorMessage.value).toBeNull()
    })

    it('moves from loading to ready with validated and normalized state', async () => {
        let resolveRequest: (value: { regions: RegionDTO[] }) => void = () => {}
        requestFetch.mockImplementationOnce(
            () => new Promise((resolve) => {
                resolveRequest = resolve
            })
        )
        const store = await createRegionStore()

        const fetchPromise = store.fetchRegion()
        expect(store.status.value).toBe('loading')

        resolveRequest({ regions: [region('reg_eu', ['LT'])] })
        await expect(fetchPromise).resolves.toEqual({ success: true })

        expect(store.status.value).toBe('ready')
        expect(store.regions.value[0]?.countries?.[0]?.iso_2).toBe('lt')
        expect(store.regionStoreId.value).toBe('reg_eu')
        expect(store.selectedCountryCode.value).toBe('lt')
        expect(store.errorMessage.value).toBeNull()
    })

    it('replaces stale cookie candidates with a validated fallback', async () => {
        cookies.region_id.value = 'reg_stale'
        cookies.country_code.value = 'zz'
        requestFetch.mockResolvedValueOnce({ regions: [region('reg_eu', ['de', 'lt'])] })
        const store = await createRegionStore()

        await expect(store.fetchRegion()).resolves.toEqual({ success: true })

        expect(store.regionStoreId.value).toBe('reg_eu')
        expect(store.selectedCountryCode.value).toBe('de')
        expect(cookies.region_id.value).toBe('reg_eu')
        expect(cookies.country_code.value).toBe('de')
    })

    it('enters a customer-safe error state without logging an initial failure', async () => {
        requestFetch.mockRejectedValueOnce(new Error('upstream token and URL'))
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
        const store = await createRegionStore()

        await expect(store.fetchRegion()).resolves.toEqual({ success: false })

        expect(store.status.value).toBe('error')
        expect(store.errorMessage.value).toBe(
            'Regional pricing is temporarily unavailable. We could not load delivery countries and regional prices. Please try again.'
        )
        expect(store.regionStoreId.value).toBeNull()
        expect(consoleError).not.toHaveBeenCalled()
    })

    it('deduplicates concurrent requests', async () => {
        let resolveRequest: (value: { regions: RegionDTO[] }) => void = () => {}
        requestFetch.mockImplementationOnce(
            () => new Promise((resolve) => {
                resolveRequest = resolve
            })
        )
        const store = await createRegionStore()

        const firstRequest = store.fetchRegion()
        const secondRequest = store.fetchRegion()

        expect(secondRequest).toBe(firstRequest)
        expect(requestFetch).toHaveBeenCalledTimes(1)

        resolveRequest({ regions: [region('reg_eu', ['lt'])] })
        await Promise.all([firstRequest, secondRequest])
    })

    it('preserves validated state and exposes a safe message when refresh fails', async () => {
        requestFetch
            .mockResolvedValueOnce({ regions: [region('reg_eu', ['lt'])] })
            .mockRejectedValueOnce(new Error('refresh failed'))
        const store = await createRegionStore()

        await store.fetchRegion()
        const validatedRegions = store.regions.value

        await expect(store.fetchRegion()).resolves.toEqual({ success: false })

        expect(store.status.value).toBe('ready')
        expect(store.regions.value).toBe(validatedRegions)
        expect(store.regionStoreId.value).toBe('reg_eu')
        expect(store.selectedCountryCode.value).toBe('lt')
        expect(store.errorMessage.value).not.toBeNull()
    })

    it('does not partially commit an unusable response', async () => {
        requestFetch.mockResolvedValueOnce({ regions: [{ id: 'reg_invalid', countries: [] }] })
        const store = await createRegionStore()

        await expect(store.fetchRegion()).resolves.toEqual({ success: false })

        expect(store.status.value).toBe('error')
        expect(store.regions.value).toEqual([])
        expect(store.regionStoreId.value).toBeNull()
        expect(cookies.region_id.value).toBeNull()
    })
})
