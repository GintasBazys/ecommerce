import { beforeEach, describe, expect, it, vi } from 'vitest'

import { assertMedusaResponse, getMedusaUrl, getSetCookieHeaders, toUpstreamError } from '../../../../server/utils/medusa-proxy'

vi.mock('../../../../server/utils/locale', () => ({
    getRequestMedusaLocale: () => 'en-US',
}))

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

    it('maps upstream server errors to a safe gateway error', async () => {
        const response = new Response(JSON.stringify({ message: 'Database connection failed' }), { status: 503 })

        await expect(assertMedusaResponse(response, 'Regional pricing is temporarily unavailable')).rejects.toMatchObject({
            statusCode: 502,
            statusMessage: 'Regional pricing is temporarily unavailable',
        })
        expect(console.error).not.toHaveBeenCalled()
    })

    it('preserves intentional local H3 errors', () => {
        const localError = createError({ statusCode: 400, statusMessage: 'Invalid region_id' })

        expect(toUpstreamError(localError, 'Fallback')).toBe(localError)
    })

    it.each([
        [{ cause: { code: 'ECONNREFUSED' } }, 'network'],
        [{ code: 'ENOTFOUND' }, 'network'],
        [{ cause: { code: 'ECONNRESET' } }, 'network'],
        [{ code: 'ETIMEDOUT' }, 'timeout'],
        [{ name: 'AbortError' }, 'timeout'],
    ])('maps dependency failures to temporary unavailability', (sourceError, failureCategory) => {
        const error = toUpstreamError(sourceError, 'Fallback') as Error & { dependencyFailure?: string; statusCode?: number }

        expect(error).toMatchObject({ statusCode: 503, statusMessage: 'Medusa is unavailable' })
        expect(error.dependencyFailure).toBe(failureCategory)
        expect(Object.keys(error)).not.toContain('dependencyFailure')
    })

    it('uses generic copy when server configuration is missing', () => {
        vi.stubGlobal('useRuntimeConfig', () => ({ medusaUrl: '', public: { MEDUSA_URL: '' } }))

        expect(() => getMedusaUrl({} as never, '/store/regions')).toThrow('Internal server error')
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
