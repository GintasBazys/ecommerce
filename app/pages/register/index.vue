<script setup lang="ts">
import type { CustomerResponseInterface } from "@/types/interfaces"

import { usePostHog } from "~/composables/usePostHog"

useHead({
    title: "Register | Medusa Commerce"
})

definePageMeta({
    layout: "default"
})

const router = useRouter()
const config = useRuntimeConfig()
const posthog = usePostHog()
const turnstileSiteKey = computed(() => String(config.public.TURNSTILE_SITE_KEY || ""))
const turnstileToken = ref<string>("")
const turnstileResetKey = ref<number>(0)
const showTurnstileVerification = ref<boolean>(false)

type TurnstileWidgetInstance = {
    execute: () => Promise<string>
}

const turnstileWidget = ref<TurnstileWidgetInstance | null>(null)

const isLoading = ref<boolean>(false)
const { showSnackbar } = useSnackbar()

const firstName = ref<string>("")
const lastName = ref<string>("")
const email = ref<string>("")
const password = ref<string>("")
const formErrors = ref<{ firstName: string; lastName: string; email: string; password: string; verification: string }>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    verification: ""
})

function showNotification(message: string, tone: "success" | "error"): void {
    showSnackbar(message, tone)
}

function resetTurnstile(): void {
    turnstileToken.value = ""
    turnstileResetKey.value += 1
}

function handleTurnstileToken(token: string): void {
    turnstileToken.value = token
    formErrors.value.verification = ""
}

function handleTurnstileError(message: string): void {
    turnstileToken.value = ""
    formErrors.value.verification = message
}

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function validateForm(): boolean {
    formErrors.value = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        verification: ""
    }

    let isValid = true

    if (!firstName.value.trim()) {
        formErrors.value.firstName = "First name is required"
        isValid = false
    }

    if (!lastName.value.trim()) {
        formErrors.value.lastName = "Last name is required"
        isValid = false
    }

    if (!email.value.trim()) {
        formErrors.value.email = "E-mail is required"
        isValid = false
    } else if (!isValidEmail(email.value)) {
        formErrors.value.email = "E-mail must be valid"
        isValid = false
    }

    if (!password.value) {
        formErrors.value.password = "Password is required"
        isValid = false
    } else if (password.value.length < 6) {
        formErrors.value.password = "Password must be at least 6 characters"
        isValid = false
    }

    if (!turnstileSiteKey.value) {
        formErrors.value.verification = "Security verification is currently unavailable. Please try again later."
        isValid = false
    }

    return isValid
}

function getErrorMessage(error: unknown): string {
    if (error && typeof error === "object") {
        const data = "data" in error ? error.data : undefined

        if (data && typeof data === "object" && "statusMessage" in data && typeof data.statusMessage === "string") {
            if (data.statusMessage === "Verification failed" || data.statusMessage === "Security verification failed") {
                return "Security verification failed. Please complete the challenge and try again."
            }

            return data.statusMessage
        }
    }

    return "Register failed. Please check your details and try again."
}

async function handleRegister(): Promise<void> {
    if (isLoading.value) {
        return
    }

    if (!validateForm()) {
        return
    }

    isLoading.value = true

    try {
        if (!turnstileToken.value) {
            showTurnstileVerification.value = true
            await nextTick()

            try {
                turnstileToken.value = await turnstileWidget.value?.execute() || ""
            } catch (error) {
                formErrors.value.verification =
                    error instanceof Error ? error.message : "Security verification failed. Please complete the challenge and try again."
                return
            }

            if (!turnstileToken.value) {
                formErrors.value.verification = "Security verification failed. Please complete the challenge and try again."
                return
            }
        }

        const response = await $fetch<CustomerResponseInterface>("/api/account/register", {
            method: "POST",
            body: {
                email: email.value,
                password: password.value,
                first_name: firstName.value,
                last_name: lastName.value,
                turnstileToken: turnstileToken.value
            }
        })

        useCustomerStore().customer = response.customer
        posthog?.identify(email.value, {
            email: email.value,
            first_name: firstName.value,
            last_name: lastName.value
        })
        posthog?.capture("user_registered", { email: email.value })
        await router.push("/")
    } catch (error: unknown) {
        console.error("Register failed:", error)
        showNotification(getErrorMessage(error), "error")
        resetTurnstile()
    } finally {
        isLoading.value = false
    }
}

</script>

<template>
    <main class="min-h-screen bg-linear-to-b from-slate-50 via-indigo-50 to-orange-50 text-slate-900">
        <section class="mx-auto w-full max-w-6xl px-4 pt-6 pb-14 sm:px-6 lg:px-8 lg:pt-10">
            <div class="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
                <div class="space-y-6">
                    <span
                        class="inline-flex min-h-9 items-center rounded-full border border-slate-300/90 bg-white/80 px-4 text-xs font-semibold tracking-widest text-slate-700 uppercase"
                    >
                        Create an account
                    </span>
                    <h1 class="max-w-sm text-4xl leading-none font-semibold tracking-tight text-slate-950 sm:text-6xl">
                        Join the shop and keep every order detail in one calm place.
                    </h1>
                    <p class="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                        Save your profile, move through checkout faster, and make future orders feel easier from the very first click.
                    </p>

                    <div class="rounded-3xl border border-slate-200 bg-white/85 p-4 sm:p-5">
                        <p class="text-xs font-medium tracking-widest text-slate-500 uppercase">Why create one?</p>
                        <p class="mt-1 text-sm leading-6 font-semibold text-slate-900 sm:text-base">
                            Saved customer details, easier reorders, and a smoother path from cart to delivery
                        </p>
                    </div>
                </div>

                <div class="rounded-3xl border border-slate-200/95 bg-white/95 p-5 sm:p-7">
                    <span
                        class="tracking-label-tight inline-flex min-h-9 items-center rounded-full border border-slate-300/90 bg-slate-50 px-4 text-xs font-semibold text-slate-700 uppercase"
                    >
                        Account details
                    </span>
                    <h2 class="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                        Set up your profile in a minute.
                    </h2>
                    <p class="mt-3 text-sm leading-7 text-slate-600">
                        Add your basic information and choose a password to start shopping with a saved account.
                    </p>

                    <form class="mt-6 grid gap-4" @submit.prevent="handleRegister">
                        <div class="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label for="register-first-name" class="mb-1.5 block text-sm font-medium text-slate-700">First name</label>
                                <input
                                    id="register-first-name"
                                    v-model.trim="firstName"
                                    name="firstName"
                                    type="text"
                                    class="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-500 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                    :class="formErrors.firstName ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : ''"
                                    required
                                />
                                <p v-if="formErrors.firstName" class="mt-1 text-sm text-rose-600">{{ formErrors.firstName }}</p>
                            </div>

                            <div>
                                <label for="register-last-name" class="mb-1.5 block text-sm font-medium text-slate-700">Last name</label>
                                <input
                                    id="register-last-name"
                                    v-model.trim="lastName"
                                    name="lastName"
                                    type="text"
                                    class="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-500 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                    :class="formErrors.lastName ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : ''"
                                    required
                                />
                                <p v-if="formErrors.lastName" class="mt-1 text-sm text-rose-600">{{ formErrors.lastName }}</p>
                            </div>
                        </div>

                        <div>
                            <label for="register-email" class="mb-1.5 block text-sm font-medium text-slate-700">E-mail</label>
                            <input
                                id="register-email"
                                v-model.trim="email"
                                name="email"
                                type="email"
                                autocomplete="email"
                                class="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-500 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                :class="formErrors.email ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : ''"
                                required
                            />
                            <p v-if="formErrors.email" class="mt-1 text-sm text-rose-600">{{ formErrors.email }}</p>
                        </div>

                        <div>
                            <label for="register-password" class="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                            <input
                                id="register-password"
                                v-model="password"
                                name="password"
                                type="password"
                                autocomplete="new-password"
                                class="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-500 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                :class="formErrors.password ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : ''"
                                required
                            />
                            <p v-if="formErrors.password" class="mt-1 text-sm text-rose-600">{{ formErrors.password }}</p>
                        </div>

                        <div>
                            <FormsTurnstileWidget
                                v-if="showTurnstileVerification"
                                ref="turnstileWidget"
                                :site-key="turnstileSiteKey"
                                action="register"
                                appearance="execute"
                                execution="execute"
                                :reset-key="turnstileResetKey"
                                :model-value="turnstileToken"
                                @update:model-value="handleTurnstileToken"
                                @error="handleTurnstileError"
                                @expired="handleTurnstileError"
                            />
                            <p v-if="formErrors.verification" class="text-sm text-rose-600">{{ formErrors.verification }}</p>
                        </div>

                        <button
                            type="submit"
                            class="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-950 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-70"
                            :disabled="isLoading"
                        >
                            {{ isLoading ? "Creating account..." : "Register" }}
                        </button>
                    </form>

                    <p class="mt-5 text-center text-sm text-slate-600">
                        Already have an account?
                        <NuxtLink to="/signin" class="font-semibold text-slate-900 underline-offset-2 transition hover:underline">
                            Login here
                        </NuxtLink>
                    </p>
                </div>
            </div>
        </section>

    </main>
</template>
