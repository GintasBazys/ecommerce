import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../../server/utils/locale', () => ({
    getRequestMedusaLocale: () => 'en-US',
}))

function createError(input: { statusCode: number; statusMessage: string }) {
    return Object.assign(new Error(input.statusMessage), input)
}

type RegionsHandler = (event: unknown) => Promise<unknown>

describe('GET /api/regions', () => {
    let handler: RegionsHandler
    let setHeader: ReturnType<typeof vi.fn>
    let log: ReturnType<typeof vi.spyOn>

    beforeEach(async () => {
        setHeader = vi.fn()
        log = vi.spyOn(console, 'error').mockImplementation(() => {})
        vi.stubGlobal('createError', createError)
        vi.stubGlobal('defineEventHandler', (value: RegionsHandler) => value)
        vi.stubGlobal('setHeader', setHeader)
        vi.stubGlobal('useRuntimeConfig', () => ({
            medusaUrl: 'https://medusa.internal.example',
            public: { MEDUSA_URL: '', PUBLISHABLE_KEY: 'pk_secret_value' },
        }))
        vi.stubGlobal('getRequestURL', () => new URL('https://shop.example/api/regions'))
        vi.stubGlobal('getCookie', () => undefined)

        handler = (await import('../../../../server/api/regions')).default as RegionsHandler
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    function event() {
        return { node: { req: { headers: { cookie: 'customer_id=cus_secret' } } } }
    }

    it('sets no-store before fetching and returns normalized usable regions', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => {
            expect(setHeader).toHaveBeenCalledWith(expect.anything(), 'Cache-Control', 'no-store')
            return new Response(JSON.stringify({
                regions: [
                    { id: 'reg_eu', countries: [{ iso_2: 'LT' }, { iso_2: 'lt' }] },
                    { id: '', countries: [{ iso_2: 'US' }] },
                ],
            }), { status: 200 })
        }))

        await expect(handler(event())).resolves.toEqual({
            regions: [{ id: 'reg_eu', countries: [{ iso_2: 'lt' }] }],
        })
        expect(console.error).not.toHaveBeenCalled()
    })

    it('maps an upstream server failure and logs one allowlisted event', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
            message: 'database secret',
            customer_id: 'cus_secret',
            stack: 'internal stack',
        }), { status: 500, statusText: 'Internal Medusa Failure' })))

        const publicError = await handler(event()).catch((error: unknown) => error)
        expect(publicError).toMatchObject({
            statusCode: 502,
            statusMessage: 'Regional pricing is temporarily unavailable',
        })
        expect(JSON.stringify(publicError)).not.toContain('database secret')
        expect(JSON.stringify(publicError)).not.toContain('Internal Medusa Failure')
        expect(log).toHaveBeenCalledTimes(1)
        expect(Object.keys(log.mock.calls[0]?.[1] as object).sort()).toEqual([
            'correlationId',
            'failureCategory',
            'mappedStatus',
            'operation',
            'upstreamStatus',
        ])

        const diagnostic = JSON.stringify(log.mock.calls)
        expect(diagnostic).not.toContain('database secret')
        expect(diagnostic).not.toContain('cus_secret')
        expect(diagnostic).not.toContain('internal stack')
        expect(diagnostic).not.toContain('medusa.internal.example')
        expect(diagnostic).not.toContain('pk_secret_value')
    })

    it.each([
        ['invalid JSON', () => new Response('not-json', { status: 200 })],
        ['an empty payload', () => new Response(JSON.stringify({ regions: [] }), { status: 200 })],
    ])('rejects %s as an invalid dependency response', async (_case, responseFactory) => {
        vi.stubGlobal('fetch', vi.fn(async () => responseFactory()))

        await expect(handler(event())).rejects.toMatchObject({
            statusCode: 502,
            statusMessage: 'Regional pricing is temporarily unavailable',
        })
        expect(log).toHaveBeenCalledTimes(1)
        expect(setHeader).toHaveBeenCalledWith(expect.anything(), 'Cache-Control', 'no-store')
    })

    it('aborts after three seconds and returns temporary unavailability', async () => {
        vi.useFakeTimers()
        vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => await new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => reject(Object.assign(new Error('timed out'), { name: 'AbortError' })))
        })))

        const request = handler(event())
        const rejection = expect(request).rejects.toMatchObject({
            statusCode: 503,
            statusMessage: 'Regional pricing is temporarily unavailable',
        })
        await vi.advanceTimersByTimeAsync(3000)

        await rejection
        expect(log).toHaveBeenCalledTimes(1)
        expect(log.mock.calls[0]?.[1]).toMatchObject({ failureCategory: 'timeout', mappedStatus: 503 })
        expect(setHeader).toHaveBeenCalledWith(expect.anything(), 'Cache-Control', 'no-store')
    })
})
