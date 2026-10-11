import { beforeEach, describe, expect, it, vi } from 'vitest'

const regionState: { status: string; regionStoreId: string | null } = {
    status: 'ready',
    regionStoreId: 'reg_eu/primary',
}

describe('createNewCart', () => {
    beforeEach(() => {
        vi.resetModules()
        regionState.status = 'ready'
        regionState.regionStoreId = 'reg_eu/primary'
        vi.stubGlobal('useRegionStore', () => regionState)
    })

    it('encodes a validated region identifier when creating a cart', async () => {
        const cart = { id: 'cart_123' }
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({ cart }),
        })
        const patch = vi.fn()
        vi.stubGlobal('fetch', fetchMock)
        const { createNewCart } = await import('../../../app/utils/createNewCart')

        await expect(createNewCart({ $patch: patch })).resolves.toEqual(cart)

        expect(fetchMock).toHaveBeenCalledWith('/api/cart/cart?region_id=reg_eu%2Fprimary&force_new=1', expect.any(Object))
    })

    it('does not clear or create a cart before regional context is ready', async () => {
        regionState.status = 'error'
        regionState.regionStoreId = ''
        const fetchMock = vi.fn()
        const patch = vi.fn()
        vi.stubGlobal('fetch', fetchMock)
        const { createNewCart } = await import('../../../app/utils/createNewCart')

        await expect(createNewCart({ $patch: patch })).resolves.toBeNull()

        expect(fetchMock).not.toHaveBeenCalled()
        expect(patch).not.toHaveBeenCalled()
    })
})
