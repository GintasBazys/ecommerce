<script setup lang="ts">
import type { FetchError } from "ofetch"

import { usePostHog } from "~/composables/usePostHog"

const posthog = usePostHog()
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const loading = ref<boolean>(false)

interface SubscribeErrorPayload {
    statusCode?: number
    statusMessage?: string
    message?: string
}

function mapSubscribeError(message: string | null | undefined): string {
    if (!message) {
        return "Something went wrong. Please try again."
    }

    if (message.includes("Member Exists")) {
        return "This email is already subscribed to our newsletter."
    }

    if (message.includes("Invalid Resource") || message.toLowerCase().includes("email")) {
        return "Enter a valid email address to subscribe."
    }

    if (message === "Email is required.") {
        return "Enter your email address to subscribe."
    }

    return message.replace(/^Mailchimp error:\s*/i, "")
}

function getSubscribeErrorMessage(error: unknown): string {
    const err = error as FetchError<SubscribeErrorPayload>
    const payloadMessage = err.data?.statusMessage || err.data?.message
    const directMessage = err.statusMessage
    const fallbackMessage = err.message && !err.message.startsWith("[") ? err.message : null

    return mapSubscribeError(payloadMessage || directMessage || fallbackMessage)
}

async function handleSubscribe(e: Event): Promise<void> {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const email = formData.get("email")

    errorMessage.value = null
    successMessage.value = null

    try {
        loading.value = true

        const response = await $fetch<{ success: boolean; message: string }>("/api/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        })

        if (response.success) {
            successMessage.value = response.message
            posthog?.capture("newsletter_subscribed")
            form.reset()
        }
    } catch (error: unknown) {
        errorMessage.value = getSubscribeErrorMessage(error)
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <form class="rounded-3xl border border-white/15 bg-white/5 p-4 shadow-xl sm:p-5" @submit="handleSubscribe">
        <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] xl:items-end">
            <div>
                <p class="text-label-eyebrow tracking-label font-bold text-amber-100 uppercase">Newsletter</p>

                <h3 class="mt-2 text-2xl font-semibold tracking-tight text-white">Useful updates, not inbox noise.</h3>

                <p class="mt-2 max-w-xl text-sm leading-6 text-slate-200/85">
                    New arrivals, practical journal picks, and occasional offers — sent with a calmer weekly rhythm.
                </p>
            </div>

            <div>
                <label class="sr-only" for="footer-newsletter-email"> Email address </label>

                <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <input
                        id="footer-newsletter-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        class="min-h-12 w-full rounded-2xl border border-white/15 bg-white px-4 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
                        :aria-invalid="errorMessage ? 'true' : 'false'"
                        :aria-describedby="
                            errorMessage ? 'footer-newsletter-error' : successMessage ? 'footer-newsletter-success' : undefined
                        "
                        @input="
                            () => {
                                errorMessage = null
                                successMessage = null
                            }
                        "
                    />

                    <button type="submit" class="ui-btn-accent min-h-12 px-6 sm:min-w-36" :disabled="loading">
                        <span
                            v-if="loading"
                            class="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-900/35 border-t-slate-900"
                            aria-hidden="true"
                        ></span>

                        {{ loading ? "Joining..." : "Join" }}
                    </button>
                </div>

                <p v-if="errorMessage" id="footer-newsletter-error" class="mt-3 text-sm leading-6 text-rose-200">
                    {{ errorMessage }}
                </p>

                <p v-else-if="successMessage" id="footer-newsletter-success" class="mt-3 text-sm leading-6 text-emerald-200">
                    {{ successMessage }}
                </p>

                <p v-else class="mt-3 text-sm leading-6 text-slate-300/80">No spam. Just useful updates and better offers.</p>
            </div>
        </div>
    </form>
</template>
