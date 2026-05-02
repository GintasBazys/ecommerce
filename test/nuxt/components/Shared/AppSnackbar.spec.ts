import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { clearNuxtState } from '#app'

import AppSnackbar from '~/components/Shared/AppSnackbar.vue'

const mountedWrappers: VueWrapper[] = []

async function mountSnackbar(): Promise<void> {
    const wrapper = await mountSuspended(AppSnackbar, {
        route: '/'
    })

    mountedWrappers.push(wrapper)
}

async function flushSnackbarUpdates(): Promise<void> {
    await nextTick()
    await flushPromises()
    await nextTick()
}

async function showMountedSnackbar(message: string, tone: 'success' | 'error' | 'info' = 'info'): Promise<void> {
    const { showSnackbar } = useSnackbar()

    showSnackbar(message, tone, 30000)
    await flushSnackbarUpdates()
}

function getSnackbarElement(): HTMLElement {
    const element = document.body.querySelector<HTMLElement>('[role="status"], [role="alert"]')

    if (!element) {
        throw new Error('Snackbar was not found')
    }

    return element
}

function getDismissButton(): HTMLButtonElement {
    const button = [...document.body.querySelectorAll<HTMLButtonElement>('button')].find((element) =>
        element.textContent?.includes('Dismiss notification')
    )

    if (!button) {
        throw new Error('Dismiss button was not found')
    }

    return button
}

describe('AppSnackbar', () => {
    beforeEach(() => {
        clearNuxtState('app-snackbar')
    })

    afterEach(() => {
        const { closeSnackbar } = useSnackbar()

        closeSnackbar()
        mountedWrappers.splice(0).forEach((wrapper) => wrapper.unmount())
        document.body.innerHTML = ''
    })

    it('renders a prominent success notification', async () => {
        await mountSnackbar()
        await showMountedSnackbar('Your account is ready.', 'success')

        const snackbar = getSnackbarElement()

        expect(snackbar.getAttribute('role')).toBe('status')
        expect(snackbar.getAttribute('aria-live')).toBe('polite')
        expect(snackbar.textContent).toContain('Success')
        expect(snackbar.textContent).toContain('Your account is ready.')
        expect(snackbar.className).toContain('border-l-emerald-400')
    })

    it('renders errors as assertive action-needed notifications', async () => {
        await mountSnackbar()
        await showMountedSnackbar('Email or password is incorrect. Please check your details and try again.', 'error')

        const snackbar = getSnackbarElement()

        expect(snackbar.getAttribute('role')).toBe('alert')
        expect(snackbar.getAttribute('aria-live')).toBe('assertive')
        expect(snackbar.textContent).toContain('Action needed')
        expect(snackbar.textContent).toContain('Email or password is incorrect')
        expect(snackbar.className).toContain('border-l-rose-400')
    })

    it('makes security verification failures explicit', async () => {
        await mountSnackbar()
        await showMountedSnackbar('Verification failed', 'error')

        const snackbar = getSnackbarElement()

        expect(snackbar.textContent).toContain('Security check')
        expect(snackbar.textContent).toContain('Security verification failed. Please complete the challenge and try again.')
    })

    it('can be dismissed by the user', async () => {
        await mountSnackbar()
        await showMountedSnackbar('Cart was updated.', 'success')

        getDismissButton().click()
        await flushSnackbarUpdates()

        expect(document.body.textContent).not.toContain('Cart was updated.')
    })
})
