import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../../server/utils/locale', () => ({
    getRequestMedusaLocale: () => 'en-US',
}))

function createError(input: { statusCode: number; statusMessage: string }) {
    return Object.assign(new Error(input.statusMessage), input)
}

describe('region-dependent endpoint guards', () => {
    beforeEach(() => {
        vi.stubGlobal('createError', createError)
        vi.stubGlobal('defineEventHandler', <T>(value: T) => value)
    })

    it('rejects a repeated cart region before contacting Medusa', async () => {
        const fetch = vi.fn()
        vi.stubGlobal('fetch', fetch)
        vi.stubGlobal('getQuery', () => ({ region_id: ['reg_eu', 'reg_us'] }))
        const handler = (await import('../../../../server/api/cart/cart')).default

        await expect(handler({} as never)).rejects.toMatchObject({ statusCode: 400, statusMessage: 'Invalid region_id' })
        expect(fetch).not.toHaveBeenCalled()
    })

    it('rejects an invalid optional search region before product lookup', async () => {
        const fetch = vi.fn()
        vi.stubGlobal('fetch', fetch)
        vi.stubGlobal('readBody', async () => ({ q: 'shoes' }))
        vi.stubGlobal('getQuery', () => ({ region_id: 'undefined' }))
        const handler = (await import('../../../../server/api/search')).default

        await expect(handler({} as never)).rejects.toMatchObject({ statusCode: 400, statusMessage: 'Invalid region_id' })
        expect(fetch).not.toHaveBeenCalled()
    })

    it('rejects a missing search region before product lookup', async () => {
        const fetch = vi.fn()
        vi.stubGlobal('fetch', fetch)
        vi.stubGlobal('readBody', async () => ({ q: 'shoes' }))
        vi.stubGlobal('getQuery', () => ({}))
        const handler = (await import('../../../../server/api/search')).default

        await expect(handler({} as never)).rejects.toMatchObject({ statusCode: 400, statusMessage: 'Invalid region_id' })
        expect(fetch).not.toHaveBeenCalled()
    })
})
