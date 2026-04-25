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
    const fallbackMessage = !err.message.startsWith("[") ? err.message : null

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
        const response = await $fetch("/api/subscribe", {
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
    <section class="bg-linear-to-b from-slate-50 to-slate-100 px-4 py-12 sm:px-6 lg:py-20">
        <div class="mx-auto w-full max-w-7xl">
            <div
                class="shadow-panel grid gap-6 rounded-4xl border border-white/80 bg-linear-to-b from-white/95 to-slate-50/90 p-4 lg:grid-cols-2 lg:p-6"
            >
                <div class="rounded-3xl border border-slate-200/90 bg-linear-to-b from-white to-slate-50 p-6">
                    <span
                        class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                    >
                        Newsletter
                    </span>
                    <h2 class="mt-4 max-w-lg text-4xl leading-tight font-bold tracking-tighter text-slate-900 sm:text-5xl lg:text-6xl">
                        Thoughtful product updates, useful reads, and selective offers.
                    </h2>
                    <p class="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                        Stay close to new arrivals, editorial picks, and occasional promotions in a more refined weekly email that fits the
                        premium storefront experience.
                    </p>

                    <ul class="mt-6 grid gap-3">
                        <li class="flex items-start gap-3 text-base leading-7 text-slate-700">
                            <span class="bg-accent-700 mt-2 h-2 w-2 shrink-0 rounded-full"></span>
                            <span>Early access to curated arrivals</span>
                        </li>
                        <li class="flex items-start gap-3 text-base leading-7 text-slate-700">
                            <span class="bg-accent-700 mt-2 h-2 w-2 shrink-0 rounded-full"></span>
                            <span>Practical journal highlights and product stories</span>
                        </li>
                        <li class="flex items-start gap-3 text-base leading-7 text-slate-700">
                            <span class="bg-accent-700 mt-2 h-2 w-2 shrink-0 rounded-full"></span>
                            <span>Occasional offers without inbox noise</span>
                        </li>
                    </ul>

                    <div class="mt-6 grid gap-3 sm:grid-cols-2">
                        <div class="rounded-2xl border border-slate-200 bg-white p-4">
                            <span class="text-label-xs tracking-label block font-bold text-slate-500 uppercase">Weekly rhythm</span>
                            <strong class="mt-2 block text-base font-semibold text-slate-900"
                            >Clearer updates, not constant campaigns</strong
                            >
                        </div>
                        <div class="rounded-2xl border border-slate-200 bg-white p-4">
                            <span class="text-label-xs tracking-label block font-bold text-slate-500 uppercase">Store focus</span>
                            <strong class="mt-2 block text-base font-semibold text-slate-900"
                            >New products, better offers, useful guidance</strong
                            >
                        </div>
                    </div>
                </div>

                <div class="flex">
                    <form
                        class="shadow-card w-full rounded-3xl border border-slate-200/90 bg-linear-to-b from-white to-slate-50 p-6"
                        @submit="handleSubscribe"
                    >
                        <div class="mb-5">
                            <span
                                class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                            >
                                Join the list
                            </span>
                            <h3 class="mt-4 text-2xl leading-tight font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Receive a calmer, more premium inbox update.
                            </h3>
                            <p class="mt-3 text-base leading-7 text-slate-600">
                                One field, one clear action, and a lighter sign-up experience that matches the rest of the site.
                            </p>
                        </div>

                        <label class="mb-2 inline-block text-sm font-semibold text-slate-900" for="newsletter-email">Email address</label>
                        <div class="grid gap-3 sm:grid-cols-2 sm:items-start">
                            <input
                                id="newsletter-email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                required
                                class="min-h-13 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-900 shadow-xs placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
                                :aria-invalid="errorMessage ? 'true' : 'false'"
                                :aria-describedby="errorMessage ? 'newsletter-error' : successMessage ? 'newsletter-success' : undefined"
                                @input="
                                    () => {
                                        errorMessage = null
                                        successMessage = null
                                    }
                                "
                            />
                            <button type="submit" class="ui-btn-accent min-h-13 px-6 sm:min-w-40" :disabled="loading">
                                <span
                                    v-if="loading"
                                    class="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-900/35 border-t-slate-900"
                                    aria-hidden="true"
                                ></span>
                                {{ loading ? "Subscribing..." : "Subscribe" }}
                            </button>
                        </div>

                        <p v-if="errorMessage" id="newsletter-error" class="mt-3 text-sm leading-6 text-rose-700">
                            {{ errorMessage }}
                        </p>
                        <p v-if="successMessage" class="mt-3 text-sm leading-6 text-emerald-700">
                            <span id="newsletter-success">{{ successMessage }}</span>
                        </p>
                        <p class="mt-3 text-sm leading-6 text-slate-500">
                            No spam. Just useful updates, better offers, and the occasional standout story.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </section>
</template>
