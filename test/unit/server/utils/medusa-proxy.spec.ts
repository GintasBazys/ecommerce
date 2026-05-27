import { beforeEach, describe, expect, it, vi } from 'vitest'

import { assertMedusaResponse, getSetCookieHeaders } from '../../../../server/utils/medusa-proxy'

function createError(input: { statusCode: number; statusMessage: string; data?: unknown }) {
    return Object.assign(new Error(input.statusMessage), input)
}

describe('medusa proxy utilities', () => {
    beforeEach(() => {
        vi.stubGlobal('createError', createError)
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('does not expose upstream error messages to callers', async () => {
        const response = new Response(JSON.stringify({ message: 'Internal Medusa stack detail' }), {
            status: 422,
            statusText: 'Unprocessable Entity',
            headers: { 'Content-Type': 'application/json' },
        })

        await expect(assertMedusaResponse(response, 'Could not update this cart.')).rejects.toMatchObject({
            statusCode: 422,
            statusMessage: 'Could not update this cart.',
            upstreamMessage: 'Internal Medusa stack detail',
        })

        await expect(assertMedusaResponse(new Response(JSON.stringify({ message: 'Hidden detail' }), { status: 500 }), 'Safe message')).rejects.not.toMatchObject({
            data: expect.objectContaining({ upstreamMessage: 'Hidden detail' }),
        })
    })

    it('passes through successful Medusa responses', async () => {
        const response = new Response(JSON.stringify({ ok: true }), { status: 200 })

        await expect(assertMedusaResponse(response, 'Should not fail')).resolves.toBe(response)
    })

    it('reads set-cookie headers from a response', () => {
        const response = new Response(null, {
            headers: {
                'set-cookie': 'cart_id=cart_123; Path=/',
            },
        })

        expect(getSetCookieHeaders(response)).toEqual(['cart_id=cart_123; Path=/'])
    })
})
