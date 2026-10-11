import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowRef } from 'vue'

import AddressForm from '~/components/Adress/AddressForm.vue'
import { cleanupDocumentBody, cleanupMountedWrappers, trackWrapper } from '~~/test/utils/dom'

const mocks = vi.hoisted(() => ({
    fetchRegion: vi.fn<() => Promise<{ success: boolean }>>()
}))
const regionCountries = shallowRef([])
const status = shallowRef<'idle' | 'loading' | 'ready' | 'error'>('error')
const errorMessage = shallowRef<string | null>('Regional pricing is temporarily unavailable.')
const currentLocale = shallowRef<'en' | 'lt'>('en')

mockNuxtImport('useRegionStore', () => () => ({ fetchRegion: mocks.fetchRegion, regionCountries, status, errorMessage }))
mockNuxtImport('useLocaleStore', () => () => ({
    currentLocale,
    setLocale: (locale: 'en' | 'lt') => {
        currentLocale.value = locale
    },
}))
mockNuxtImport('storeToRefs', () => (store: object) => store)

async function mountAddressForm() {
    return trackWrapper(await mountSuspended(AddressForm, {
        props: {
            modelValue: true,
            address: {},
            title: 'Add address'
        }
    }))
}

function getSaveButton(): HTMLButtonElement {
    const button = [...document.body.querySelectorAll<HTMLButtonElement>('button')].find((element) => element.textContent?.trim() === 'Save')

    if (!button) {
        throw new Error('Save button was not found')
    }

    return button
}

describe('AddressForm regional state', () => {
    beforeEach(() => {
        regionCountries.value = []
        status.value = 'error'
        errorMessage.value = 'Regional pricing is temporarily unavailable.'
        currentLocale.value = 'en'
    })

    afterEach(() => {
        cleanupMountedWrappers()
        cleanupDocumentBody()
    })

    it('shows a regional error and disables country selection and saving', async () => {
        await mountAddressForm()

        expect(document.body.textContent).toContain('Delivery countries are temporarily unavailable.')
        expect(document.body.querySelector<HTMLSelectElement>('#address-country-code')?.disabled).toBe(true)
        expect(getSaveButton().disabled).toBe(true)
    })

    it('provides an operable regional retry action inside the focus-trapped modal', async () => {
        mocks.fetchRegion.mockResolvedValue({ success: false })
        await mountAddressForm()
        const retryButton = [...document.body.querySelectorAll<HTMLButtonElement>('button')].find((element) =>
            element.textContent?.includes('Retry regional pricing')
        )

        expect(retryButton).toBeDefined()
        retryButton?.click()
        await Promise.resolve()

        expect(mocks.fetchRegion).toHaveBeenCalledOnce()
    })

    it('shows a distinct country loading state while dependent controls remain disabled', async () => {
        status.value = 'loading'
        errorMessage.value = null
        await mountAddressForm()

        expect(document.body.textContent).toContain('Loading available delivery countries...')
        expect(document.body.querySelector<HTMLSelectElement>('#address-country-code')?.disabled).toBe(true)
        expect(getSaveButton().disabled).toBe(true)
    })
})
