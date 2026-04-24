<script setup lang="ts">
type LoginErrors = {
    email: string
    password: string
}

type RegisterErrors = {
    first_name: string
    last_name: string
    email: string
    password: string
}

type GuestErrors = {
    email: string
}

type AuthTab = "login" | "register" | "guest"

const props = defineProps<{
    currentStep: string
    authTab: AuthTab
    identityCompleted: boolean
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
    "update:guestEmail": [value: string]
    "submit-login": []
    "submit-register": []
    "submit-guest": []
    "social-login": [provider: "google" | "facebook"]
    continue: []
}>()

function getInputValue(event: Event): string {
    return event.target instanceof HTMLInputElement ? event.target.value : ""
}
</script>

<template>
    <section class="grid gap-4">
        <div>
            <span class="inline-flex min-h-9 items-center rounded-full bg-brand-100 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-brand-700">
                Step 1
            </span>
            <h2
                class="mt-4 text-[1.9rem] font-semibold leading-[1.03] tracking-[-0.04rem]"
                :class="props.currentStep === 'account' ? 'text-brand-700' : 'text-slate-950'"
            >
                Account or guest
            </h2>
            <p class="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Choose the quickest way to continue with this order.
            </p>
        </div>

        <div
            v-if="props.identityCompleted"
            class="flex flex-col gap-4 rounded-[1.6rem] border border-slate-200/80 bg-white/95 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
            <div>
                <strong class="text-base font-semibold text-slate-950">Checkout identity ready</strong>
                <p class="mt-1 text-sm leading-6 text-slate-600">{{ props.checkoutIdentity }}</p>
            </div>
            <button type="button" class="ui-btn-secondary px-6" @click="emit('continue')">Continue</button>
        </div>

        <div v-else class="rounded-[1.6rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 sm:p-6">
            <div class="grid gap-2 rounded-[1.2rem] border border-slate-200/80 bg-slate-50/80 p-2 sm:grid-cols-3">
                <button
                    type="button"
                    class="min-h-11 rounded-full px-4 text-sm font-semibold transition"
                    :class="props.authTab === 'login' ? 'bg-white text-brand-700' : 'text-slate-600 hover:text-slate-950'"
                    @click="emit('update:authTab', 'login')"
                >
                    Login
                </button>
                <button
                    type="button"
                    class="min-h-11 rounded-full px-4 text-sm font-semibold transition"
                    :class="props.authTab === 'register' ? 'bg-white text-brand-700' : 'text-slate-600 hover:text-slate-950'"
                    @click="emit('update:authTab', 'register')"
                >
                    Create account
                </button>
                <button
                    type="button"
                    class="min-h-11 rounded-full px-4 text-sm font-semibold transition"
                    :class="props.authTab === 'guest' ? 'bg-white text-brand-700' : 'text-slate-600 hover:text-slate-950'"
                    @click="emit('update:authTab', 'guest')"
                >
                    Guest
                </button>
            </div>

            <div class="mt-5">
                <div v-if="props.authTab === 'login'" class="grid gap-5">
                    <div class="grid gap-3">
                        <button type="button" class="ui-btn-secondary w-full justify-start gap-3 rounded-2xl px-5" @click="emit('social-login', 'google')">
                            <img src="/images/google_login_icon.svg" alt="" width="24" height="24" class="h-6 w-6 shrink-0" />
                            Login with Google
                        </button>
                        <button type="button" class="ui-btn-secondary w-full justify-start gap-3 rounded-2xl px-5" @click="emit('social-login', 'facebook')">
                            <img src="/images/facebook_login_icon.svg" alt="" width="24" height="24" class="h-6 w-6 shrink-0" />
                            Login with Facebook
                        </button>
                    </div>

                    <div class="relative text-center text-sm text-slate-500">
                        <div class="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-200"></div>
                        <span class="relative bg-white px-3">Or continue with email</span>
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
                            <p v-if="props.loginErrors.email" class="text-sm leading-6 text-rose-600">{{ props.loginErrors.email }}</p>
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
                            <p v-if="props.loginErrors.password" class="text-sm leading-6 text-rose-600">{{ props.loginErrors.password }}</p>
                        </label>

                        <button type="submit" class="ui-btn-primary w-full justify-center px-6" :disabled="props.isSubmitting || props.isAuthLoading">
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
                            <p v-if="props.registerErrors.first_name" class="text-sm leading-6 text-rose-600">{{ props.registerErrors.first_name }}</p>
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
                            <p v-if="props.registerErrors.last_name" class="text-sm leading-6 text-rose-600">{{ props.registerErrors.last_name }}</p>
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
                        <p v-if="props.registerErrors.email" class="text-sm leading-6 text-rose-600">{{ props.registerErrors.email }}</p>
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
                        <p v-if="props.registerErrors.password" class="text-sm leading-6 text-rose-600">{{ props.registerErrors.password }}</p>
                    </label>

                    <button type="submit" class="ui-btn-primary w-full justify-center px-6" :disabled="props.isSubmitting || props.isAuthLoading">
                        {{ props.isSubmitting || props.isAuthLoading ? "Creating account..." : "Create account and continue" }}
                    </button>
                </form>

                <form v-else class="grid gap-4" novalidate @submit.prevent="emit('submit-guest')">
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
                        <p v-if="props.guestErrors.email" class="text-sm leading-6 text-rose-600">{{ props.guestErrors.email }}</p>
                    </label>

                    <button type="submit" class="ui-btn-primary w-full justify-center px-6" :disabled="props.isSubmitting">
                        {{ props.isSubmitting ? "Continuing..." : "Continue as guest" }}
                    </button>
                </form>
            </div>
        </div>
    </section>
</template>
