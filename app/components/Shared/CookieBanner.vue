<script setup lang="ts">
const { accept, decline, isBannerVisible } = useCookieConsent()
const canRenderBanner = ref<boolean>(false)

onMounted(() => {
    window.setTimeout(() => {
        canRenderBanner.value = true
    }, 800)
})
</script>

<template>
    <Teleport to="body">
        <div v-if="canRenderBanner && isBannerVisible" class="fixed inset-x-0 bottom-0 z-90 px-4 pb-4 sm:px-6 lg:px-8">
            <section
                class="mx-auto w-full max-w-5xl rounded-3xl border border-slate-200 bg-white/95 p-4 text-slate-900 sm:p-5"
                role="dialog"
                aria-live="polite"
                aria-label="Cookie preferences"
            >
                <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div class="max-w-3xl">
                        <span
                            class="text-label-xs tracking-label-tight inline-flex min-h-8 items-center rounded-full border border-slate-300 bg-slate-50 px-3 font-semibold text-slate-700 uppercase"
                        >
                            Cookie preferences
                        </span>
                        <h2 class="mt-3 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                            We use necessary cookies to keep the shop working and analytics cookies to understand site usage.
                        </h2>
                        <p class="mt-2 text-sm leading-6 text-slate-600">
                            Analytics are optional and only start if you accept. Declining will not affect checkout, account access, or cart
                            features.
                            <NuxtLink to="/privacy" class="font-semibold text-slate-900 underline-offset-2 transition hover:underline">
                                Read the privacy policy
                            </NuxtLink>
                        </p>
                    </div>

                    <div class="grid gap-3 sm:grid-cols-2 lg:min-w-76">
                        <button
                            type="button"
                            class="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-950 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-hidden"
                            @click="accept"
                        >
                            Accept
                        </button>
                        <button
                            type="button"
                            class="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-hidden"
                            @click="decline"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            </section>
        </div>
    </Teleport>
</template>
