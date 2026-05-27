import type { ProductDTO } from '@medusajs/types'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSetupStore } from '../../utils/stores'

type WishlistStore = ReturnType<typeof import('../../../app/stores/wishlist').useWishlistStore>

const customerState = {
    isAuthenticated: true,
}

const regionState = {
    regionStoreId: 'reg_123',
    selectedCountryCode: 'de',
}

let fetchMock: ReturnType<typeof vi.fn>

function product(id: string): ProductDTO {
    return {
        id,
        title: 'Test product',
    } as ProductDTO
}

async function createWishlistStore(): Promise<WishlistStore> {
    return createSetupStore<WishlistStore>(() => import('../../../app/stores/wishlist'), 'useWishlistStore', {
        useCustomerStore: () => customerState,
        useRegionStore: () => regionState,
    })
}

describe('useWishlistStore', () => {
    beforeEach(() => {
        customerState.isAuthenticated = true
        regionState.regionStoreId = 'reg_123'
        regionState.selectedCountryCode = 'de'
        fetchMock = vi.fn()
        vi.stubGlobal('$fetch', fetchMock)
    })

    it('loads authenticated wishlist with region pricing context', async () => {
        fetchMock.mockResolvedValueOnce({
            wishlist: {
                items: [
                    {
                        id: 'wish_1',
                        customer_id: 'cus_1',
                        product_id: 'prod_1',
                    },
                ],
            },
        })
        const store = await createWishlistStore()

        await store.loadWishlist()

        expect(fetchMock).toHaveBeenCalledWith('/api/wishlist?region_id=reg_123&country_code=de', { credentials: 'include' })
        expect(store.itemCount.value).toBe(1)
        expect(store.isProductSaved('prod_1')).toBe(true)
    })

    it('does not fetch wishlist when customer is unauthenticated', async () => {
        customerState.isAuthenticated = false
        const store = await createWishlistStore()

        await store.loadWishlist()

        expect(fetchMock).not.toHaveBeenCalled()
        expect(store.items.value).toEqual([])
    })

    it('clears wishlist and resets loading when loading fails', async () => {
        fetchMock.mockRejectedValueOnce(new Error('Network failed'))
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
        const store = await createWishlistStore()
        store.items.value = [
            {
                id: 'wish_stale',
                customer_id: 'cus_1',
                product_id: 'prod_stale',
            },
        ]

        await store.loadWishlist()

        expect(store.items.value).toEqual([])
        expect(store.loading.value).toBe(false)
        expect(consoleError).toHaveBeenCalledWith('Failed to load wishlist', {
            status: undefined,
            message: 'Network failed',
        })
    })

    it('silently clears wishlist when the session is unauthenticated', async () => {
        fetchMock.mockRejectedValueOnce({
            statusCode: 401,
            data: {
                statusMessage: 'Sign in to view your wishlist',
            },
        })
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
        const store = await createWishlistStore()
        store.items.value = [
            {
                id: 'wish_stale',
                customer_id: 'cus_1',
                product_id: 'prod_stale',
            },
        ]

        await store.loadWishlist()

        expect(store.items.value).toEqual([])
        expect(store.loading.value).toBe(false)
        expect(consoleError).not.toHaveBeenCalled()
    })

    it('adds products and prepends returned wishlist item', async () => {
        fetchMock.mockResolvedValueOnce({
            wishlist_item: {
                id: 'wish_1',
                customer_id: 'cus_1',
                product_id: 'prod_1',
            },
        })
        const store = await createWishlistStore()
        const nextProduct = product('prod_1')

        await store.addProduct(nextProduct)

        expect(fetchMock).toHaveBeenCalledWith('/api/wishlist', {
            method: 'POST',
            credentials: 'include',
            body: {
                product_id: 'prod_1',
            },
        })
        expect(store.items.value[0]).toMatchObject({ id: 'wish_1', product_id: 'prod_1', product: nextProduct })
    })

    it('does not add a product that is already saved', async () => {
        const store = await createWishlistStore()
        store.items.value = [
            {
                id: 'wish_1',
                customer_id: 'cus_1',
                product_id: 'prod_1',
            },
        ]

        await store.addProduct(product('prod_1'))

        expect(fetchMock).not.toHaveBeenCalled()
    })

    it('marks products as mutating while wishlist mutations are pending', async () => {
        let resolveAdd: (value: { wishlist_item: { id: string, product_id: string } }) => void = () => {}
        fetchMock.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolveAdd = resolve
                })
        )
        const store = await createWishlistStore()
        const nextProduct = product('prod_1')

        const addPromise = store.addProduct(nextProduct)

        await vi.waitFor(() => expect(store.isProductMutating('prod_1')).toBe(true))
        resolveAdd({ wishlist_item: { id: 'wish_1', product_id: 'prod_1' } })
        await addPromise

        expect(store.isProductMutating('prod_1')).toBe(false)
    })

    it('toggles an existing product by deleting its wishlist item', async () => {
        fetchMock.mockResolvedValueOnce({
            wishlist_item: {
                id: 'wish_1',
                product_id: 'prod_1',
            },
        })
        const store = await createWishlistStore()

        store.items.value = [
            {
                id: 'wish_1',
                customer_id: 'cus_1',
                product_id: 'prod_1',
            },
        ]

        await expect(store.toggleProduct(product('prod_1'))).resolves.toBe('removed')

        expect(fetchMock).toHaveBeenCalledWith('/api/wishlist/wish_1', {
            method: 'DELETE',
            credentials: 'include',
        })
        expect(store.items.value).toEqual([])
    })

    it('returns noop when product has no id', async () => {
        const store = await createWishlistStore()

        await expect(store.toggleProduct({ title: 'Missing id' } as ProductDTO)).resolves.toBe('noop')
    })

    it('clears wishlist items and mutation state', async () => {
        let resolveAdd: (value: { wishlist_item: { id: string, product_id: string } }) => void = () => {}
        const store = await createWishlistStore()
        store.items.value = [
            {
                id: 'wish_1',
                customer_id: 'cus_1',
                product_id: 'prod_1',
            },
        ]
        fetchMock.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolveAdd = resolve
                })
        )

        const addPromise = store.addProduct(product('prod_2'))
        await vi.waitFor(() => expect(store.isProductMutating('prod_2')).toBe(true))

        store.clearWishlist()

        expect(store.items.value).toEqual([])
        expect(store.isProductMutating('prod_2')).toBe(false)

        resolveAdd({ wishlist_item: { id: 'wish_2', product_id: 'prod_2' } })
        await addPromise
    })
})
