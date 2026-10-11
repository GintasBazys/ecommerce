<script setup lang="ts">
const regionStore = useRegionStore()
const route = useRoute()
const { status, errorMessage } = storeToRefs(regionStore)
const { currentLocale } = storeToRefs(useLocaleStore())
const messages = computed(() => getErrorMessages(currentLocale.value).region)

const isRetrying = shallowRef<boolean>(false)
const hasReloaded = shallowRef<boolean>(false)
const retrySucceeded = shallowRef<boolean>(false)

const isVisible = computed<boolean>(() => Boolean(errorMessage.value) || status.value === "error" || isRetrying.value)
const statusMessage = computed<string>(() => {
    if (retrySucceeded.value) {
        return messages.value.recovered
    }

    if (isRetrying.value) {
        return messages.value.retrying
    }

    return messages.value.description
})

async function retry(): Promise<void> {
    if (isRetrying.value || hasReloaded.value) {
        return
    }

    isRetrying.value = true

    const result = await regionStore.fetchRegion()
    if (!result.success) {
        isRetrying.value = false
        return
    }

    hasReloaded.value = true
    retrySucceeded.value = true
    await nextTick()
    reloadNuxtApp({ path: route.fullPath, force: true })
}
</script>

<template>
    <section
        v-if="isVisible"
        aria-labelledby="region-availability-title"
        class="border-y border-amber-300 bg-amber-50 px-4 py-3 text-amber-950"
    >
        <div class="mx-auto flex w-full max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:px-2">
            <div>
                <h2 id="region-availability-title" class="text-sm font-bold">{{ messages.title }}</h2>
                <p class="mt-1 text-sm leading-6">
                    {{ messages.description }}
                </p>
                <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
                    {{ statusMessage }}
                </p>
            </div>
            <button
                id="region-availability-retry"
                type="button"
                class="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-amber-950 px-5 text-sm font-semibold text-white transition hover:bg-amber-900 focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50 focus-visible:outline-hidden disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none"
                :disabled="isRetrying"
                :aria-busy="isRetrying || undefined"
                @click="retry"
            >
                {{ isRetrying ? messages.tryingAgain : messages.retry }}
            </button>
        </div>
    </section>
</template>
