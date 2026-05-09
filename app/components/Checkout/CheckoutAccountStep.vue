<script setup lang="ts">
import type { AuthTab, GuestErrors, LoginErrors, RegisterErrors } from "~/types/checkout"
import type { TurnstileWidgetInstance } from "~/types/forms"

import BaseButton from "~/components/Shared/BaseButton.vue"

const props = defineProps<{
    currentStep: string
    authTab: AuthTab
    identityCompleted: boolean
    isGuestIdentity: boolean
    checkoutIdentity: string
    loginEmail: string
    loginPassword: string
    regFirstName: string
    regLastName: string
    regEmail: string
    regPassword: string
    guestEmail: string
    loginErrors: LoginErrors
    registerErrors: RegisterErrors
    guestErrors: GuestErrors
    turnstileSiteKey: string
    loginTurnstileToken: string
    registerTurnstileToken: string
    loginTurnstileResetKey: number
    registerTurnstileResetKey: number
    isSubmitting: boolean
    isAuthLoading: boolean
}>()

const emit = defineEmits<{
    "update:authTab": [value: AuthTab]
    "update:loginEmail": [value: string]
    "update:loginPassword": [value: string]
    "update:regFirstName": [value: string]
    "update:regLastName": [value: string]
    "update:regEmail": [value: string]
    "update:regPassword": [value: string]
    "update:loginTurnstileToken": [value: string]
    "update:registerTurnstileToken": [value: string]
    "update:guestEmail": [value: string]
    "turnstile-error": [target: "login" | "register", message: string]
    "submit-login": []
    "submit-register": []
    "submit-guest": []
    "social-login": [provider: "google" | "facebook"]
    "change-identity": []
}>()

const loginTurnstileWidget = ref<TurnstileWidgetInstance | null>(null)
const registerTurnstileWidget = ref<TurnstileWidgetInstance | null>(null)
const showLoginTurnstileVerification = ref<boolean>(false)
const showRegisterTurnstileVerification = ref<boolean>(false)

function getInputValue(event: Event): string {
    return event.target instanceof HTMLInputElement ? event.target.value : ""
}

const tabBaseClass =
    "min-h-11 rounded-full px-4 text-sm font-semibold transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200"

const requestUrl = useRequestURL()
const socialIconBaseUrl = computed<string>(() => (import.meta.client ? window.location.origin : requestUrl.origin))
const googleIconUrl = computed<string>(() => `${socialIconBaseUrl.value}/images/google_login_icon.svg`)
const facebookIconUrl = computed<string>(() => `${socialIconBaseUrl.value}/images/facebook_login_icon.svg`)

async function executeLoginTurnstile(): Promise<string> {
    if (props.loginTurnstileToken) {
        return props.loginTurnstileToken
    }

    showLoginTurnstileVerification.value = true
    await nextTick()

    return await loginTurnstileWidget.value?.execute() || ""
}

async function executeRegisterTurnstile(): Promise<string> {
    if (props.registerTurnstileToken) {
        return props.registerTurnstileToken
    }

    showRegisterTurnstileVerification.value = true
    await nextTick()

    return await registerTurnstileWidget.value?.execute() || ""
}

defineExpose({ executeLoginTurnstile, executeRegisterTurnstile })
</script>

<template>
    <section class="grid gap-4">
        <div>
            <span
                class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
            >
                Step 1
            </span>
            <h2
                class="mt-4 text-3xl leading-tight font-semibold tracking-tight"
                :class="currentStep === 'account' ? 'text-slate-950' : 'text-slate-900'"
            >
                Account or guest
            </h2>
            <p class="mt-3 text-sm leading-7 text-slate-600 sm:text-base">Choose the quickest way to continue with this order.</p>
        </div>

        <div
            v-if="identityCompleted"
            class="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-linear-to-b from-white to-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
            <div>
                <span
                    class="text-label-xs tracking-label inline-flex min-h-8 items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-bold text-amber-900 uppercase"
                >
                    Ready for checkout
                </span>
                <strong class="mt-3 block text-base font-semibold text-slate-950">Checkout identity ready</strong>
                <p class="mt-1 text-sm leading-6 text-slate-600">{{ checkoutIdentity }}</p>
            </div>
            <div v-if="isGuestIdentity" class="flex flex-col gap-3 sm:flex-row">
                <BaseButton
                    type="button"
                    class="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:border-amber-300 hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
                    @click="emit('change-identity')"
                >
                    Sign in or create account
                </BaseButton>
            </div>
        </div>

        <div
            v-else
            class="rounded-3xl border border-white/80 bg-linear-to-b from-white to-slate-50 p-5 sm:p-6"
        >
            <div class="rounded-card border border-slate-200/80 bg-white/90 p-4 sm:p-5">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p class="text-label-xs tracking-label font-bold text-slate-500 uppercase">Checkout access</p>
                        <h3 class="mt-2 text-lg font-semibold tracking-tight text-slate-950">Choose how you want to continue</h3>
                    </div>
                    <p class="text-sm leading-6 text-slate-600">Sign in faster, create an account, or finish as a guest.</p>
                </div>
            </div>

            <div class="mt-5 grid gap-2 rounded-3xl border border-slate-200/80 bg-slate-950 p-2 sm:grid-cols-3">
                <BaseButton
                    type="button"
                    :class="[
                        tabBaseClass,
                        authTab === 'login' ? 'bg-accent-500 text-slate-950' : 'text-amber-100 hover:bg-white/8 hover:text-white'
                    ]"
                    @click="emit('update:authTab', 'login')"
                >
                    Login
                </BaseButton>
                <BaseButton
                    type="button"
                    :class="[
                        tabBaseClass,
                        authTab === 'register' ? 'bg-accent-500 text-slate-950' : 'text-amber-100 hover:bg-white/8 hover:text-white'
                    ]"
                    @click="emit('update:authTab', 'register')"
                >
                    Create account
                </BaseButton>
                <BaseButton
                    type="button"
                    :class="[
                        tabBaseClass,
                        authTab === 'guest' ? 'bg-accent-500 text-slate-950' : 'text-amber-100 hover:bg-white/8 hover:text-white'
                    ]"
                    @click="emit('update:authTab', 'guest')"
                >
                    Guest
                </BaseButton>
            </div>

            <div class="mt-5">
                <div v-if="authTab === 'login'" class="grid gap-5">
                    <div class="grid gap-3">
                        <BaseButton
                            type="button"
                            class="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-hidden"
                            @click="emit('social-login', 'google')"
                        >
                            <img :src="googleIconUrl" width="24" height="24" alt="" aria-hidden="true" class="block h-6 w-6 shrink-0" />
                            <span class="inline-flex items-center leading-none">Log in with Google</span>
                        </BaseButton>
                        <BaseButton
                            type="button"
                            class="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-hidden"
                            @click="emit('social-login', 'facebook')"
                        >
                            <img :src="facebookIconUrl" width="24" height="24" alt="" aria-hidden="true" class="block h-6 w-6 shrink-0" />
                            <span class="inline-flex items-center leading-none">Log in with Facebook</span>
                        </BaseButton>
                    </div>

                    <div class="relative text-center text-sm text-slate-500">
                        <div class="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-200"></div>
                        <span class="relative bg-slate-50 px-3"
                        >Or continue with email</span
                        >
                    </div>

                    <form class="grid gap-4" novalidate @submit.prevent="emit('submit-login')">
                        <label class="grid gap-2">
                            <span class="text-sm font-semibold text-slate-900">Email</span>
                            <input
                                id="checkout-login-email"
                                name="email"
                                :value="loginEmail"
                                type="email"
                                autocomplete="email"
                                inputmode="email"
                                autocapitalize="none"
                                spellcheck="false"
                                class="ui-input rounded-2xl"
                                :class="loginErrors.email ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                                @input="emit('update:loginEmail', getInputValue($event))"
                            />
                            <span v-if="loginErrors.email" class="block text-sm leading-6 text-rose-600">{{
                                loginErrors.email
                            }}</span>
                        </label>

                        <label class="grid gap-2">
                            <span class="text-sm font-semibold text-slate-900">Password</span>
                            <input
                                id="checkout-login-password"
                                name="password"
                                :value="loginPassword"
                                type="password"
                                autocomplete="current-password"
                                class="ui-input rounded-2xl"
                                :class="loginErrors.password ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                                @input="emit('update:loginPassword', getInputValue($event))"
                            />
                            <span v-if="loginErrors.password" class="block text-sm leading-6 text-rose-600">
                                {{ loginErrors.password }}
                            </span>
                        </label>

                        <div>
                            <FormsTurnstileWidget
                                v-if="showLoginTurnstileVerification"
                                ref="loginTurnstileWidget"
                                :site-key="turnstileSiteKey"
                                action="login"
                                appearance="execute"
                                execution="execute"
                                :reset-key="loginTurnstileResetKey"
                                :model-value="loginTurnstileToken"
                                @update:model-value="emit('update:loginTurnstileToken', $event)"
                                @error="emit('turnstile-error', 'login', $event)"
                                @expired="emit('turnstile-error', 'login', $event)"
                            />
                            <p v-if="loginErrors.verification" class="text-sm leading-6 text-rose-600">
                                {{ loginErrors.verification }}
                            </p>
                        </div>

                        <BaseButton
                            type="submit"
                            class="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60"
                            :disabled="isSubmitting || isAuthLoading"
                        >
                            {{ isSubmitting || isAuthLoading ? "Logging in..." : "Log in and continue" }}
                        </BaseButton>
                    </form>
                </div>

                <form v-else-if="authTab === 'register'" class="grid gap-4" novalidate @submit.prevent="emit('submit-register')">
                    <div class="grid gap-4 sm:grid-cols-2">
                        <label class="grid gap-2">
                            <span class="text-sm font-semibold text-slate-900">First name</span>
                            <input
                                id="checkout-first-name"
                                name="given-name"
                                :value="regFirstName"
                                type="text"
                                autocomplete="given-name"
                                class="ui-input rounded-2xl"
                                :class="registerErrors.first_name ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                                @input="emit('update:regFirstName', getInputValue($event))"
                            />
                            <span v-if="registerErrors.first_name" class="block text-sm leading-6 text-rose-600">
                                {{ registerErrors.first_name }}
                            </span>
                        </label>

                        <label class="grid gap-2">
                            <span class="text-sm font-semibold text-slate-900">Last name</span>
                            <input
                                id="checkout-last-name"
                                name="family-name"
                                :value="regLastName"
                                type="text"
                                autocomplete="family-name"
                                class="ui-input rounded-2xl"
                                :class="registerErrors.last_name ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                                @input="emit('update:regLastName', getInputValue($event))"
                            />
                            <span v-if="registerErrors.last_name" class="block text-sm leading-6 text-rose-600">
                                {{ registerErrors.last_name }}
                            </span>
                        </label>
                    </div>

                    <label class="grid gap-2">
                        <span class="text-sm font-semibold text-slate-900">Email</span>
                        <input
                            id="checkout-register-email"
                            name="email"
                            :value="regEmail"
                            type="email"
                            autocomplete="email"
                            inputmode="email"
                            autocapitalize="none"
                            spellcheck="false"
                            class="ui-input rounded-2xl"
                            :class="registerErrors.email ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                            @input="emit('update:regEmail', getInputValue($event))"
                        />
                        <span v-if="registerErrors.email" class="block text-sm leading-6 text-rose-600">{{
                            registerErrors.email
                        }}</span>
                    </label>

                    <label class="grid gap-2">
                        <span class="text-sm font-semibold text-slate-900">Password</span>
                        <input
                            id="checkout-register-password"
                            name="new-password"
                            :value="regPassword"
                            type="password"
                            autocomplete="new-password"
                            class="ui-input rounded-2xl"
                            :class="registerErrors.password ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                            @input="emit('update:regPassword', getInputValue($event))"
                        />
                        <span v-if="registerErrors.password" class="block text-sm leading-6 text-rose-600">
                            {{ registerErrors.password }}
                        </span>
                    </label>

                    <div>
                        <FormsTurnstileWidget
                            v-if="showRegisterTurnstileVerification"
                            ref="registerTurnstileWidget"
                            :site-key="turnstileSiteKey"
                            action="register"
                            appearance="execute"
                            execution="execute"
                            :reset-key="registerTurnstileResetKey"
                            :model-value="registerTurnstileToken"
                            @update:model-value="emit('update:registerTurnstileToken', $event)"
                            @error="emit('turnstile-error', 'register', $event)"
                            @expired="emit('turnstile-error', 'register', $event)"
                        />
                        <p v-if="registerErrors.verification" class="text-sm leading-6 text-rose-600">
                            {{ registerErrors.verification }}
                        </p>
                    </div>

                    <BaseButton
                        type="submit"
                        class="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60"
                        :disabled="isSubmitting || isAuthLoading"
                    >
                        {{ isSubmitting || isAuthLoading ? "Creating account..." : "Create account and continue" }}
                    </BaseButton>
                </form>

                <form v-else class="grid gap-4" novalidate @submit.prevent="emit('submit-guest')">
                    <div class="rounded-3xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm leading-6 text-slate-700">
                        Guest checkout is faster now, and you can still create an account after the order if you want.
                    </div>

                    <label class="grid gap-2">
                        <span class="text-sm font-semibold text-slate-900">Email</span>
                        <input
                            id="checkout-guest-email"
                            name="email"
                            :value="guestEmail"
                            type="email"
                            autocomplete="email"
                            inputmode="email"
                            autocapitalize="none"
                            spellcheck="false"
                            class="ui-input rounded-2xl"
                            :class="guestErrors.email ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                            @input="emit('update:guestEmail', getInputValue($event))"
                        />
                        <span v-if="guestErrors.email" class="block text-sm leading-6 text-rose-600">{{
                            guestErrors.email
                        }}</span>
                    </label>

                    <BaseButton
                        type="submit"
                        class="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60"
                        :disabled="isSubmitting"
                    >
                        {{ isSubmitting ? "Continuing..." : "Continue as guest" }}
                    </BaseButton>
                </form>
            </div>
        </div>
    </section>
</template>
