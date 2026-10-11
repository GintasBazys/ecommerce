import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import BaseHeaderSearchDialog from '~/components/Header/BaseHeaderSearchDialog.vue'
import { cleanupDocumentBody, cleanupMountedWrappers, trackWrapper } from '~~/test/utils/dom'

describe('BaseHeaderSearchDialog regional guard', () => {
    afterEach(() => {
        vi.useRealTimers()
        cleanupMountedWrappers()
        cleanupDocumentBody()
    })

    it('does not search before regional context is ready', async () => {
        vi.useFakeTimers()
        const fetchMock = vi.fn()
        vi.stubGlobal('$fetch', fetchMock)
        trackWrapper(await mountSuspended(BaseHeaderSearchDialog, {
            props: {
                open: true,
                regionId: '',
                selectedCountryCode: '',
                regionReady: false,
            },
        }))
        const input = document.body.querySelector<HTMLInputElement>('input[type="search"]')

        input?.dispatchEvent(new Event('focus'))
        if (input) {
            input.value = 'shoe'
            input.dispatchEvent(new Event('input'))
        }
        await vi.advanceTimersByTimeAsync(300)
        await flushPromises()

        expect(fetchMock).not.toHaveBeenCalled()
        expect(document.body.textContent).toContain('Search is unavailable until regional pricing is restored.')
    })

    it('does not navigate on submit before regional context is ready', async () => {
        const navigate = vi.fn()
        vi.stubGlobal('navigateTo', navigate)
        const wrapper = trackWrapper(await mountSuspended(BaseHeaderSearchDialog, {
            props: {
                open: true,
                regionId: '',
                selectedCountryCode: '',
                regionReady: false,
            },
        }))
        const input = document.body.querySelector<HTMLInputElement>('input[type="search"]')

        if (input) {
            input.value = 'shoes'
            input.dispatchEvent(new Event('input'))
        }
        await flushPromises()
        document.body.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
        await flushPromises()

        expect(navigate).not.toHaveBeenCalled()
    })
})
