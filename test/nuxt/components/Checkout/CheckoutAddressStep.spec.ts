import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { AddressErrors } from '~/types/checkout'
import type { Address } from '~/types/interfaces'
import { afterEach, describe, expect, it } from 'vitest'

import CheckoutAddressStep from '~/components/Checkout/CheckoutAddressStep.vue'
import { cleanupMountedWrappers, trackWrapper } from '~~/test/utils/dom'

const emptyAddress: Address = {
    first_name: '',
    last_name: '',
    address_1: '',
    address_2: '',
    city: '',
    province: '',
    postal_code: '',
    country_code: '',
    phone: ''
}
const emptyErrors: AddressErrors = {
    first_name: '',
    last_name: '',
    address_1: '',
    city: '',
    province: '',
    postal_code: '',
    country_code: '',
    phone: ''
}

async function mountAddressStep(regionProps: { isRegionReady: boolean; isRegionLoading: boolean; regionErrorMessage: string | null }) {
    return trackWrapper(await mountSuspended(CheckoutAddressStep, {
        props: {
            currentStep: 'address',
            identityCompleted: true,
            addressCompleted: false,
            useSeparateShipping: false,
            billingAddress: { ...emptyAddress },
            shippingAddress: { ...emptyAddress },
            billingErrors: { ...emptyErrors },
            shippingErrors: { ...emptyErrors },
            countries: [],
            savedAddresses: [],
            isSavedAddressesLoading: false,
            savedAddressesError: null,
            selectedBillingSavedAddressId: '',
            selectedShippingSavedAddressId: '',
            isSubmitting: false,
            ...regionProps
        }
    }))
}

describe('CheckoutAddressStep regional state', () => {
    afterEach(() => cleanupMountedWrappers())

    it('distinguishes loading and disables country selection and continuation', async () => {
        const wrapper = await mountAddressStep({ isRegionReady: false, isRegionLoading: true, regionErrorMessage: null })

        expect(wrapper.text()).toContain('Loading delivery countries and regional prices...')
        expect(wrapper.get('select').attributes('disabled')).toBeDefined()
        expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
    })

    it('shows a regional failure without enabling dependent controls', async () => {
        const wrapper = await mountAddressStep({
            isRegionReady: false,
            isRegionLoading: false,
            regionErrorMessage: 'Regional pricing is temporarily unavailable.'
        })

        expect(wrapper.text()).toContain('Regional pricing is temporarily unavailable.')
        expect(wrapper.get('select').attributes('disabled')).toBeDefined()
        expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
    })
})
