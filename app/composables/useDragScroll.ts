import { onBeforeUnmount, type Ref } from "vue"

interface UseDragScrollOptions {
    clickDragThreshold?: number
    activeClassName?: string
}

export function useDragScroll(railRef: Ref<HTMLElement | null>, options: UseDragScrollOptions = {}) {
    const clickDragThreshold = options.clickDragThreshold ?? 5
    const activeClassName = options.activeClassName ?? "is-pointer-down"

    let isPointerDown = false
    let shouldPreventClick = false
    let startX = 0
    let startScrollLeft = 0
    let activePointerId: number | null = null

    function onPointerDown(e: PointerEvent): void {
        const rail = railRef.value

        if (!rail) {
            return
        }

        if (e.pointerType === "mouse" && e.button !== 0) {
            return
        }

        isPointerDown = true
        shouldPreventClick = false
        activePointerId = e.pointerId
        startX = e.clientX
        startScrollLeft = rail.scrollLeft

        rail.classList.add(activeClassName)

        window.addEventListener("pointermove", onWindowPointerMove, { passive: false })
        window.addEventListener("pointerup", onWindowPointerUp)
        window.addEventListener("pointercancel", onWindowPointerUp)
    }

    function onWindowPointerMove(e: PointerEvent): void {
        const rail = railRef.value

        if (!rail || !isPointerDown || activePointerId !== e.pointerId) {
            return
        }

        const delta = e.clientX - startX

        if (delta === 0) {
            return
        }

        e.preventDefault()
        rail.scrollLeft = startScrollLeft - delta

        if (Math.abs(delta) > clickDragThreshold) {
            shouldPreventClick = true
        }
    }

    function onWindowPointerUp(e: PointerEvent): void {
        if (activePointerId !== e.pointerId) {
            return
        }

        cleanup()
    }

    function cleanup(): void {
        const rail = railRef.value

        isPointerDown = false
        activePointerId = null

        rail?.classList.remove(activeClassName)

        window.removeEventListener("pointermove", onWindowPointerMove)
        window.removeEventListener("pointerup", onWindowPointerUp)
        window.removeEventListener("pointercancel", onWindowPointerUp)
    }

    function onClickCapture(e: MouseEvent): void {
        if (!shouldPreventClick) {
            return
        }

        e.preventDefault()
        e.stopPropagation()

        requestAnimationFrame(function (): void {
            shouldPreventClick = false
        })
    }

    function onDragStart(e: DragEvent): void {
        e.preventDefault()
    }

    onBeforeUnmount(function () {
        cleanup()
    })

    return {
        onPointerDown,
        onClickCapture,
        onDragStart
    }
}
