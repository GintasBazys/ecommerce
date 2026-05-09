import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import BaseButton from '~/components/Shared/BaseButton.vue'

type BaseButtonExposed = {
    focus: (options?: Parameters<HTMLButtonElement['focus']>[0]) => void
}

async function mountButton(props: Record<string, unknown> = {}, slot = 'Add to cart'): Promise<VueWrapper> {
    return await mountSuspended(BaseButton, {
        props,
        slots: {
            default: slot
        },
        route: '/'
    })
}

describe('BaseButton', () => {
    it('renders as a native button with safe default type', async () => {
        const wrapper = await mountButton()
        const button = wrapper.get('button')

        expect(button.attributes('type')).toBe('button')
        expect(button.text()).toBe('Add to cart')
    })

    it('applies primary, secondary, and accent variant classes', async () => {
        const primary = await mountButton({ variant: 'primary' })
        const secondary = await mountButton({ variant: 'secondary' })
        const accent = await mountButton({ variant: 'accent' })

        expect(primary.get('button').classes()).toContain('ui-btn-primary')
        expect(secondary.get('button').classes()).toContain('ui-btn-secondary')
        expect(accent.get('button').classes()).toContain('ui-btn-accent')
    })

    it('merges variant classes with parent layout classes', async () => {
        const wrapper = await mountButton({ variant: 'accent', class: 'w-full px-6 sm:min-w-36' })
        const classes = wrapper.get('button').classes()

        expect(classes).toContain('ui-btn-accent')
        expect(classes).toContain('w-full')
        expect(classes).toContain('px-6')
        expect(classes).toContain('sm:min-w-36')
    })

    it('passes through native and aria attributes without treating class as an attribute', async () => {
        const wrapper = await mountButton({
            'aria-label': 'Open menu',
            'aria-expanded': 'false',
            'data-testid': 'menu-button',
            class: 'min-h-12'
        })
        const button = wrapper.get('button')

        expect(button.attributes('aria-label')).toBe('Open menu')
        expect(button.attributes('aria-expanded')).toBe('false')
        expect(button.attributes('data-testid')).toBe('menu-button')
        expect(button.attributes('class')).toContain('min-h-12')
    })

    it('supports submit type for forms', async () => {
        const wrapper = await mountButton({ type: 'submit', variant: 'primary' }, 'Send message')

        expect(wrapper.get('button').attributes('type')).toBe('submit')
    })

    it('disables the button while disabled or loading', async () => {
        const disabled = await mountButton({ disabled: true })
        const loading = await mountButton({ loading: true })

        expect(disabled.get('button').attributes('disabled')).toBeDefined()
        expect(loading.get('button').attributes('disabled')).toBeDefined()
        expect(loading.get('button').attributes('aria-busy')).toBe('true')
    })

    it('exposes focus for drawer and modal focus management', async () => {
        const wrapper = await mountButton()
        const button = wrapper.get('button').element as HTMLButtonElement
        const focusSpy = vi.spyOn(button, 'focus')

        ;(wrapper.vm as unknown as BaseButtonExposed).focus()

        expect(focusSpy).toHaveBeenCalledOnce()
    })
})
