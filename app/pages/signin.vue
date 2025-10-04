<script setup lang="ts">
import type { VForm } from "vuetify/components"

useHead({ title: "Signin | Ecommerce" })
definePageMeta({ layout: "account" })

const router = useRouter()
const runtimeConfig = useRuntimeConfig()

const showResetDialog = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const snackbar = ref(false)
const snackbarText = ref("")
const snackbarColor = ref("success")

const loginFormRef = ref<InstanceType<typeof VForm> | null>(null)
const resetFormRef = ref<InstanceType<typeof VForm> | null>(null)

const loginEmail = ref<string>("")
const loginPassword = ref<string>("")

const resetEmail = ref<string>("")
const emailRules: ((v: string) => boolean | string)[] = [
    (v: string) => !!v || "E-mail is required",
    (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "E-mail must be valid"
]

const passwordRules: ((v: string) => boolean | string)[] = [(v: string) => !!v || "Password is required"]

async function handleLogin(e: Event): Promise<void> {
    e.preventDefault()

    // Ask Vuetify to validate inputs. This will show inline errors on the fields.
    const { valid } = (await loginFormRef.value?.validate()) ?? { valid: false }
    if (!valid) return // stop here — do not hit your endpoints

    const email = loginEmail.value
    const password = loginPassword.value

    try {
        const { token } = await fetch(`${runtimeConfig.public.MEDUSA_URL}/auth/customer/emailpass`, {
            credentials: "include",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        }).then((res) => res.json())

        await fetch(`${runtimeConfig.public.MEDUSA_URL}/auth/session`, {
            credentials: "include",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        })

        const { customer } = await fetch(`${runtimeConfig.public.MEDUSA_URL}/store/customers/me`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": runtimeConfig.public.PUBLISHABLE_KEY
            }
        }).then((res) => res.json())

        if (!customer) {
            snackbarText.value = "Authentication failed"
            snackbarColor.value = "error"
            snackbar.value = true
            return
        }

        useCustomerStore().customer = customer
        await assignCustomerToCart(useCartStore())
        await router.push("/")
    } catch (error) {
        console.error("Login failed:", error)
        snackbarText.value = "Login failed. Please try again."
        snackbarColor.value = "error"
        snackbar.value = true
    }
}

async function handleSocialLogin(provider: string): Promise<void> {
    try {
        const result = await fetch(`/api/social/${provider}`, {
            credentials: "include",
            method: "POST"
        }).then((res) => res.json())

        if (result.location) {
            window.location.href = result.location
            return
        }

        if (!result.token) {
            snackbarText.value = "Authentication failed"
            snackbarColor.value = "error"
            snackbar.value = true
        }
    } catch (error) {
        console.error("Social login failed:", error)
        snackbarText.value = "An error occurred during social login"
        snackbarColor.value = "error"
        snackbar.value = true
    }
}

async function handleReset(): Promise<void> {
    if (!resetEmail.value) return

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
    <section class="py-10">
        <VContainer>
            <VRow justify="center">
                <VCol cols="12" md="6">
                    <div class="form-wrapper mx-auto">
                        <h4 class="mb-4">Log in</h4>
                        <VBtn class="mb-4" color="white" block @click="handleSocialLogin('google')">
                            <VImg src="/images/google_login_icon.svg" width="24" height="24" class="me-3" />
                            Log in with Google
                        </VBtn>
                        <VBtn class="mb-4" block color="white" @click="handleSocialLogin('facebook')">
                            <VImg src="/images/facebook_login_icon.svg" width="24" height="24" class="me-3" />
                            Log in with Facebook
                        </VBtn>
                        <hr class="mb-4" />
                        <VForm ref="loginFormRef" @submit.prevent="handleLogin">
                            <VTextField
                                v-model.trim="loginEmail"
                                :rules="emailRules"
                                name="email"
                                label="E-mail"
                                type="email"
                                class="mb-3"
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
                                class="mb-3"
                                variant="outlined"
                                autocomplete="current-password"
                                required
                            />
                            <div class="text-end mb-3">
                                <VBtn variant="text" class="px-0 text-caption" @click="showResetDialog = true"> Forgot password? </VBtn>
                            </div>
                            <VBtn type="submit" color="primary" block>Log in</VBtn>
                        </VForm>
                        <p class="mt-4 text-center">
                            Don't have an account?
                            <NuxtLink to="/register">Register here</NuxtLink>
                        </p>
                    </div>
                </VCol>
            </VRow>
            <VDialog v-model="showResetDialog" persistent max-width="500">
                <VCard>
                    <VCardTitle class="d-flex align-center">
                        Forgot password?
                        <VSpacer />
                        <VBtn icon @click="showResetDialog = false">
                            <VIcon>mdi-close</VIcon>
                        </VBtn>
                    </VCardTitle>
                    <VCardText>
                        <p>If you have forgotten your password you can reset it here.</p>
                        <VForm ref="resetFormRef" @submit.prevent="handleReset">
                            <VTextField
                                v-model="resetEmail"
                                :rules="emailRules"
                                label="E-mail Address"
                                type="email"
                                class="mt-3"
                                variant="outlined"
                                required
                            />
                            <VBtn type="submit" color="primary" class="mt-3" block>Send password reset link</VBtn>
                        </VForm>
                    </VCardText>
                </VCard>
            </VDialog>
            <VSnackbar v-model="snackbar" :color="snackbarColor" location="top" timeout="4000">
                {{ snackbarText }}
            </VSnackbar>
        </VContainer>
    </section>
</template>
