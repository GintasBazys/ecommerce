<script setup lang="ts">
import BaseButton from "~/components/Shared/BaseButton.vue"

defineOptions({ inheritAttrs: false })

type ModalSize = "sm" | "md" | "lg"
type ModalMobileMode = "center" | "sheet"

const model = defineModel<boolean>({ default: false })

const props = withDefaults(
    defineProps<{
        titleId?: string
        descriptionId?: string
        ariaLabel?: string
        overlayClass?: string
        closeLabel?: string
        panelClass?: string
        contentClass?: string
        size?: ModalSize
        mobileMode?: ModalMobileMode
        closeOnBackdrop?: boolean
        closeOnEscape?: boolean
        showCloseButton?: boolean
    }>(),
    {
        titleId: undefined,
        descriptionId: undefined,
        ariaLabel: undefined,
        overlayClass: "",
        closeLabel: "Close dialog",
        panelClass: "",
        contentClass: "",
        size: "md",
        mobileMode: "center",
        closeOnBackdrop: true,
        closeOnEscape: true,
        showCloseButton: true
    }
)

const emit = defineEmits<{
    close: []
}>()

const panelRef = useTemplateRef<HTMLElement>("panel")
const backdropPointerStarted = ref<boolean>(false)
const previousFocusedElement = ref<HTMLElement | null>(null)
const previousBodyOverflow = ref<string>("")
const previousBodyTouchAction = ref<string>("")

const sizeClass = computed<string>(() => {
    if (props.size === "sm") {
        return "max-w-xl"
    }

    if (props.size === "lg") {
        return "max-w-3xl"
    }

    return "max-w-2xl"
})

const overlayClass = computed<string>(() => {
    if (props.overlayClass) {
        return `fixed inset-0 flex overflow-hidden ${props.overlayClass}`
    }

    const placement = props.mobileMode === "sheet" ? "items-end sm:items-center sm:justify-center" : "items-center justify-center"

    return `fixed inset-0 z-90 flex overflow-hidden bg-slate-950/55 p-3 sm:p-4 ${placement}`
})

const panelBaseClass = computed<string>(() => {
    const radius = props.mobileMode === "sheet" ? "rounded-t-3xl sm:rounded-3xl" : "rounded-3xl"

    return `relative flex max-h-full min-h-0 w-full flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl ${radius} ${sizeClass.value}`
})

function close(): void {
    model.value = false
    emit("close")
}

function onBackdropPointerDown(event: PointerEvent): void {
    backdropPointerStarted.value = event.target === event.currentTarget
}

function onBackdropPointerUp(event: PointerEvent): void {
    if (props.closeOnBackdrop && backdropPointerStarted.value && event.target === event.currentTarget) {
        close()
    }

    backdropPointerStarted.value = false
}

function getFocusableElements(): HTMLElement[] {
    const panel = panelRef.value

    if (!panel) {
        return []
    }

    return Array.from(
        panel.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
    ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true")
}

function focusInitialElement(): void {
    const autofocusElement = panelRef.value?.querySelector<HTMLElement>("[data-autofocus]")

    if (autofocusElement) {
        autofocusElement.focus()
        return
    }

    const focusableElements = getFocusableElements()
    const firstElement = focusableElements[0]

    if (firstElement) {
        firstElement.focus()
        return
    }

    panelRef.value?.focus()
}

function onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape" && props.closeOnEscape) {
        event.preventDefault()
        close()
        return
    }

    if (event.key !== "Tab") {
        return
    }

    const focusableElements = getFocusableElements()

    if (!focusableElements.length) {
        event.preventDefault()
        panelRef.value?.focus()
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

function lockBodyScroll(): void {
    previousBodyOverflow.value = document.body.style.overflow
    previousBodyTouchAction.value = document.body.style.touchAction
    document.body.style.overflow = "hidden"
    document.body.style.touchAction = "none"
}

function unlockBodyScroll(): void {
    document.body.style.overflow = previousBodyOverflow.value
    document.body.style.touchAction = previousBodyTouchAction.value
}

watch(model, async (isOpen) => {
    if (!import.meta.client) {
        return
    }

    if (isOpen) {
        previousFocusedElement.value = document.activeElement as HTMLElement
        lockBodyScroll()
        await nextTick()
        focusInitialElement()
        return
    }

    unlockBodyScroll()
    previousFocusedElement.value?.focus()
})

onMounted(async () => {
    if (!model.value) {
        return
    }

    previousFocusedElement.value = document.activeElement as HTMLElement
    lockBodyScroll()
    await nextTick()
    focusInitialElement()
})

onBeforeUnmount(() => {
    if (import.meta.client && model.value) {
        unlockBodyScroll()
    }
})
</script>

<template>
    <Teleport to="body">
        <div v-if="model" :class="overlayClass" @pointerdown="onBackdropPointerDown" @pointerup="onBackdropPointerUp">
            <section
                ref="panel"
                :class="[panelBaseClass, props.panelClass]"
                role="dialog"
                aria-modal="true"
                :aria-labelledby="props.titleId"
                :aria-describedby="props.descriptionId"
                :aria-label="props.titleId ? undefined : props.ariaLabel"
                tabindex="-1"
                @keydown="onKeydown"
            >
                <BaseButton
                    v-if="props.showCloseButton"
                    type="button"
                    class="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden motion-reduce:transition-none"
                    :aria-label="props.closeLabel"
                    @click="close"
                >
                    <span aria-hidden="true" class="text-lg leading-none">×</span>
                </BaseButton>

                <div :class="['min-h-0 flex-1 overflow-y-auto', props.contentClass]">
                    <slot :close="close"></slot>
                </div>
            </section>
        </div>
    </Teleport>
</template>
