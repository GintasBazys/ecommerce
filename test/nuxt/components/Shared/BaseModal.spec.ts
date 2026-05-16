import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'

import BaseModal from '~/components/Shared/BaseModal.vue'
import { flushNuxtUpdates } from "~~/test/utils/async"
import { cleanupDocumentBody, cleanupMountedWrappers, getBodyElement, trackWrapper } from "~~/test/utils/dom"

type ModalHarnessProps = {
    initialOpen?: boolean
    titleId?: string
    descriptionId?: string
    ariaLabel?: string
    overlayClass?: string
    panelClass?: string
    contentClass?: string
    closeOnEscape?: boolean
    closeOnBackdrop?: boolean
    showCloseButton?: boolean
    size?: 'sm' | 'md' | 'lg'
    mobileMode?: 'center' | 'sheet'
}

const ModalHarness = defineComponent({
    components: { BaseModal },
    props: {
        initialOpen: { type: Boolean, default: true },
        titleId: { type: String, default: 'base-modal-title' },
        descriptionId: { type: String, default: 'base-modal-description' },
        ariaLabel: { type: String, default: '' },
        overlayClass: { type: String, default: '' },
        panelClass: { type: String, default: '' },
        contentClass: { type: String, default: '' },
        closeOnEscape: { type: Boolean, default: true },
        closeOnBackdrop: { type: Boolean, default: true },
        showCloseButton: { type: Boolean, default: true },
        size: { type: String, default: 'md' },
        mobileMode: { type: String, default: 'center' }
    },
    setup(props) {
        const open = ref<boolean>(props.initialOpen)

        return { open }
    },
    template: `
        <button type="button" data-testid="trigger" @click="open = true">Open modal</button>
        <BaseModal
            v-model="open"
            :title-id="titleId || undefined"
            :description-id="descriptionId || undefined"
            :aria-label="ariaLabel || undefined"
            :overlay-class="overlayClass"
            :panel-class="panelClass"
            :content-class="contentClass"
            :close-on-escape="closeOnEscape"
            :close-on-backdrop="closeOnBackdrop"
            :show-close-button="showCloseButton"
            :size="size"
            :mobile-mode="mobileMode"
            close-label="Close test modal"
        >
            <h2 :id="titleId || undefined">Modal title</h2>
            <p :id="descriptionId || undefined">Modal description</p>
            <input data-autofocus aria-label="Autofocus field" />
            <button type="button">First action</button>
            <button type="button">Last action</button>
        </BaseModal>
    `
})

async function mountModal(props: ModalHarnessProps = {}): Promise<VueWrapper> {
    const wrapper = await mountSuspended(ModalHarness, {
        props,
        route: '/'
    })

    trackWrapper(wrapper)
    await flushNuxtUpdates()

    return wrapper
}

function getDialog(): HTMLElement {
    return getBodyElement('[role="dialog"]', 'Dialog')
}

function getOverlay(): HTMLElement {
    const overlay = getDialog().parentElement

    if (!overlay) {
        throw new Error('Overlay was not found')
    }

    return overlay
}

function dispatchPointerEvent(element: HTMLElement, eventName: 'pointerdown' | 'pointerup'): void {
    const event = typeof PointerEvent === 'function'
        ? new PointerEvent(eventName, { bubbles: true })
        : new MouseEvent(eventName, { bubbles: true })

    element.dispatchEvent(event)
}

describe('BaseModal', () => {
    afterEach(() => {
        cleanupMountedWrappers()
        cleanupDocumentBody()
    })

    it('renders teleported dialog content only when open', async () => {
        const wrapper = await mountModal({ initialOpen: false })

        expect(document.body.querySelector('[role="dialog"]')).toBeNull()

        await wrapper.get('[data-testid="trigger"]').trigger('click')
        await flushNuxtUpdates()

        expect(getDialog().textContent).toContain('Modal title')
    })

    it('applies accessible dialog attributes', async () => {
        await mountModal({ titleId: 'custom-title', descriptionId: 'custom-description' })

        const dialog = getDialog()

        expect(dialog.getAttribute('aria-modal')).toBe('true')
        expect(dialog.getAttribute('aria-labelledby')).toBe('custom-title')
        expect(dialog.getAttribute('aria-describedby')).toBe('custom-description')
    })

    it('uses aria-label when no title id is provided', async () => {
        await mountModal({ titleId: '', descriptionId: '', ariaLabel: 'Customer support modal' })

        const dialog = getDialog()

        expect(dialog.getAttribute('aria-label')).toBe('Customer support modal')
        expect(dialog.getAttribute('aria-labelledby')).toBeNull()
    })

    it('closes from the close button', async () => {
        await mountModal()

        const closeButton = document.body.querySelector<HTMLButtonElement>('button[aria-label="Close test modal"]')
        expect(closeButton).not.toBeNull()

        closeButton?.click()
        await flushNuxtUpdates()

        expect(document.body.querySelector('[role="dialog"]')).toBeNull()
    })

    it('closes with Escape unless disabled', async () => {
        await mountModal()

        getDialog().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await flushNuxtUpdates()

        expect(document.body.querySelector('[role="dialog"]')).toBeNull()

        cleanupMountedWrappers()
        cleanupDocumentBody()

        await mountModal({ closeOnEscape: false })

        getDialog().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await flushNuxtUpdates()

        expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
    })

    it('only closes on backdrop when pointer starts and ends on backdrop', async () => {
        await mountModal()

        const overlay = getOverlay()
        const dialog = getDialog()

        dispatchPointerEvent(dialog, 'pointerdown')
        dispatchPointerEvent(overlay, 'pointerup')
        await flushNuxtUpdates()

        expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()

        dispatchPointerEvent(overlay, 'pointerdown')
        dispatchPointerEvent(overlay, 'pointerup')
        await flushNuxtUpdates()

        expect(document.body.querySelector('[role="dialog"]')).toBeNull()
    })

    it('applies overlay, panel, and content classes from props', async () => {
        await mountModal({
            overlayClass: 'test-overlay-class',
            panelClass: 'test-panel-class',
            contentClass: 'test-content-class'
        })

        expect(getOverlay().className).toContain('test-overlay-class')
        expect(getDialog().className).toContain('test-panel-class')
        expect(getDialog().querySelector('.test-content-class')).not.toBeNull()
    })

    it('locks body scroll while open and restores body styles after close', async () => {
        document.body.style.overflow = 'auto'
        document.body.style.touchAction = 'pan-y'

        await mountModal()

        expect(document.body.style.overflow).toBe('hidden')
        expect(document.body.style.touchAction).toBe('none')

        document.body.querySelector<HTMLButtonElement>('button[aria-label="Close test modal"]')?.click()
        await flushNuxtUpdates()

        expect(document.body.style.overflow).toBe('auto')
        expect(document.body.style.touchAction).toBe('pan-y')
    })

    it('focuses the slotted autofocus element on open', async () => {
        await mountModal()

        const autofocusInput = document.body.querySelector<HTMLInputElement>('input[data-autofocus]')

        expect(document.activeElement).toBe(autofocusInput)
    })

    it('traps keyboard focus inside the dialog', async () => {
        await mountModal()

        const dialog = getDialog()
        const focusableElements = [...dialog.querySelectorAll<HTMLElement>('input, button')]
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        expect(firstElement).toBeDefined()
        expect(lastElement).toBeDefined()

        lastElement?.focus()
        dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))

        expect(document.activeElement).toBe(firstElement)

        firstElement?.focus()
        dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }))

        expect(document.activeElement).toBe(lastElement)
    })

    it('restores focus to the previously focused element after close', async () => {
        const trigger = document.createElement('button')
        trigger.type = 'button'
        document.body.appendChild(trigger)
        trigger.focus()

        await mountModal()

        document.body.querySelector<HTMLButtonElement>('button[aria-label="Close test modal"]')?.click()
        await flushNuxtUpdates()

        expect(document.activeElement).toBe(trigger)
    })

    it('can hide the close button and apply size/mobile mode classes', async () => {
        await mountModal({ showCloseButton: false, size: 'lg', mobileMode: 'sheet' })

        expect(document.body.querySelector('button[aria-label="Close test modal"]')).toBeNull()
        expect(getDialog().className).toContain('max-w-3xl')
        expect(getDialog().className).toContain('rounded-t-3xl')
    })
})
