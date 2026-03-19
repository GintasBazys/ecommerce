<script setup lang="ts">
import type { VForm } from "~/types/interfaces"

useHead({ title: "Signin | Ecommerce" })
definePageMeta({ layout: "account" })

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
    <main class="pb-10">
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
    </main>
</template>
