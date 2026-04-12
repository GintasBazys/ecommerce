<script setup lang="ts">
import type { VForm } from "~/types/interfaces"

useHead({ title: "Signin | Ecommerce" })
definePageMeta({ layout: "default" })

const router = useRouter()

const showResetDialog = ref<boolean>(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const snackbar = ref<boolean>(false)
const snackbarText = ref<string>("")
const snackbarColor = ref<string>("success")

const loginFormRef = ref<VForm | null>(null)
const resetFormRef = ref<VForm | null>(null)

const loginEmail = ref<string>("")
const loginPassword = ref<string>("")

const resetEmail = ref<string>("")
const emailRules: ((_: string) => boolean | string)[] = [
    (v: string) => !!v || "E-mail is required",
    (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "E-mail must be valid"
]

const passwordRules: ((__: string) => boolean | string)[] = [(v: string) => !!v || "Password is required"]

const auth = useCustomerAuth()

async function handleLogin(e: Event) {
    e.preventDefault()

    const { valid } = (await loginFormRef.value?.validate()) ?? { valid: false }
    if (!valid) {
        return
    }

    const customer = await auth.login(loginEmail.value, loginPassword.value, { loadCart: true })
    if (!customer) {
        snackbarText.value = "Login failed"
        snackbarColor.value = "error"
        snackbar.value = true
        return
    }

    await router.push("/")
}

async function handleSocialLogin(provider: "google" | "facebook") {
    await auth.startSocialLogin(provider, "/")
}

async function handleReset(): Promise<void> {
    if (!resetEmail.value) {
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
        snackbarText.value = successMessage.value
        snackbarColor.value = "success"
        snackbar.value = true

        showResetDialog.value = false
        resetEmail.value = ""
    } catch {
        errorMessage.value = "An unexpected error occurred. Please try again."
        snackbarText.value = errorMessage.value
        snackbarColor.value = "error"
        snackbar.value = true
    }
}
</script>

<template>
    <main class="auth-page auth-page--signin">
        <div class="auth-page__hero">
            <VContainer class="auth-page__container">
                <div class="auth-page__grid">
                    <div class="auth-page__copy">
                        <span class="auth-page__eyebrow">Welcome back</span>
                        <h1 class="auth-page__title">Sign in to pick up your order exactly where you left it.</h1>
                        <p class="auth-page__description">
                            Access your saved details, revisit recent orders, and move from cart to checkout with less friction.
                        </p>
                        <div class="auth-page__stat-card">
                            <span class="auth-page__stat-label">Member access</span>
                            <strong class="auth-page__stat-value">Faster checkout, order history, and saved profile details</strong>
                        </div>
                    </div>
                    <div class="auth-page__panel auth-page__panel--form">
                        <div class="auth-page__panel-intro">
                            <span class="auth-page__section-eyebrow">Account login</span>
                            <h2 class="auth-page__section-title">Enter your details and continue.</h2>
                            <p class="auth-page__section-text">
                                Use social sign-in or your email and password. You can reset access anytime.
                            </p>
                        </div>
                        <div class="auth-page__social-buttons">
                            <VBtn class="auth-page__social-btn text-none" color="white" block @click="handleSocialLogin('google')">
                                <VImg src="/images/google_login_icon.svg" width="24" height="24" class="me-3" />
                                Log in with Google
                            </VBtn>
                            <VBtn class="auth-page__social-btn text-none" block color="white" @click="handleSocialLogin('facebook')">
                                <VImg src="/images/facebook_login_icon.svg" width="24" height="24" class="me-3" />
                                Log in with Facebook
                            </VBtn>
                        </div>
                        <div class="auth-page__divider"><span>Or continue with email</span></div>
                        <VForm ref="loginFormRef" class="auth-page__form" @submit.prevent="handleLogin">
                            <VTextField
                                v-model.trim="loginEmail"
                                :rules="emailRules"
                                name="email"
                                label="E-mail"
                                type="email"
                                variant="outlined"
                                autocomplete="email"
                                required
                            />
                            <VTextField
                                v-model="loginPassword"
                                :rules="passwordRules"
                                name="password"
                                label="Password"
                                type="password"
                                variant="outlined"
                                autocomplete="current-password"
                                required
                            />
                            <div class="auth-page__form-actions">
                                <VBtn variant="text" class="px-0 text-none auth-page__text-btn" @click="showResetDialog = true">
                                    Forgot password?
                                </VBtn>
                            </div>
                            <VBtn type="submit" color="primary" rounded="pill" class="text-none" block>Log in</VBtn>
                        </VForm>
                        <p class="auth-page__footer-text">
                            Don't have an account?
                            <NuxtLink to="/register" class="auth-page__link">Register here</NuxtLink>
                        </p>
                    </div>
                </div>
            </VContainer>
        </div>
        <VDialog v-model="showResetDialog" persistent max-width="560">
            <VCard class="auth-modal">
                <VCardTitle class="auth-modal__header">
                    <div>
                        <span class="auth-modal__eyebrow">Password reset</span>
                        <h2 class="auth-modal__title">Forgot your password?</h2>
                    </div>
                    <VBtn icon variant="text" @click="showResetDialog = false">
                        <VIcon>mdi-close</VIcon>
                    </VBtn>
                </VCardTitle>
                <VCardText class="auth-modal__body">
                    <p class="auth-modal__text">Enter your email and we will send a reset link so you can get back into your account.</p>
                    <VForm ref="resetFormRef" class="auth-modal__form" @submit.prevent="handleReset">
                        <VTextField
                            v-model="resetEmail"
                            :rules="emailRules"
                            label="E-mail address"
                            type="email"
                            variant="outlined"
                            required
                        />
                        <VBtn type="submit" color="primary" rounded="pill" class="text-none" block>Send reset link</VBtn>
                    </VForm>
                </VCardText>
            </VCard>
        </VDialog>
        <VSnackbar v-model="snackbar" :color="snackbarColor" location="top" timeout="4000">
            {{ snackbarText }}
        </VSnackbar>
    </main>
</template>

<style scoped lang="scss">
.auth-page {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.auth-page__hero {
    padding: 0 0 4rem;
}

.auth-page__container {
    position: relative;
    z-index: 1;
}

.auth-page__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(19rem, 0.9fr);
    gap: 1.5rem;
    align-items: center;
}

.auth-page__copy,
.auth-page__panel {
    animation: auth-rise 0.8s ease both;
}

.auth-page__panel {
    animation-delay: 0.12s;
}

.auth-page__eyebrow,
.auth-page__section-eyebrow,
.auth-modal__eyebrow {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    background: rgba(1, 12, 128, 0.07);
    color: #010c80;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.auth-page__title,
.auth-page__section-title,
.auth-modal__title {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.auth-page__title {
    max-width: 11ch;
    margin: 1rem 0;
    font-size: 2.75rem;
    line-height: 0.95;
}

.auth-page__description,
.auth-page__section-text,
.auth-page__footer-text,
.auth-modal__text {
    margin: 0;
    color: #4b5874;
    line-height: 1.75;
}

.auth-page__stat-card,
.auth-page__panel,
.auth-modal {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.auth-page__stat-card {
    display: grid;
    gap: 0.2rem;
    max-width: 27rem;
    margin-top: 1.75rem;
    padding: 0.9rem 1.05rem;
}

.auth-page__stat-label {
    color: #6a7590;
    font-size: 0.88rem;
}

.auth-page__stat-value {
    color: #08173f;
    font-size: 1rem;
    line-height: 1.45;
}

.auth-page__panel {
    padding: 1.4rem;
}

.auth-page__section-eyebrow {
    margin-bottom: 1rem;
}

.auth-page__section-title,
.auth-modal__title {
    margin: 0 0 0.75rem;
    font-size: 1.75rem;
    line-height: 1.08;
}

.auth-page__social-buttons,
.auth-page__form,
.auth-modal__form {
    display: grid;
    gap: 0.9rem;
}

.auth-page__social-buttons {
    margin-top: 1.35rem;
}

.auth-page__social-btn {
    justify-content: flex-start;
    min-height: 3.2rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 999px;
    box-shadow: none;
}

.auth-page__divider {
    position: relative;
    margin: 1.35rem 0;
    color: #6a7590;
    font-size: 0.9rem;
    text-align: center;
}

.auth-page__divider::before {
    content: "";
    position: absolute;
    inset: 50% 0 auto;
    border-top: 1px solid rgba(8, 23, 63, 0.08);
}

.auth-page__divider span {
    position: relative;
    display: inline-block;
    padding: 0 0.9rem;
    background: rgba(255, 255, 255, 0.96);
}

.auth-page__form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: -0.3rem;
}

.auth-page__text-btn,
.auth-page__link {
    color: #010c80;
    font-weight: 700;
}

.auth-page__footer-text {
    margin-top: 1.25rem;
    text-align: center;
}

.auth-modal {
    overflow: hidden;
}

.auth-modal__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.4rem 1.4rem 0.5rem;
}

.auth-modal__body {
    padding: 0 1.4rem 1.4rem;
}

.auth-modal__text {
    margin-bottom: 1rem;
}

@keyframes auth-rise {
    from {
        opacity: 0;
        transform: translateY(26px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (max-width: 1100px) {
    .auth-page__grid {
        grid-template-columns: 1fr;
    }

    .auth-page__title {
        max-width: 100%;
    }
}

@media screen and (min-width: 701px) {
    .auth-page__hero {
        padding-bottom: 5rem;
    }

    .auth-page__grid {
        gap: 2rem;
    }

    .auth-page__panel {
        padding: 1.75rem;
    }

    .auth-page__title {
        font-size: 3.5rem;
    }

    .auth-page__section-title,
    .auth-modal__title {
        font-size: 2rem;
    }
}

@media screen and (max-width: 700px) {
    .auth-page__hero {
        padding: 0 0 3.5rem;
    }

    .auth-page__title {
        font-size: 2.4rem;
        line-height: 1;
    }

    .auth-page__panel,
    .auth-page__stat-card,
    .auth-modal {
        border-radius: 1.2rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .auth-page__copy,
    .auth-page__panel {
        animation: none;
    }
}
</style>
