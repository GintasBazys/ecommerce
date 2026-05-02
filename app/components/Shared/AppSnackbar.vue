<script setup lang="ts">
const { snackbar, closeSnackbar } = useSnackbar()

const toneClasses = computed<string>(() => {
    if (snackbar.value.tone === "success") {
        return "border-l-emerald-400 text-emerald-200"
    }

    if (snackbar.value.tone === "error") {
        return "border-l-rose-400 text-rose-200"
    }

    return "border-l-amber-300 text-amber-100"
})

const iconClasses = computed<string>(() => {
    if (snackbar.value.tone === "success") {
        return "bg-emerald-400 text-slate-950"
    }

    if (snackbar.value.tone === "error") {
        return "bg-rose-400 text-white"
    }

    return "bg-amber-300 text-slate-950"
})

const ariaRole = computed<"status" | "alert">(() => (snackbar.value.tone === "error" ? "alert" : "status"))
const ariaLive = computed<"polite" | "assertive">(() => (snackbar.value.tone === "error" ? "assertive" : "polite"))
const isSecurityVerificationMessage = computed<boolean>(() => /turnstile|verification/i.test(snackbar.value.message))
const eyebrowText = computed<string>(() => {
    if (isSecurityVerificationMessage.value) {
        return "Security check"
    }

    return snackbar.value.tone === "success" ? "Success" : snackbar.value.tone === "error" ? "Action needed" : "Notice"
})
const displayMessage = computed<string>(() => {
    if (!isSecurityVerificationMessage.value) {
        return snackbar.value.message
    }

    if (/^verification failed\.?$/i.test(snackbar.value.message.trim())) {
        return "Security verification failed. Please complete the challenge and try again."
    }

    if (/^verification is required\.?$/i.test(snackbar.value.message.trim())) {
        return "Security verification is required before you can continue."
    }

    return snackbar.value.message.replace(/^Verification/i, "Security verification")
})
</script>

<template>
    <Teleport to="body">
        <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="translate-y-2 opacity-0 sm:-translate-y-2"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="translate-y-2 opacity-0 sm:-translate-y-2"
        >
            <div v-if="snackbar.visible" class="pointer-events-none fixed inset-x-0 top-4 z-100 flex justify-center px-3 sm:top-5 sm:px-4">
                <section
                    class="pointer-events-auto flex w-full max-w-xl items-start gap-3 overflow-hidden rounded-3xl border border-white/10 border-l-4 bg-slate-950/96 px-4 py-4 text-white shadow-2xl ring-1 ring-slate-900/30 backdrop-blur-xl sm:px-5"
                    :class="toneClasses"
                    :role="ariaRole"
                    :aria-live="ariaLive"
                >
                    <span
                        class="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-lg sm:h-11 sm:w-11"
                        :class="iconClasses"
                        aria-hidden="true"
                    >
                        <svg v-if="snackbar.tone === 'success'" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
                            <path
                                fill-rule="evenodd"
                                d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.25 7.25a1 1 0 0 1-1.42 0L3.3 9.2a1 1 0 0 1 1.4-1.4l4.04 4.03L15.3 5.3a1 1 0 0 1 1.4 0Z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        <svg v-else-if="snackbar.tone === 'error'" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
                            <path
                                fill-rule="evenodd"
                                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-12.75a.9.9 0 0 1 .9.9v4.2a.9.9 0 1 1-1.8 0v-4.2a.9.9 0 0 1 .9-.9Zm0 9.25a1.05 1.05 0 1 0 0-2.1 1.05 1.05 0 0 0 0 2.1Z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        <svg v-else viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
                            <path
                                fill-rule="evenodd"
                                d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0ZM9 8a1 1 0 0 1 2 0v6a1 1 0 1 1-2 0V8Zm1-3a1.1 1.1 0 1 0 0 2.2A1.1 1.1 0 0 0 10 5Z"
                                clip-rule="evenodd"
                            />
                        </svg>
                    </span>

                    <div class="min-w-0 flex-1 pt-0.5">
                        <p class="text-label-2xs tracking-label font-bold uppercase opacity-75">
                            {{ eyebrowText }}
                        </p>
                        <p class="mt-1 text-base leading-6 font-semibold text-white sm:text-lg sm:leading-7">
                            {{ displayMessage }}
                        </p>
                    </div>

                    <button
                        type="button"
                        class="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-hidden"
                        @click="closeSnackbar"
                    >
                        <span class="sr-only">Dismiss notification</span>
                        <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                            <path
                                d="M5.22 5.22a.75.75 0 0 1 1.06 0L10 8.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L11.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 0-1.06Z"
                            />
                        </svg>
                    </button>
                </section>
            </div>
        </transition>
    </Teleport>
</template>
