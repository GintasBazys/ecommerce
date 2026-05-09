import type { Ref } from "vue"

type FocusTrapOptions = {
    onEscape?: () => void
}

const focusableSelector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(containerRef: Ref<HTMLElement | null>, activeRef: Ref<boolean>, options: FocusTrapOptions = {}) {
    const previousFocusedElement = ref<HTMLElement | null>(null)

    function getFocusableElements(): HTMLElement[] {
        const container = containerRef.value

        if (!container) {
            return []
        }

        return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
            (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true"
        )
    }

    function focusInitialElement(): void {
        const autofocusElement = containerRef.value?.querySelector<HTMLElement>("[data-autofocus]")

        if (autofocusElement) {
            autofocusElement.focus()
            return
        }

        const firstElement = getFocusableElements()[0]

        if (firstElement) {
            firstElement.focus()
            return
        }

        containerRef.value?.focus()
    }

    function onKeydown(event: KeyboardEvent): void {
        if (!activeRef.value) {
            return
        }

        if (event.key === "Escape") {
            event.preventDefault()
            options.onEscape?.()
            return
        }

        if (event.key !== "Tab") {
            return
        }

        const focusableElements = getFocusableElements()

        if (!focusableElements.length) {
            event.preventDefault()
            containerRef.value?.focus()
            return
        }

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (!firstElement || !lastElement) {
            return
        }

        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
            return
        }

        if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
        }
    }

    watch(activeRef, async (isActive) => {
        if (!import.meta.client) {
            return
        }

        if (isActive) {
            previousFocusedElement.value = document.activeElement as HTMLElement
            document.addEventListener("keydown", onKeydown)
            await nextTick()
            focusInitialElement()
            return
        }

        document.removeEventListener("keydown", onKeydown)
        previousFocusedElement.value?.focus()
    }, { immediate: true })

    onBeforeUnmount(() => {
        if (import.meta.client) {
            document.removeEventListener("keydown", onKeydown)
        }
    })
}
