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
    <main class="authPage authPage--signin">
        <div class="authPage__hero">
            <VContainer class="authPage__container">
                <div class="authPage__grid">
                    <div class="authPage__copy">
                        <span class="authPage__eyebrow">Welcome back</span>
                        <h1 class="authPage__title">Sign in to pick up your order exactly where you left it.</h1>
                        <p class="authPage__description">
                            Access your saved details, revisit recent orders, and move from cart to checkout with less friction.
                        </p>
                        <div class="authPage__statCard">
                            <span class="authPage__statLabel">Member access</span>
                            <strong class="authPage__statValue">Faster checkout, order history, and saved profile details</strong>
                        </div>
                    </div>
                    <div class="authPage__panel authPage__panel--form">
                        <div class="authPage__panelIntro">
                            <span class="authPage__sectionEyebrow">Account login</span>
                            <h2 class="authPage__sectionTitle">Enter your details and continue.</h2>
                            <p class="authPage__sectionText">
                                Use social sign-in or your email and password. You can reset access anytime.
                            </p>
                        </div>
                        <div class="authPage__socialButtons">
                            <VBtn class="authPage__socialBtn text-none" color="white" block @click="handleSocialLogin('google')">
                                <VImg src="/images/google_login_icon.svg" width="24" height="24" class="me-3" />
                                Log in with Google
                            </VBtn>
                            <VBtn class="authPage__socialBtn text-none" block color="white" @click="handleSocialLogin('facebook')">
                                <VImg src="/images/facebook_login_icon.svg" width="24" height="24" class="me-3" />
                                Log in with Facebook
                            </VBtn>
                        </div>
                        <div class="authPage__divider"><span>Or continue with email</span></div>
                        <VForm ref="loginFormRef" class="authPage__form" @submit.prevent="handleLogin">
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
                            <div class="authPage__formActions">
                                <VBtn variant="text" class="px-0 text-none authPage__textBtn" @click="showResetDialog = true">
                                    Forgot password?
                                </VBtn>
                            </div>
                            <VBtn type="submit" color="primary" rounded="pill" class="text-none" block>Log in</VBtn>
                        </VForm>
                        <p class="authPage__footerText">
                            Don't have an account?
                            <NuxtLink to="/register" class="authPage__link">Register here</NuxtLink>
                        </p>
                    </div>
                </div>
            </VContainer>
        </div>
        <VDialog v-model="showResetDialog" persistent max-width="560">
            <VCard class="authModal">
                <VCardTitle class="authModal__header">
                    <div>
                        <span class="authModal__eyebrow">Password reset</span>
                        <h2 class="authModal__title">Forgot your password?</h2>
                    </div>
                    <VBtn icon variant="text" @click="showResetDialog = false">
                        <VIcon>mdi-close</VIcon>
                    </VBtn>
                </VCardTitle>
                <VCardText class="authModal__body">
                    <p class="authModal__text">Enter your email and we will send a reset link so you can get back into your account.</p>
                    <VForm ref="resetFormRef" class="authModal__form" @submit.prevent="handleReset">
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
.authPage {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.authPage__hero {
    padding: 0 0 clamp(4rem, 7vw, 6rem);
}

.authPage__container {
    position: relative;
    z-index: 1;
}

.authPage__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(19rem, 0.9fr);
    gap: clamp(1.5rem, 3vw, 2rem);
    align-items: center;
}

.authPage__copy,
.authPage__panel {
    animation: auth-rise 0.8s ease both;
}

.authPage__panel {
    animation-delay: 0.12s;
}

.authPage__eyebrow,
.authPage__sectionEyebrow,
.authModal__eyebrow {
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

.authPage__title,
.authPage__sectionTitle,
.authModal__title {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.authPage__title {
    max-width: 11ch;
    margin: 1rem 0;
    font-size: clamp(2.4rem, 4.4vw, 4.5rem);
    line-height: 0.95;
}

.authPage__description,
.authPage__sectionText,
.authPage__footerText,
.authModal__text {
    margin: 0;
    color: #4b5874;
    line-height: 1.75;
}

.authPage__statCard,
.authPage__panel,
.authModal {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.authPage__statCard {
    display: grid;
    gap: 0.2rem;
    max-width: 27rem;
    margin-top: 1.75rem;
    padding: 0.9rem 1.05rem;
}

.authPage__statLabel {
    color: #6a7590;
    font-size: 0.88rem;
}

.authPage__statValue {
    color: #08173f;
    font-size: 1rem;
    line-height: 1.45;
}

.authPage__panel {
    padding: clamp(1.4rem, 2vw, 1.9rem);
}

.authPage__sectionEyebrow {
    margin-bottom: 1rem;
}

.authPage__sectionTitle,
.authModal__title {
    margin: 0 0 0.75rem;
    font-size: clamp(1.6rem, 2.4vw, 2.2rem);
    line-height: 1.08;
}

.authPage__socialButtons,
.authPage__form,
.authModal__form {
    display: grid;
    gap: 0.9rem;
}

.authPage__socialButtons {
    margin-top: 1.35rem;
}

.authPage__socialBtn {
    justify-content: flex-start;
    min-height: 3.2rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 999px;
    box-shadow: none;
}

.authPage__divider {
    position: relative;
    margin: 1.35rem 0;
    color: #6a7590;
    font-size: 0.9rem;
    text-align: center;
}

.authPage__divider::before {
    content: "";
    position: absolute;
    inset: 50% 0 auto;
    border-top: 1px solid rgba(8, 23, 63, 0.08);
}

.authPage__divider span {
    position: relative;
    display: inline-block;
    padding: 0 0.9rem;
    background: rgba(255, 255, 255, 0.96);
}

.authPage__formActions {
    display: flex;
    justify-content: flex-end;
    margin-top: -0.3rem;
}

.authPage__textBtn,
.authPage__link {
    color: #010c80;
    font-weight: 700;
}

.authPage__footerText {
    margin-top: 1.25rem;
    text-align: center;
}

.authModal {
    overflow: hidden;
}

.authModal__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.4rem 1.4rem 0.5rem;
}

.authModal__body {
    padding: 0 1.4rem 1.4rem;
}

.authModal__text {
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
    .authPage__grid {
        grid-template-columns: 1fr;
    }

    .authPage__title {
        max-width: 100%;
    }
}

@media screen and (max-width: 700px) {
    .authPage__hero {
        padding: 0 0 3.5rem;
    }

    .authPage__title {
        font-size: clamp(2rem, 9vw, 2.8rem);
        line-height: 1;
    }

    .authPage__panel,
    .authPage__statCard,
    .authModal {
        border-radius: 1.2rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .authPage__copy,
    .authPage__panel {
        animation: none;
    }
}
</style>
