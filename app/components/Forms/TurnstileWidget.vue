<script setup lang="ts">
const props = defineProps<{
    siteKey: string
    action: string
    modelValue?: string
    resetKey?: number
    appearance?: "always" | "execute" | "interaction-only"
    execution?: "render" | "execute"
}>()

const emit = defineEmits<{
    "update:modelValue": [value: string]
    error: [message: string]
    expired: [message: string]
}>()

const widgetContainer = ref<HTMLElement | null>(null)
const widgetId = ref<string | null>(null)
const isWidgetReady = ref<boolean>(false)
const isWidgetVisible = ref<boolean>(false)
const TURNSTILE_SCRIPT_ID = "turnstile-api-script"

type PendingExecution = {
    resolve: (_token: string) => void
    reject: (_error: Error) => void
}

const pendingExecution = ref<PendingExecution | null>(null)

const widgetAppearance = computed(() => props.appearance || "always")
const widgetExecution = computed(() => props.execution || "render")

function revealWidgetAfterPaint(): void {
    if (!import.meta.client) {
        return
    }

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            isWidgetVisible.value = true
        })
    })
}

function getTurnstileErrorMessage(errorCode?: string): string {
    if (errorCode === "110200") {
        return "Verification is not configured for this domain. Please try again later."
    }

    return "Verification failed. Please try again."
}

function loadTurnstileScript(): Promise<void> {
    if (!import.meta.client || window.turnstile) {
        return Promise.resolve()
    }

    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID)

    if (existingScript) {
        return new Promise((resolve, reject) => {
            existingScript.addEventListener("load", () => resolve(), { once: true })
            existingScript.addEventListener("error", () => reject(new Error("Turnstile failed to load")), { once: true })
        })
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.id = TURNSTILE_SCRIPT_ID
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        script.defer = true
        script.addEventListener("load", () => resolve(), { once: true })
        script.addEventListener("error", () => reject(new Error("Turnstile failed to load")), { once: true })
        document.head.appendChild(script)
    })
}

function removeWidget(): void {
    if (import.meta.client && widgetId.value && window.turnstile) {
        window.turnstile.remove(widgetId.value)
    }

    widgetId.value = null
}

function resolvePendingExecution(token: string): void {
    pendingExecution.value?.resolve(token)
    pendingExecution.value = null
}

function rejectPendingExecution(message: string): void {
    pendingExecution.value?.reject(new Error(message))
    pendingExecution.value = null
}

async function waitForWidgetContainer(): Promise<boolean> {
    if (!isWidgetReady.value) {
        isWidgetReady.value = true
    }

    await nextTick()

    if (widgetContainer.value) {
        return true
    }

    await nextTick()

    return Boolean(widgetContainer.value)
}

function renderWidget(): boolean {
    if (!import.meta.client || !props.siteKey || !widgetContainer.value || !window.turnstile) {
        return false
    }

    isWidgetVisible.value = false
    removeWidget()
    emit("update:modelValue", "")

    widgetId.value = window.turnstile.render(widgetContainer.value, {
        sitekey: props.siteKey,
        action: props.action,
        theme: "light",
        appearance: widgetAppearance.value,
        execution: widgetExecution.value,
        size: "flexible",
        callback: (token) => {
            emit("update:modelValue", token)
            resolvePendingExecution(token)
        },
        "error-callback": (errorCode) => {
            const message = getTurnstileErrorMessage(errorCode)

            emit("update:modelValue", "")
            emit("error", message)
            rejectPendingExecution(message)
        },
        "expired-callback": () => {
            const message = "Verification expired. Please try again."

            emit("update:modelValue", "")
            emit("expired", message)
            rejectPendingExecution(message)
        }
    })

    revealWidgetAfterPaint()

    return true
}

async function ensureWidgetRendered(): Promise<void> {
    if (!import.meta.client || !props.siteKey) {
        return
    }

    try {
        if (widgetId.value) {
            return
        }

        if (!await waitForWidgetContainer()) {
            throw new Error("Turnstile container is unavailable")
        }

        await loadTurnstileScript()

        if (!widgetId.value && !renderWidget()) {
            throw new Error("Turnstile failed to render")
        }
    } catch {
        emit("error", "Verification failed to load. Please try again.")
    }
}

async function execute(): Promise<string> {
    if (props.modelValue) {
        return props.modelValue
    }

    await ensureWidgetRendered()

    if (!import.meta.client || !window.turnstile || !widgetId.value) {
        const message = "Verification failed to load. Please try again."
        emit("error", message)
        throw new Error(message)
    }

    return new Promise((resolve, reject) => {
        pendingExecution.value?.reject(new Error("Verification was restarted."))
        pendingExecution.value = { resolve, reject }
        window.turnstile?.execute(widgetId.value || undefined)
    })
}

watch(
    () => [props.siteKey, props.action, props.resetKey, props.appearance, props.execution],
    async () => {
        if (!isWidgetReady.value) {
            return
        }

        removeWidget()
        emit("update:modelValue", "")
        await nextTick()
        await ensureWidgetRendered()
    }
)

onMounted(async () => {
    await nextTick()
    isWidgetReady.value = true
    await nextTick()
    await ensureWidgetRendered()
})

onUnmounted(() => {
    rejectPendingExecution("Verification was interrupted.")
    removeWidget()
})

defineExpose({ execute })
</script>

<template>
    <div
        v-if="isWidgetReady"
        ref="widgetContainer"
        class="overflow-hidden rounded-2xl bg-slate-50 opacity-0 transition-opacity duration-150 motion-reduce:transition-none"
        :class="[widgetExecution === 'execute' ? 'h-0' : 'min-h-17', isWidgetVisible ? 'opacity-100' : '']"
    ></div>
</template>
