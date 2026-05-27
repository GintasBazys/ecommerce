import { beforeEach, describe, expect, it, vi } from 'vitest'

import { assertCartOwnership, getSessionCartId, isPoisonedPaymentSessionError } from '../../../../server/utils/cart'

function createError(input: { statusCode: number; statusMessage: string; data?: unknown }) {
    return Object.assign(new Error(input.statusMessage), input)
}

describe('server cart utilities', () => {
    beforeEach(() => {
        vi.stubGlobal('createError', createError)
    })

    it('reads the current cart id from supported session cookies', () => {
        vi.stubGlobal('parseCookies', () => ({ cart_id: 'cart_current' }))

        expect(getSessionCartId({} as never)).toBe('cart_current')

        vi.stubGlobal('parseCookies', () => ({ cartId: 'cart_legacy' }))

        expect(getSessionCartId({} as never)).toBe('cart_legacy')
    })

    it('allows the matching session cart', () => {
        vi.stubGlobal('parseCookies', () => ({ cart_id: 'cart_123' }))

        expect(assertCartOwnership({} as never, 'cart_123')).toBe('cart_123')
    })

    it('rejects a missing request cart id', () => {
        vi.stubGlobal('parseCookies', () => ({ cart_id: 'cart_123' }))

        expect(() => assertCartOwnership({} as never, null)).toThrow('Cart ID is required.')
    })

    it('rejects a cart that does not match the session', () => {
        vi.stubGlobal('parseCookies', () => ({ cart_id: 'cart_123' }))

        expect(() => assertCartOwnership({} as never, 'cart_other')).toThrow('This cart is not available for this session.')
    })

    it('detects poisoned payment session messages without exposing them publicly', () => {
        expect(
            isPoisonedPaymentSessionError({
                statusMessage: 'Could not update this cart.',
                upstreamMessage: 'The payment session cannot be cleared',
            })
        ).toBe(true)
    })
})
