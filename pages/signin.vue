<script setup lang="ts">
import { useRouter } from "vue-router"
import { useCustomerStore } from "@/stores/customer"
import { useCartStore } from "@/stores/cartStore"
import { useRuntimeConfig } from "#app"

useHead({
    title: "Signin | Ecommerce"
})

definePageMeta({
    layout: "account"
})

const router = useRouter()
const customerStore = useCustomerStore()
const cartStore = useCartStore()
const runtimeConfig = useRuntimeConfig()

const showResetDialog = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const handleLogin = async (e: Event) => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
        const { token } = await fetch(`${runtimeConfig.public.MEDUSA_URL}/auth/customer/emailpass`, {
            credentials: "include",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
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
            alert("Authentication failed")
            return
        }

        customerStore.customer = customer
        await assignCustomerToCart(cartStore)
        await router.push("/")
    } catch (error) {
        console.error("Login failed:", error)
        alert("Login failed. Please try again.")
    }
}

const handleSocialLogin = async (provider: string) => {
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
            alert("Authentication failed")
            return
        }
    } catch (error) {
        console.error("Social login failed:", error)
        alert("An error occurred during social login")
    }
}

const handleReset = async (e: Event) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const email = formData.get("resetEmail") as string

    try {
        errorMessage.value = null
        successMessage.value = null

        await $fetch("/api/password-reset", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        })

        successMessage.value = "Password reset email sent"
    } catch {
        errorMessage.value = "An unexpected error occurred. Please try again."
    }

    form.reset()
}
</script>

<template>
    <section class="py-10">
        <VContainer>
            <VRow justify="center">
                <VCol cols="12" md="6">
                    <div class="form-wrapper mx-auto">
                        <h4 class="mb-4">Log in</h4>
                        <VBtn class="mb-4" color="white" block @click="handleSocialLogin('google')" style="border: 1px solid #ccc">
                            <VImg src="/images/google_login_icon.svg" width="24" height="24" class="me-3" />
                            Log in with Google
                        </VBtn>
                        <form @submit="handleLogin">
                            <VTextField name="email" label="E-mail" type="email" class="mb-3" variant="outlined" required />
                            <VTextField name="password" label="Password" type="password" class="mb-3" variant="outlined" required />
                            <div class="text-end mb-3">
                                <VBtn variant="text" class="px-0 text-caption" @click="showResetDialog = true">Forgot password?</VBtn>
                            </div>
                            <VBtn type="submit" color="primary" block>Log in</VBtn>
                        </form>

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
                        <form @submit="handleReset">
                            <VTextField name="resetEmail" label="E-mail Address" type="email" class="mt-3" variant="outlined" required />
                            <VBtn type="submit" color="primary" class="mt-3" block> Send password reset link </VBtn>
                        </form>
                        <div v-if="errorMessage" class="text-error mt-2">{{ errorMessage }}</div>
                        <div v-if="successMessage" class="text-success mt-2">{{ successMessage }}</div>
                    </VCardText>
                </VCard>
            </VDialog>
        </VContainer>
    </section>
</template>
