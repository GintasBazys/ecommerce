import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('init-app regional readiness', () => {
    beforeEach(() => {
        vi.resetModules()
        vi.stubGlobal('defineNuxtPlugin', (plugin: unknown) => plugin)
    })

    it('does not treat a cookie-derived identifier as ready after an SSR failure', async () => {
        const { hasReadyRegionalContext } = await import('../../../app/plugins/init-app')

        expect(hasReadyRegionalContext({ status: 'error', regionStoreId: 'reg_cookie' })).toBe(false)
    })

    it('allows dependent initialization only for validated ready state', async () => {
        const { hasReadyRegionalContext } = await import('../../../app/plugins/init-app')

        expect(hasReadyRegionalContext({ status: 'loading', regionStoreId: 'reg_eu' })).toBe(false)
        expect(hasReadyRegionalContext({ status: 'ready', regionStoreId: null })).toBe(false)
        expect(hasReadyRegionalContext({ status: 'ready', regionStoreId: 'reg_eu' })).toBe(true)
    })
})
