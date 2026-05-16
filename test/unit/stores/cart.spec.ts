import type { CartDTO as MedusaCart } from '@medusajs/types'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSetupStore } from '../../utils/stores'

type CartStore = ReturnType<typeof import('../../../app/stores/cart').useCartStore>

const regionState = {
    regionStoreId: 'reg_123',
}

let fetchMock: ReturnType<typeof vi.fn>
let $fetchMock: ReturnType<typeof vi.fn>

function cart(overrides: Partial<MedusaCart> = {}): MedusaCart {
    return {
        id: 'cart_123',
        items: [],
        ...overrides,
    } as MedusaCart
}

function lineItem(id: string, variantId: string, quantity: number) {
    return {
        id,
        variant_id: variantId,
        quantity,
    }
}

function variant(overrides: Partial<Parameters<CartStore['updateLineItem']>[0]> = {}): Parameters<CartStore['updateLineItem']>[0] {
    return {
        id: 'variant_123',
        title: 'Black / Medium',
        inventory_quantity: 10,
        calculated_price: {
            calculated_amount: 1999,
        },
        ...overrides,
    }
}

async function createCartStore(): Promise<CartStore> {
    return createSetupStore<CartStore>(() => import('../../../app/stores/cart'), 'useCartStore', {
        useRegionStore: () => regionState,
    })
}

describe('useCartStore', () => {
    beforeEach(() => {
        regionState.regionStoreId = 'reg_123'
        fetchMock = vi.fn()
        $fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)
        vi.stubGlobal('$fetch', $fetchMock)
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('loads cart for the selected region', async () => {
        const loadedCart = cart({ id: 'cart_loaded' })
        fetchMock.mockResolvedValueOnce({
            json: vi.fn().mockResolvedValueOnce({ cart: loadedCart }),
        })
        const store = await createCartStore()

        await store.loadCart()

        expect(fetchMock).toHaveBeenCalledWith('/api/cart/cart?region_id=reg_123', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        expect(store.cart.value).toEqual(loadedCart)
    })

    it('sums cart item quantities', async () => {
        const store = await createCartStore()

        expect(store.itemCount.value).toBe(0)

        store.cart.value = cart({
            items: [lineItem('item_1', 'variant_1', 2), lineItem('item_2', 'variant_2', 3)] as MedusaCart['items'],
        })

        expect(store.itemCount.value).toBe(5)
    })

    it('rejects line item updates when cart is not ready', async () => {
        const store = await createCartStore()

        expect(store.updateLineItem(variant())).rejects.toThrow('Cart is not ready yet. Please try again.')
        expect($fetchMock).not.toHaveBeenCalled()
    })

    it('rejects unavailable or out-of-stock variants', async () => {
        const store = await createCartStore()
        store.cart.value = cart()

        expect(store.updateLineItem(variant({ id: null }))).rejects.toThrow('This product option is unavailable.')
        expect(store.updateLineItem(variant({ inventory_quantity: 0 }))).rejects.toThrow('This product option is currently out of stock.')
        expect($fetchMock).not.toHaveBeenCalled()
    })

    it('adds new line items and opens the cart drawer', async () => {
        const updatedCart = cart({ id: 'cart_updated' })
        $fetchMock.mockResolvedValueOnce({ success: true, cart: updatedCart })
        const store = await createCartStore()
        store.cart.value = cart({ id: 'cart_123', items: [] })
        store.recoveryMessage.value = 'Cart was recovered'

        await store.updateLineItem(variant(), 2)

        expect($fetchMock).toHaveBeenCalledWith('/api/cart/line-items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                cartId: 'cart_123',
                variant_id: 'variant_123',
                quantity: 2,
            },
        })
        expect(store.cart.value).toEqual(updatedCart)
        expect(store.recoveryMessage.value).toBeNull()
        expect(store.openCartDrawer.value).toBe(true)
    })

    it('updates existing line items without opening the drawer for quantity edits', async () => {
        const updatedCart = cart({ id: 'cart_updated' })
        $fetchMock.mockResolvedValueOnce({ success: true, cart: updatedCart })
        const store = await createCartStore()
        store.cart.value = cart({
            id: 'cart_123',
            items: [lineItem('item_123', 'variant_123', 3)] as MedusaCart['items'],
        })

        await store.updateLineItem(variant(), 5, true)

        expect($fetchMock).toHaveBeenCalledWith('/api/cart/line-items/cart_123/item_123', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                variant_id: 'variant_123',
                quantity: 5,
            },
        })
        expect(store.cart.value).toEqual(updatedCart)
        expect(store.openCartDrawer.value).toBe(false)
    })

    it('adds quantity to existing line items during add-to-cart flows', async () => {
        $fetchMock.mockResolvedValueOnce({ success: true, cart: cart() })
        const store = await createCartStore()
        store.cart.value = cart({
            id: 'cart_123',
            items: [lineItem('item_123', 'variant_123', 3)] as MedusaCart['items'],
        })

        await store.updateLineItem(variant(), 2)

        expect($fetchMock).toHaveBeenCalledWith(
            '/api/cart/line-items/cart_123/item_123',
            expect.objectContaining({
                body: {
                    variant_id: 'variant_123',
                    quantity: 5,
                },
            })
        )
        expect(store.openCartDrawer.value).toBe(true)
    })

    it('ignores temporary line items when deciding whether to add or update', async () => {
        $fetchMock.mockResolvedValueOnce({ success: true, cart: cart() })
        const store = await createCartStore()
        store.cart.value = cart({
            id: 'cart_123',
            items: [lineItem('temp-123', 'variant_123', 1)] as MedusaCart['items'],
        })

        await store.updateLineItem(variant(), 1)

        expect($fetchMock).toHaveBeenCalledWith('/api/cart/line-items', expect.any(Object))
    })

    it('throws API response errors when line item mutation fails', async () => {
        $fetchMock.mockResolvedValueOnce({ success: false, error: 'Selected quantity is unavailable' })
        const store = await createCartStore()
        store.cart.value = cart()

        expect(store.updateLineItem(variant())).rejects.toThrow('Selected quantity is unavailable')
    })

    it('removes line items and stores recovery messages', async () => {
        const recoveredCart = cart({ id: 'cart_recovered' })
        $fetchMock.mockResolvedValueOnce({
            success: true,
            recovered: true,
            recoveryMessage: 'Some unavailable items were removed.',
            cart: recoveredCart,
        })
        const store = await createCartStore()
        store.cart.value = cart({ id: 'cart_123' })

        await store.removeLineItem('item_123')

        expect($fetchMock).toHaveBeenCalledWith('/api/cart/line-items/delete/cart_123/item_123', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        })
        expect(store.cart.value).toEqual(recoveredCart)
        expect(store.recoveryMessage.value).toBe('Some unavailable items were removed.')
    })

    it('uses parent cart from remove responses and clears stale recovery messages', async () => {
        const parentCart = cart({ id: 'cart_parent' })
        $fetchMock.mockResolvedValueOnce({
            success: true,
            recovered: false,
            cart: {
                ...cart({ id: 'cart_child' }),
                parent: parentCart,
            },
        })
        const store = await createCartStore()
        store.cart.value = cart({ id: 'cart_123' })
        store.recoveryMessage.value = 'Previous recovery message'

        await store.removeLineItem('item_123')

        expect(store.cart.value).toEqual(parentCart)
        expect(store.recoveryMessage.value).toBeNull()
    })

    it('does not call delete endpoint when cart has no id', async () => {
        const store = await createCartStore()

        await store.removeLineItem('item_123')

        expect($fetchMock).not.toHaveBeenCalled()
    })

    it('keeps remove failures non-blocking', async () => {
        const store = await createCartStore()
        const existingCart = cart({ id: 'cart_123' })
        store.cart.value = existingCart
        $fetchMock.mockRejectedValueOnce(new Error('Network failed'))

        await expect(store.removeLineItem('item_123')).resolves.toBeUndefined()

        expect(store.cart.value).toEqual(existingCart)
    })

    it('marks the cart as updating while queued mutations are running', async () => {
        let resolveFirstRequest: (value: { success: boolean, cart: MedusaCart }) => void = () => {}
        $fetchMock.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolveFirstRequest = resolve
                })
        )
        $fetchMock.mockResolvedValueOnce({ success: true, cart: cart({ id: 'cart_second' }) })

        const store = await createCartStore()
        store.cart.value = cart({ id: 'cart_123' })

        const firstMutation = store.updateLineItem(variant({ id: 'variant_first' }))
        const secondMutation = store.updateLineItem(variant({ id: 'variant_second' }))

        await vi.waitFor(() => expect(store.isUpdatingCart.value).toBe(true))
        expect($fetchMock).toHaveBeenCalledTimes(1)

        resolveFirstRequest({ success: true, cart: cart({ id: 'cart_first' }) })
        await firstMutation
        await vi.waitFor(() => expect($fetchMock).toHaveBeenCalledTimes(2))

        await secondMutation

        expect(store.isUpdatingCart.value).toBe(false)
        expect(store.cart.value?.id).toBe('cart_second')
    })
})
