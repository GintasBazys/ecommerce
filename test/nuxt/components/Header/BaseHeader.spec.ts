import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import type { CartDTO, CustomerDTO, RegionDTO } from '@medusajs/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { clearNuxtData } from '#app'

import BaseHeader from '~/components/Header/BaseHeader.vue'
import { useCartStore } from '~/stores/cart'
import { useCustomerStore } from '~/stores/customer'
import { useProductStore } from '~/stores/product'
import { useRegionStore } from '~/stores/region'

type AnnouncementMessage = {
    id: string
    message: string
    link_url?: string | null
    is_active: boolean
    starts_at?: string | null
    ends_at?: string | null
    sort_order: number
}

type AnnouncementBarResponse = {
    announcement_messages: AnnouncementMessage[]
}

type HeaderStoreOptions = {
    cartQuantity?: number
    signedIn?: boolean
}

let announcementResponse: AnnouncementBarResponse = {
    announcement_messages: []
}

registerEndpoint('/api/announcement-bar/messages', () => announcementResponse)

function seedHeaderStores(options: HeaderStoreOptions = {}): void {
    const productStore = useProductStore()
    productStore.categories = [
        {
            id: 'cat_new_arrivals',
            handle: 'new-arrivals',
            name: 'New arrivals'
        },
        {
            id: 'cat_accessories',
            handle: 'accessories',
            name: 'Accessories'
        }
    ]

    const regionStore = useRegionStore()
    regionStore.regions = [
        {
            id: 'reg_eu',
            countries: [
                {
                    iso_2: 'lt',
                    display_name: 'Lithuania'
                },
                {
                    iso_2: 'de',
                    display_name: 'Germany'
                }
            ]
        }
    ] as RegionDTO[]
    regionStore.regionStoreId = 'reg_eu'
    regionStore.selectedCountryCode = 'lt'

    const cartStore = useCartStore()
    cartStore.cart = {
        id: 'cart_1',
        items: [
            {
                id: 'item_1',
                quantity: options.cartQuantity ?? 3
            }
        ]
    } as CartDTO

    const customerStore = useCustomerStore()
    customerStore.customer = options.signedIn ? ({ id: 'cus_1' } as CustomerDTO) : null
}

async function mountHeader() {
    clearNuxtData('announcement-bar-messages')

    return await mountSuspended(BaseHeader, {
        route: '/'
    })
}

async function flushAsyncUpdates(): Promise<void> {
    await nextTick()
    await flushPromises()
    await nextTick()
    await flushPromises()
}

function findButtonByText(wrapper: Awaited<ReturnType<typeof mountHeader>>, text: string) {
    const label = wrapper.findAll('span.sr-only').find((element) => element.text() === text)
    const buttonElement = label?.element.closest('button')
    const button = wrapper.findAll('button').find((element) => element.element === buttonElement)

    if (!button) {
        throw new Error(`Button with text "${text}" was not found`)
    }

    return button
}

describe('BaseHeader', () => {
    beforeEach(() => {
        announcementResponse = {
            announcement_messages: []
        }

        seedHeaderStores()
    })

    it('renders the commerce logo and primary navigation links', async () => {
        const wrapper = await mountHeader()

        expect(wrapper.find('img[alt="Medusa Commerce"]').exists()).toBe(true)
        expect(wrapper.get('a[href="/category/all-products"]').text()).toContain('All products')
        expect(wrapper.get('a[href="/special-offers"]').text()).toContain('Special offers')
    })

    it('renders category links from the product store', async () => {
        const wrapper = await mountHeader()

        expect(wrapper.get('a[href="/category/new-arrivals"]').text()).toContain('New arrivals')
        expect(wrapper.get('a[href="/category/accessories"]').text()).toContain('Accessories')
    })

    it('shows a capped cart quantity badge', async () => {
        seedHeaderStores({ cartQuantity: 120 })

        const wrapper = await mountHeader()

        expect(wrapper.get('a[href="/cart"]').text()).toContain('99+')
    })

    it('shows the account link when a customer is signed in', async () => {
        seedHeaderStores({ signedIn: true })

        const wrapper = await mountHeader()

        expect(wrapper.get('a[href="/account"]').text()).toContain('Profile')
        expect(wrapper.find('a[href="/signin"]').exists()).toBe(false)
    })

    it('renders and dismisses announcement messages from the API', async () => {
        announcementResponse = {
            announcement_messages: [
                {
                    id: 'ann_1',
                    message: 'Free delivery on orders over 50 EUR',
                    link_url: '/special-offers',
                    is_active: true,
                    sort_order: 1
                }
            ]
        }

        const wrapper = await mountHeader()

        expect(wrapper.text()).toContain('Free delivery on orders over 50 EUR')

        findButtonByText(wrapper, 'Dismiss announcement bar').element.click()
        await flushAsyncUpdates()

        expect(wrapper.text()).not.toContain('Free delivery on orders over 50 EUR')
    })
})
