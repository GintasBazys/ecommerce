<script setup lang="ts">
import { usePostHog } from "~/composables/usePostHog"

useHead({ title: "Signin | Medusa Commerce" })
definePageMeta({ layout: "default" })

const router = useRouter()
const config = useRuntimeConfig()

const showResetDialog = ref<boolean>(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const loginErrors = ref<{ email: string; password: string; verification: string }>({ email: "", password: "", verification: "" })
const resetEmailError = ref<string>("")

const snackbar = ref<boolean>(false)
const snackbarText = ref<string>("")
const snackbarTone = ref<"success" | "error">("success")
const snackbarTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const loginEmail = ref<string>("")
const loginPassword = ref<string>("")
const loginTurnstileToken = ref<string>("")
const loginTurnstileResetKey = ref<number>(0)

const resetEmail = ref<string>("")

const auth = useCustomerAuth()
const posthog = usePostHog()
const turnstileSiteKey = computed(() => String(config.public.TURNSTILE_SITE_KEY || ""))

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function showSnackbar(message: string, tone: "success" | "error"): void {
    snackbarText.value = message
    snackbarTone.value = tone
    snackbar.value = true

    if (snackbarTimer.value) {
        clearTimeout(snackbarTimer.value)
    }

    snackbarTimer.value = setTimeout(() => {
        snackbar.value = false
    }, 4000)
}

async function handleLogin(): Promise<void> {
    loginErrors.value = { email: "", password: "", verification: "" }

    if (!loginEmail.value) {
        loginErrors.value.email = "E-mail is required"
    } else if (!isValidEmail(loginEmail.value)) {
        loginErrors.value.email = "E-mail must be valid"
    }

    if (!loginPassword.value) {
        loginErrors.value.password = "Password is required"
    }

    if (!turnstileSiteKey.value) {
        loginErrors.value.verification = "Verification is currently unavailable. Please try again later."
    } else if (!loginTurnstileToken.value) {
        loginErrors.value.verification = "Complete verification before logging in."
    }

    if (loginErrors.value.email || loginErrors.value.password || loginErrors.value.verification) {
        return
    }

    const customer = await auth.login(loginEmail.value, loginPassword.value, {
        loadCart: true,
        turnstileToken: loginTurnstileToken.value
    })
    if (!customer) {
        loginTurnstileToken.value = ""
        loginTurnstileResetKey.value += 1
        showSnackbar("Login failed", "error")
        return
    }

    posthog?.identify(loginEmail.value, { email: loginEmail.value })
    posthog?.capture("user_signed_in", { method: "email" })

    await router.push("/")
}

function handleTurnstileToken(token: string): void {
    loginTurnstileToken.value = token
    loginErrors.value.verification = ""
}

function handleTurnstileError(message: string): void {
    loginErrors.value.verification = message
}

async function handleSocialLogin(provider: "google" | "facebook") {
    posthog?.capture("user_signed_in", { method: provider })
    await auth.startSocialLogin(provider, "/")
}

async function handleReset(): Promise<void> {
    resetEmailError.value = ""

    if (!resetEmail.value) {
        resetEmailError.value = "E-mail is required"
        return
    }

    if (!isValidEmail(resetEmail.value)) {
        resetEmailError.value = "E-mail must be valid"
        return
    }

    try {
        errorMessage.value = null
        successMessage.value = null

        await $fetch("/api/account/password-reset", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: resetEmail.value })
        })

        successMessage.value = "Password reset email sent"
        showSnackbar(successMessage.value, "success")

        showResetDialog.value = false
        resetEmail.value = ""
    } catch {
        errorMessage.value = "An unexpected error occurred. Please try again."
        showSnackbar(errorMessage.value, "error")
    }
}

onBeforeUnmount(() => {
    if (snackbarTimer.value) {
        clearTimeout(snackbarTimer.value)
    }
})
</script>

<template>
    <main class="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_38%,#fff7ed_100%)] text-slate-900">
        <section class="mx-auto w-full max-w-6xl px-4 pt-6 pb-14 sm:px-6 lg:px-8 lg:pt-10">
            <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-8">
                <div class="space-y-6">
                    <span
                        class="inline-flex min-h-9 items-center rounded-full border border-slate-300/90 bg-white/80 px-4 text-xs font-semibold tracking-[0.13em] text-slate-700 uppercase"
                    >
                        Welcome back
                    </span>
                    <h1 class="max-w-[13ch] text-4xl leading-[0.95] font-semibold tracking-[-0.03em] text-slate-950 sm:text-6xl">
                        Sign in to pick up your order exactly where you left it.
                    </h1>
                    <p class="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                        Access your saved details, revisit recent orders, and move from cart to checkout with less friction.
                    </p>
                    <div class="rounded-3xl border border-slate-200 bg-white/85 p-4 sm:p-5">
                        <p class="text-xs font-medium tracking-widest text-slate-500 uppercase">Member access</p>
                        <p class="mt-1 text-sm leading-6 font-semibold text-slate-900 sm:text-base">
                            Faster checkout, order history, and saved profile details
                        </p>
                    </div>
                </div>

                <div class="rounded-panel border border-slate-200/95 bg-white/95 p-5 sm:p-7">
                    <div>
                        <span
                            class="tracking-label-tight inline-flex min-h-9 items-center rounded-full border border-slate-300/90 bg-slate-50 px-4 text-xs font-semibold text-slate-700 uppercase"
                        >
                            Account login
                        </span>
                        <h2 class="mt-4 text-2xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-[2rem]">
                            Enter your details and continue.
                        </h2>
                        <p class="mt-3 text-sm leading-7 text-slate-600">
                            Use social sign-in or your email and password. You can reset access anytime.
                        </p>
                    </div>

                    <div class="mt-6 grid gap-3">
                        <button
                            type="button"
                            class="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-hidden"
                            @click="handleSocialLogin('google')"
                        >
                            <img src="/images/google_login_icon.svg" width="24" height="24" alt="" aria-hidden="true" />
                            Log in with Google
                        </button>
                        <button
                            type="button"
                            class="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-hidden"
                            @click="handleSocialLogin('facebook')"
                        >
                            <img src="/images/facebook_login_icon.svg" width="24" height="24" alt="" aria-hidden="true" />
                            Log in with Facebook
                        </button>
                    </div>

                    <div class="relative my-6 text-center text-xs font-medium tracking-[0.08em] text-slate-500 uppercase">
                        <span class="absolute inset-x-0 top-1/2 z-0 border-t border-slate-200" aria-hidden="true"></span>
                        <span class="relative z-10 bg-white px-3">Or continue with email</span>
                    </div>

                    <form class="grid gap-4" @submit.prevent="handleLogin">
                        <div>
                            <label for="signin-email" class="mb-1.5 block text-sm font-medium text-slate-700">E-mail</label>
                            <input
                                id="signin-email"
                                v-model.trim="loginEmail"
                                name="email"
                                type="email"
                                autocomplete="email"
                                class="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-500 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                :class="loginErrors.email ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : ''"
                                required
                            />
                            <p v-if="loginErrors.email" class="mt-1 text-sm text-rose-600">{{ loginErrors.email }}</p>
                        </div>

                        <div>
                            <label for="signin-password" class="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                            <input
                                id="signin-password"
                                v-model="loginPassword"
                                name="password"
                                type="password"
                                autocomplete="current-password"
                                class="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-500 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                :class="loginErrors.password ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : ''"
                                required
                            />
                            <p v-if="loginErrors.password" class="mt-1 text-sm text-rose-600">{{ loginErrors.password }}</p>
                        </div>

                        <div class="flex justify-end">
                            <button
                                type="button"
                                class="text-sm font-semibold text-slate-700 transition hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:outline-hidden"
                                @click="showResetDialog = true"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <div>
                            <FormsTurnstileWidget
                                :site-key="turnstileSiteKey"
                                action="login"
                                :reset-key="loginTurnstileResetKey"
                                :model-value="loginTurnstileToken"
                                @update:model-value="handleTurnstileToken"
                                @error="handleTurnstileError"
                                @expired="handleTurnstileError"
                            />
                            <p v-if="loginErrors.verification" class="mt-1 text-sm text-rose-600">{{ loginErrors.verification }}</p>
                        </div>

                        <button
                            type="submit"
                            class="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-950 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-hidden"
                        >
                            Log in
                        </button>
                    </form>

                    <p class="mt-5 text-center text-sm text-slate-600">
                        Don't have an account?
                        <NuxtLink to="/register" class="font-semibold text-slate-900 underline-offset-2 transition hover:underline">
                            Register here
                        </NuxtLink>
                    </p>
                </div>
            </div>
        </section>

        <Teleport to="body">
            <div
                v-if="showResetDialog"
                class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
                role="presentation"
                @click.self="showResetDialog = false"
            >
                <section
                    class="w-full max-w-xl rounded-[1.6rem] border border-slate-200 bg-white p-5 sm:p-7"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="reset-password-title"
                >
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <span
                                class="inline-flex min-h-8 items-center rounded-full border border-slate-300 bg-slate-50 px-3 text-[11px] font-semibold tracking-[0.11em] text-slate-700 uppercase"
                            >
                                Password reset
                            </span>
                            <h2 id="reset-password-title" class="mt-3 text-2xl font-semibold tracking-[-0.02em] text-slate-950">
                                Forgot your password?
                            </h2>
                        </div>
                        <button
                            type="button"
                            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-hidden"
                            @click="showResetDialog = false"
                        >
                            <span aria-hidden="true">×</span>
                            <span class="sr-only">Close password reset dialog</span>
                        </button>
                    </div>

                    <p class="mt-4 text-sm leading-7 text-slate-600">
                        Enter your email and we will send a reset link so you can get back into your account.
                    </p>

                    <form class="mt-5 grid gap-4" @submit.prevent="handleReset">
                        <div>
                            <label for="reset-email" class="mb-1.5 block text-sm font-medium text-slate-700">E-mail address</label>
                            <input
                                id="reset-email"
                                v-model.trim="resetEmail"
                                type="email"
                                autocomplete="email"
                                class="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-500 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                :class="resetEmailError ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : ''"
                                required
                            />
                            <p v-if="resetEmailError" class="mt-1 text-sm text-rose-600">{{ resetEmailError }}</p>
                        </div>

                        <button
                            type="submit"
                            class="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-950 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-hidden"
                        >
                            Send reset link
                        </button>
                    </form>
                </section>
            </div>
        </Teleport>

        <div v-if="snackbar" class="pointer-events-none fixed inset-x-0 top-5 z-50 flex justify-center px-4">
            <p
                class="pointer-events-auto rounded-full border px-5 py-2 text-sm font-medium"
                :class="
                    snackbarTone === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                "
                role="status"
                aria-live="polite"
            >
                {{ snackbarText }}
            </p>
        </div>
    </main>
</template>
