<script setup lang="ts">
const props = defineProps<{
    siteKey: string
    action: string
    modelValue?: string
    resetKey?: number
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
        appearance: "always",
        size: "flexible",
        callback: (token) => {
            emit("update:modelValue", token)
        },
        "error-callback": (errorCode) => {
            emit("update:modelValue", "")
            emit("error", getTurnstileErrorMessage(errorCode))
        },
        "expired-callback": () => {
            emit("update:modelValue", "")
            emit("expired", "Verification expired. Please try again.")
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
        await loadTurnstileScript()
        renderWidget()
    } catch {
        emit("error", "Verification failed to load. Please try again.")
    }
}

watch(
    () => [props.siteKey, props.action, props.resetKey],
    async () => {
        if (!isWidgetReady.value) {
            return
        }

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
    removeWidget()
})
</script>

<template>
    <div
        v-if="isWidgetReady"
        ref="widgetContainer"
        class="min-h-17 overflow-hidden rounded-2xl bg-slate-50 opacity-0 transition-opacity duration-150 motion-reduce:transition-none"
        :class="isWidgetVisible ? 'opacity-100' : ''"
    ></div>
</template>
