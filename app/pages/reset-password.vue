<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const token = computed(() => String(route.query.token || "").trim())
const email = computed(() => String(route.query.email || "").trim())
const password = ref<string>("")
const passwordError = ref<string>("")
const errorMessage = ref<string>("")
const successMessage = ref<string>("")
const isLoading = ref<boolean>(false)
const redirectTimer = ref<ReturnType<typeof setTimeout> | null>(null)

function validatePassword(): boolean {
    passwordError.value = ""

    if (!password.value) {
        passwordError.value = "Password is required"
        return false
    }

    if (password.value.length < 6) {
        passwordError.value = "Password must be at least 6 characters"
        return false
    }

    return true
}

async function handleSubmit(): Promise<void> {
    errorMessage.value = ""
    successMessage.value = ""

    if (!token.value || !email.value) {
        errorMessage.value = "This reset link is invalid or incomplete. Please request a new password reset email."
        return
    }

    if (!validatePassword()) {
        return
    }

    isLoading.value = true

    try {
        const response = await fetch("/api/account/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token: token.value,
                email: email.value,
                password: password.value
            })
        })

        const payload = (await response.json()) as { success?: boolean; message?: string }

        if (!response.ok) {
            errorMessage.value = payload.message || "Could not reset password. Please request a new reset link and try again."
            return
        }

        if (!payload.success) {
            errorMessage.value = payload.message || "Could not reset password. Please request a new reset link and try again."
            return
        }

        successMessage.value = "Password reset successfully. Redirecting to sign in..."
        await router.replace({ path: route.path, query: {} })

        redirectTimer.value = setTimeout(() => {
            void router.push("/signin")
        }, 1500)
    } catch (error: unknown) {
        console.error(error)
        errorMessage.value = "Error resetting password. Please request a new reset link and try again."
    } finally {
        isLoading.value = false
    }
}

onBeforeUnmount(() => {
    if (redirectTimer.value) {
        clearTimeout(redirectTimer.value)
    }
})
</script>

<template>
    <main class="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_38%,#fff7ed_100%)] text-slate-900">
        <section class="mx-auto w-full max-w-6xl px-4 pt-8 pb-14 sm:px-6 lg:px-8 lg:pt-12">
            <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
                <div class="space-y-6">
                    <span
                        class="inline-flex min-h-9 items-center rounded-full border border-slate-300/90 bg-white/80 px-4 text-xs font-semibold tracking-[0.13em] text-slate-700 uppercase"
                    >
                        Secure your account
                    </span>
                    <h1 class="max-w-[12ch] text-4xl leading-[0.95] font-semibold tracking-[-0.03em] text-slate-950 sm:text-6xl">
                        Choose a new password and get back to shopping.
                    </h1>
                    <p class="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                        Create fresh account access here, then head back into your profile, saved details, and upcoming checkout.
                    </p>
                    <div class="rounded-3xl border border-slate-200 bg-white/85 p-4 sm:p-5">
                        <p class="text-xs font-medium tracking-[0.1em] text-slate-500 uppercase">Next step</p>
                        <p class="mt-1 text-sm leading-6 font-semibold text-slate-900 sm:text-base">
                            Once your password is updated, you will be redirected to sign in again with the new details.
                        </p>
                    </div>
                </div>

                <div class="rounded-[1.75rem] border border-slate-200/95 bg-white/95 p-5 sm:p-7">
                    <span
                        class="tracking-label-tight inline-flex min-h-9 items-center rounded-full border border-slate-300/90 bg-slate-50 px-4 text-xs font-semibold text-slate-700 uppercase"
                    >
                        Reset password
                    </span>
                    <h2 class="mt-4 text-2xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-[2rem]">Set a new password.</h2>
                    <p class="mt-3 text-sm leading-7 text-slate-600">
                        Use a password you have not used before so the account feels secure from the next sign-in onward.
                    </p>

                    <form class="mt-6 grid gap-4" @submit.prevent="handleSubmit">
                        <div>
                            <label for="reset-password" class="mb-1.5 block text-sm font-medium text-slate-700">New password</label>
                            <input
                                id="reset-password"
                                v-model="password"
                                type="password"
                                autocomplete="new-password"
                                class="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-500 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                :class="passwordError ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : ''"
                                placeholder="Enter your new password"
                                required
                            />
                            <p v-if="passwordError" class="mt-1 text-sm text-rose-600">{{ passwordError }}</p>
                        </div>

                        <button
                            type="submit"
                            class="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-950 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-70"
                            :disabled="isLoading"
                        >
                            {{ isLoading ? "Resetting password..." : "Reset password" }}
                        </button>
                    </form>

                    <div v-if="errorMessage" class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {{ errorMessage }}
                    </div>
                    <div
                        v-if="successMessage"
                        class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                    >
                        {{ successMessage }}
                    </div>
                </div>
            </div>
        </section>
    </main>
</template>
