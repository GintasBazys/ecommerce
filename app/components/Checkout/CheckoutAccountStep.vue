<script setup lang="ts">
type LoginErrors = {
    email: string
    password: string
    verification: string
}

type RegisterErrors = {
    first_name: string
    last_name: string
    email: string
    password: string
    verification: string
}

type GuestErrors = {
    email: string
}

type AuthTab = "login" | "register" | "guest"

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

function getInputValue(event: Event): string {
    return event.target instanceof HTMLInputElement ? event.target.value : ""
}

const tabBaseClass =
    "min-h-11 rounded-full px-4 text-sm font-semibold transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200"

const requestUrl = useRequestURL()
const socialIconBaseUrl = computed<string>(() => (import.meta.client ? window.location.origin : requestUrl.origin))
const googleIconUrl = computed<string>(() => `${socialIconBaseUrl.value}/images/google_login_icon.svg`)
const facebookIconUrl = computed<string>(() => `${socialIconBaseUrl.value}/images/facebook_login_icon.svg`)
</script>

<template>
    <section class="grid gap-4">
        <div>
            <span
                class="inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 text-label-sm font-bold tracking-label text-amber-900 uppercase"
            >
                Step 1
            </span>
            <h2
                class="mt-4 text-[1.9rem] leading-[1.03] font-semibold tracking-[-0.04rem]"
                :class="props.currentStep === 'account' ? 'text-slate-950' : 'text-slate-900'"
            >
                Account or guest
            </h2>
            <p class="mt-3 text-sm leading-7 text-slate-600 sm:text-base">Choose the quickest way to continue with this order.</p>
        </div>

        <div
            v-if="props.identityCompleted"
            class="flex flex-col gap-4 rounded-[1.6rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 sm:flex-row sm:items-center sm:justify-between"
        >
            <div>
                <span
                    class="text-label-xs tracking-label inline-flex min-h-8 items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-bold text-amber-900 uppercase"
                >
                    Ready for checkout
                </span>
                <strong class="mt-3 block text-base font-semibold text-slate-950">Checkout identity ready</strong>
                <p class="mt-1 text-sm leading-6 text-slate-600">{{ props.checkoutIdentity }}</p>
            </div>
            <div v-if="props.isGuestIdentity" class="flex flex-col gap-3 sm:flex-row">
                <button
                    type="button"
                    class="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:border-amber-300 hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
                    @click="emit('change-identity')"
                >
                    Sign in or create account
                </button>
            </div>
        </div>

        <div
            v-else
            class="rounded-[1.6rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 sm:p-6"
        >
            <div class="rounded-card border border-slate-200/80 bg-white/90 p-4 sm:p-5">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p class="text-label-xs tracking-label font-bold text-slate-500 uppercase">Checkout access</p>
                        <h3 class="mt-2 text-lg font-semibold tracking-[-0.02em] text-slate-950">Choose how you want to continue</h3>
                    </div>
                    <p class="text-sm leading-6 text-slate-600">Sign in faster, create an account, or finish as a guest.</p>
                </div>
            </div>

            <div class="mt-5 grid gap-2 rounded-[1.2rem] border border-slate-200/80 bg-slate-950 p-2 sm:grid-cols-3">
                <button
                    type="button"
                    :class="[
                        tabBaseClass,
                        props.authTab === 'login' ? 'bg-accent-500 text-slate-950' : 'text-amber-100 hover:bg-white/8 hover:text-white'
                    ]"
                    @click="emit('update:authTab', 'login')"
                >
                    Login
                </button>
                <button
                    type="button"
                    :class="[
                        tabBaseClass,
                        props.authTab === 'register' ? 'bg-accent-500 text-slate-950' : 'text-amber-100 hover:bg-white/8 hover:text-white'
                    ]"
                    @click="emit('update:authTab', 'register')"
                >
                    Create account
                </button>
                <button
                    type="button"
                    :class="[
                        tabBaseClass,
                        props.authTab === 'guest' ? 'bg-accent-500 text-slate-950' : 'text-amber-100 hover:bg-white/8 hover:text-white'
                    ]"
                    @click="emit('update:authTab', 'guest')"
                >
                    Guest
                </button>
            </div>

            <div class="mt-5">
                <div v-if="props.authTab === 'login'" class="grid gap-5">
                    <div class="grid gap-3">
                        <button
                            type="button"
                            class="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-hidden"
                            @click="emit('social-login', 'google')"
                        >
                            <img :src="googleIconUrl" width="24" height="24" alt="" aria-hidden="true" class="block h-6 w-6 shrink-0" />
                            <span class="inline-flex items-center leading-none">Log in with Google</span>
                        </button>
                        <button
                            type="button"
                            class="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-hidden"
                            @click="emit('social-login', 'facebook')"
                        >
                            <img :src="facebookIconUrl" width="24" height="24" alt="" aria-hidden="true" class="block h-6 w-6 shrink-0" />
                            <span class="inline-flex items-center leading-none">Log in with Facebook</span>
                        </button>
                    </div>

                    <div class="relative text-center text-sm text-slate-500">
                        <div class="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-200"></div>
                        <span class="relative bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] px-3"
                        >Or continue with email</span
                        >
                    </div>

                    <form class="grid gap-4" novalidate @submit.prevent="emit('submit-login')">
                        <label class="grid gap-2">
                            <span class="text-sm font-semibold text-slate-900">Email</span>
                            <input
                                :value="props.loginEmail"
                                type="email"
                                autocomplete="email"
                                class="ui-input rounded-2xl"
                                :class="props.loginErrors.email ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                                @input="emit('update:loginEmail', getInputValue($event))"
                            />
                            <span v-if="props.loginErrors.email" class="block text-sm leading-6 text-rose-600">{{ props.loginErrors.email }}</span>
                        </label>

                        <label class="grid gap-2">
                            <span class="text-sm font-semibold text-slate-900">Password</span>
                            <input
                                :value="props.loginPassword"
                                type="password"
                                autocomplete="current-password"
                                class="ui-input rounded-2xl"
                                :class="props.loginErrors.password ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                                @input="emit('update:loginPassword', getInputValue($event))"
                            />
                            <span v-if="props.loginErrors.password" class="block text-sm leading-6 text-rose-600">
                                {{ props.loginErrors.password }}
                            </span>
                        </label>

                        <div>
                            <FormsTurnstileWidget
                                :site-key="props.turnstileSiteKey"
                                action="login"
                                :reset-key="props.loginTurnstileResetKey"
                                :model-value="props.loginTurnstileToken"
                                @update:model-value="emit('update:loginTurnstileToken', $event)"
                                @error="emit('turnstile-error', 'login', $event)"
                                @expired="emit('turnstile-error', 'login', $event)"
                            />
                            <p v-if="props.loginErrors.verification" class="text-sm leading-6 text-rose-600">
                                {{ props.loginErrors.verification }}
                            </p>
                        </div>

                        <button
                            type="submit"
                            class="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60"
                            :disabled="props.isSubmitting || props.isAuthLoading"
                        >
                            {{ props.isSubmitting || props.isAuthLoading ? "Logging in..." : "Log in and continue" }}
                        </button>
                    </form>
                </div>

                <form v-else-if="props.authTab === 'register'" class="grid gap-4" novalidate @submit.prevent="emit('submit-register')">
                    <div class="grid gap-4 sm:grid-cols-2">
                        <label class="grid gap-2">
                            <span class="text-sm font-semibold text-slate-900">First name</span>
                            <input
                                :value="props.regFirstName"
                                type="text"
                                autocomplete="given-name"
                                class="ui-input rounded-2xl"
                                :class="props.registerErrors.first_name ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                                @input="emit('update:regFirstName', getInputValue($event))"
                            />
                            <span v-if="props.registerErrors.first_name" class="block text-sm leading-6 text-rose-600">
                                {{ props.registerErrors.first_name }}
                            </span>
                        </label>

                        <label class="grid gap-2">
                            <span class="text-sm font-semibold text-slate-900">Last name</span>
                            <input
                                :value="props.regLastName"
                                type="text"
                                autocomplete="family-name"
                                class="ui-input rounded-2xl"
                                :class="props.registerErrors.last_name ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                                @input="emit('update:regLastName', getInputValue($event))"
                            />
                            <span v-if="props.registerErrors.last_name" class="block text-sm leading-6 text-rose-600">
                                {{ props.registerErrors.last_name }}
                            </span>
                        </label>
                    </div>

                    <label class="grid gap-2">
                        <span class="text-sm font-semibold text-slate-900">Email</span>
                        <input
                            :value="props.regEmail"
                            type="email"
                            autocomplete="email"
                            class="ui-input rounded-2xl"
                            :class="props.registerErrors.email ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                            @input="emit('update:regEmail', getInputValue($event))"
                        />
                        <span v-if="props.registerErrors.email" class="block text-sm leading-6 text-rose-600">{{ props.registerErrors.email }}</span>
                    </label>

                    <label class="grid gap-2">
                        <span class="text-sm font-semibold text-slate-900">Password</span>
                        <input
                            :value="props.regPassword"
                            type="password"
                            autocomplete="new-password"
                            class="ui-input rounded-2xl"
                            :class="props.registerErrors.password ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                            @input="emit('update:regPassword', getInputValue($event))"
                        />
                        <span v-if="props.registerErrors.password" class="block text-sm leading-6 text-rose-600">
                            {{ props.registerErrors.password }}
                        </span>
                    </label>

                    <div>
                        <FormsTurnstileWidget
                            :site-key="props.turnstileSiteKey"
                            action="register"
                            :reset-key="props.registerTurnstileResetKey"
                            :model-value="props.registerTurnstileToken"
                            @update:model-value="emit('update:registerTurnstileToken', $event)"
                            @error="emit('turnstile-error', 'register', $event)"
                            @expired="emit('turnstile-error', 'register', $event)"
                        />
                        <p v-if="props.registerErrors.verification" class="text-sm leading-6 text-rose-600">
                            {{ props.registerErrors.verification }}
                        </p>
                    </div>

                    <button
                        type="submit"
                        class="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60"
                        :disabled="props.isSubmitting || props.isAuthLoading"
                    >
                        {{ props.isSubmitting || props.isAuthLoading ? "Creating account..." : "Create account and continue" }}
                    </button>
                </form>

                <form v-else class="grid gap-4" novalidate @submit.prevent="emit('submit-guest')">
                    <div class="rounded-[1.2rem] border border-amber-200/80 bg-amber-50/80 p-4 text-sm leading-6 text-slate-700">
                        Guest checkout is faster now, and you can still create an account after the order if you want.
                    </div>

                    <label class="grid gap-2">
                        <span class="text-sm font-semibold text-slate-900">Email</span>
                        <input
                            :value="props.guestEmail"
                            type="email"
                            autocomplete="email"
                            class="ui-input rounded-2xl"
                            :class="props.guestErrors.email ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                            @input="emit('update:guestEmail', getInputValue($event))"
                        />
                        <span v-if="props.guestErrors.email" class="block text-sm leading-6 text-rose-600">{{ props.guestErrors.email }}</span>
                    </label>

                    <button
                        type="submit"
                        class="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60"
                        :disabled="props.isSubmitting"
                    >
                        {{ props.isSubmitting ? "Continuing..." : "Continue as guest" }}
                    </button>
                </form>
            </div>
        </div>
    </section>
</template>
