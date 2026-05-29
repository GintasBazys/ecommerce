import type { Ref } from "vue"

import { useFocusTrap } from "~/composables/shared/useFocusTrap"

type UseViewportDrawerOptions = {
    topOffset?: string
    initialHeight?: number
}

export function useViewportDrawer(drawerRef: Ref<HTMLElement | null>, options: UseViewportDrawerOptions = {}) {
    const isOpen = ref<boolean>(false)
    const viewportHeight = ref<number>(0)
    const topOffset = options.topOffset ?? "5rem"
    const initialHeight = options.initialHeight ?? 640

    const drawerStyle = computed<Record<string, string>>(() => ({
        "--mobile-filter-viewport-height": `${viewportHeight.value || initialHeight}px`,
        "--mobile-filter-top-offset": topOffset
    }))

    useFocusTrap(drawerRef, isOpen, { onEscape: closeDrawer })

    function openDrawer(): void {
        isOpen.value = true
    }

    function closeDrawer(): void {
        isOpen.value = false
    }

    function updateViewportHeight(): void {
        viewportHeight.value = Math.floor(window.visualViewport?.height ?? window.innerHeight)
    }

    watch(isOpen, (open) => {
        if (!import.meta.client) {
            return
        }

        document.body.style.overflow = open ? "hidden" : ""

        if (open) {
            updateViewportHeight()
            window.visualViewport?.addEventListener("resize", updateViewportHeight)
            window.addEventListener("resize", updateViewportHeight)
            return
        }

        window.visualViewport?.removeEventListener("resize", updateViewportHeight)
        window.removeEventListener("resize", updateViewportHeight)
    })

    onUnmounted(() => {
        if (!import.meta.client) {
            return
        }

        document.body.style.overflow = ""
        window.visualViewport?.removeEventListener("resize", updateViewportHeight)
        window.removeEventListener("resize", updateViewportHeight)
    })

    return {
        isOpen,
        drawerStyle,
        openDrawer,
        closeDrawer
    }
}
