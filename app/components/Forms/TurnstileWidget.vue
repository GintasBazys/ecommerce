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
let scriptPollTimer: ReturnType<typeof setInterval> | null = null

useHead(() => {
    if (!props.siteKey) {
        return {}
    }

    return {
        link: [{ rel: "preconnect", href: "https://challenges.cloudflare.com" }],
        script: [{ src: "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit", defer: true }]
    }
})

function stopPolling(): void {
    if (scriptPollTimer) {
        clearInterval(scriptPollTimer)
        scriptPollTimer = null
    }
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

    removeWidget()
    emit("update:modelValue", "")

    widgetId.value = window.turnstile.render(widgetContainer.value, {
        sitekey: props.siteKey,
        action: props.action,
        theme: "light",
        size: "flexible",
        callback: (token) => {
            emit("update:modelValue", token)
        },
        "error-callback": () => {
            emit("update:modelValue", "")
            emit("error", "Verification failed. Please try again.")
        },
        "expired-callback": () => {
            emit("update:modelValue", "")
            emit("expired", "Verification expired. Please try again.")
        }
    })

    return true
}

function ensureWidgetRendered(): void {
    stopPolling()

    if (renderWidget()) {
        return
    }

    if (!import.meta.client || !props.siteKey) {
        return
    }

    scriptPollTimer = setInterval(() => {
        if (renderWidget()) {
            stopPolling()
        }
    }, 250)
}

watch(
    () => [props.siteKey, props.action, props.resetKey],
    async () => {
        await nextTick()
        ensureWidgetRendered()
    }
)

onMounted(() => {
    ensureWidgetRendered()
})

onUnmounted(() => {
    stopPolling()
    removeWidget()
})
</script>

<template>
    <div ref="widgetContainer" class="min-h-[74px] rounded-2xl"></div>
</template>
