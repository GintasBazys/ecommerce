import type { VueWrapper } from '@vue/test-utils'

const mountedWrappers: VueWrapper[] = []

export function trackWrapper<T extends VueWrapper>(wrapper: T): T {
    mountedWrappers.push(wrapper)
    return wrapper
}

export function cleanupMountedWrappers(): void {
    mountedWrappers.splice(0).forEach((wrapper) => wrapper.unmount())
}

export function cleanupDocumentBody(): void {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
    document.body.style.touchAction = ''
}

export function getBodyElement<T extends HTMLElement>(selector: string, label: string): T {
    const element = document.body.querySelector<T>(selector)

    if (!element) {
        throw new Error(`${label} was not found`)
    }

    return element
}
