import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowRef } from 'vue'

import RegionAvailabilityNotice from '~/components/Shared/RegionAvailabilityNotice.vue'
import { cleanupMountedWrappers, trackWrapper } from '~~/test/utils/dom'

const mocks = vi.hoisted(() => ({
    fetchRegion: vi.fn<() => Promise<{ success: boolean }>>(),
    reloadNuxtApp: vi.fn()
}))
const status = shallowRef<'idle' | 'loading' | 'ready' | 'error'>('error')
const errorMessage = shallowRef<string | null>('Regional pricing is temporarily unavailable.')
const currentLocale = shallowRef<'en' | 'lt'>('en')

mockNuxtImport('useRegionStore', () => () => ({ fetchRegion: mocks.fetchRegion, status, errorMessage }))
mockNuxtImport('useLocaleStore', () => () => ({
    currentLocale,
    setLocale: (locale: 'en' | 'lt') => {
        currentLocale.value = locale
    },
}))
mockNuxtImport('storeToRefs', () => (store: object) => store)
mockNuxtImport('reloadNuxtApp', () => mocks.reloadNuxtApp)

describe('RegionAvailabilityNotice', () => {
    beforeEach(() => {
        status.value = 'error'
        errorMessage.value = 'Regional pricing is temporarily unavailable.'
        currentLocale.value = 'en'
    })

    afterEach(() => {
        cleanupMountedWrappers()
    })

    it('renders production copy with a native retry action and visible keyboard focus styling', async () => {
        mocks.fetchRegion.mockResolvedValue({ success: false })
        const wrapper = trackWrapper(await mountSuspended(RegionAvailabilityNotice, { route: '/products?page=2' }))
        const button = wrapper.get('button')

        expect(wrapper.get('[role="status"]').attributes('aria-live')).toBe('polite')
        expect(wrapper.text()).toContain('We could not load delivery countries and regional prices. Please try again.')
        expect(button.element.tagName).toBe('BUTTON')
        expect(button.classes()).toContain('min-h-11')
        expect(button.classes()).toContain('focus-visible:ring-2')

        await button.trigger('click')

        expect(mocks.fetchRegion).toHaveBeenCalledOnce()
    })

    it('labels retry as busy and deduplicates activation while the request is pending', async () => {
        let resolveRetry: (value: { success: boolean }) => void = () => undefined
        mocks.fetchRegion.mockReturnValue(new Promise<{ success: boolean }>((resolve) => {
            resolveRetry = resolve
        }))
        const wrapper = trackWrapper(await mountSuspended(RegionAvailabilityNotice, { route: '/' }))
        const button = wrapper.get('button')

        await button.trigger('click')
        await button.trigger('click')

        expect(button.attributes('disabled')).toBeDefined()
        expect(button.attributes('aria-busy')).toBe('true')
        expect(button.text()).toBe('Trying again...')
        expect(mocks.fetchRegion).toHaveBeenCalledOnce()

        resolveRetry({ success: false })
        await flushPromises()

        expect(button.attributes('disabled')).toBeUndefined()
        expect(wrapper.text()).toContain('Retry regional pricing')
    })

    it('renders Lithuanian regional recovery copy for the Lithuanian locale', async () => {
        currentLocale.value = 'lt'
        const wrapper = trackWrapper(await mountSuspended(RegionAvailabilityNotice, { route: '/lt' }))

        expect(wrapper.text()).toContain('Regioninės kainos laikinai nepasiekiamos')
        expect(wrapper.get('button').text()).toContain('Bandyti įkelti regionines kainas dar kartą')
    })

    it('reloads the current route exactly once after a successful retry', async () => {
        mocks.fetchRegion.mockResolvedValue({ success: true })
        const wrapper = trackWrapper(await mountSuspended(RegionAvailabilityNotice, { route: '/category/shoes?sort=price' }))

        await wrapper.get('button').trigger('click')
        await flushPromises()
        await wrapper.get('button').trigger('click')

        expect(mocks.reloadNuxtApp).toHaveBeenCalledOnce()
        expect(mocks.reloadNuxtApp).toHaveBeenCalledWith({ path: '/category/shoes?sort=price', force: true })
        expect(wrapper.get('[role="status"]').text()).toContain('Reloading this page')
    })
})
