import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { NuxtError } from 'nuxt/app'
import { afterEach, describe, expect, it } from 'vitest'

import ErrorPage from '~/error.vue'
import { useLocaleStore } from '~/stores/locale'
import { cleanupMountedWrappers, trackWrapper } from '~~/test/utils/dom'

describe('fatal error page', () => {
    afterEach(() => {
        useLocaleStore().setLocale('en')
        cleanupMountedWrappers()
    })

    it('does not render arbitrary status text for 5xx errors and keeps recovery links accessible', async () => {
        const error = {
            status: 502,
            statusCode: 502,
            statusText: 'Upstream token exchange failed for internal-service.local',
            message: 'Sensitive upstream detail'
        } as unknown as NuxtError
        const wrapper = trackWrapper(await mountSuspended(ErrorPage, {
            props: { error },
            route: '/checkout'
        }))

        expect(wrapper.text()).toContain('The storefront is temporarily unavailable. Please try again shortly.')
        expect(wrapper.text()).not.toContain('Upstream token exchange failed')
        expect(wrapper.text()).not.toContain('Sensitive upstream detail')
        expect(wrapper.get('a[href="/special-offers"]').text()).toContain('Browse offers')
    })

    it('renders approved Lithuanian 5xx copy for the Lithuanian locale', async () => {
        useLocaleStore().setLocale('lt')
        const error = { statusCode: 500, statusMessage: 'Internal service detail' } as unknown as NuxtError
        const wrapper = trackWrapper(await mountSuspended(ErrorPage, {
            props: { error },
            route: '/lt',
        }))

        expect(wrapper.text()).toContain('Parduotuvė laikinai nepasiekiama. Netrukus bandykite dar kartą.')
        expect(wrapper.text()).not.toContain('Internal service detail')
    })
})
