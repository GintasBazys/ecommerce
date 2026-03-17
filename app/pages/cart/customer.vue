<script setup lang="ts">
import type { VForm } from "~/types/interfaces"

import { useCustomerAuth } from "~/composables/useCustomerAuth"

definePageMeta({ layout: "checkout" })
useHead({ title: "Customer | Ecommerce" })

const router = useRouter()

const customerStore = useCustomerStore()
const { customer } = storeToRefs(customerStore)

const cartStore = useCartStore()
const { cart } = storeToRefs(cartStore)
const { loadCart } = cartStore

const isSubmitting = ref<boolean>(false)
const errorMsg = ref<string | null>(null)

const tab = ref<"login" | "register" | "guest">("login")

const loginEmail = ref<string>("")
const loginPassword = ref<string>("")

const regFirstName = ref<string>("")
const regLastName = ref<string>("")
const regEmail = ref<string>("")
const regPassword = ref<string>("")

const guestEmail = ref<string>("")

const loginFormRef = ref<VForm | null>(null)

const emailRules = [
    (v: string) => !!v || "E-mail is required",
    (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "E-mail must be valid"
]
const passwordRules = [(v: string) => !!v || "Password is required"]

async function goAddress() {
    await router.push("/address")
}

async function attachCustomerAndGo() {
    await $fetch("/api/account/assign-customer", { method: "POST", credentials: "include" })
    await loadCart()
    await goAddress()
}

onMounted(async () => {
    if (!cart.value) {
        await loadCart()
    }

    if (!cart.value?.items?.length) {
        await router.push("/cart")
    }
})

const auth = useCustomerAuth()

async function handleCheckoutLogin(e: Event) {
    e.preventDefault()

    const { valid } = (await loginFormRef.value?.validate()) ?? { valid: false }
    if (!valid) {
        return
    }

    const customer = await auth.login(loginEmail.value, loginPassword.value, { loadCart: false })
    if (!customer) {
        return
    }

    await attachCustomerAndGo()
}

async function handleCheckoutSocialLogin(provider: "google" | "facebook") {
    await auth.startSocialLogin(provider, "/checkout")
}

async function submitRegister() {
    errorMsg.value = null
    isSubmitting.value = true
    try {
        await $fetch("/api/account/register", {
            method: "POST",
            credentials: "include",
            body: {
                email: regEmail.value,
                password: regPassword.value,
                first_name: regFirstName.value,
                last_name: regLastName.value
            }
        })

        await customerStore.fetchCustomer()
        if (!customer.value?.id) {
            errorMsg.value = "Customer session not found."
            return
        }

        await attachCustomerAndGo()
    } catch (e: any) {
        errorMsg.value = e?.message ?? "Registration failed"
    } finally {
        isSubmitting.value = false
    }
}

async function submitGuest() {
    errorMsg.value = null
    isSubmitting.value = true
    try {
        await $fetch("/api/cart/set-guest", {
            method: "POST",
            credentials: "include",
            body: {
                email: guestEmail.value
            }
        })

        await loadCart()
        await goAddress()
    } catch (e: any) {
        errorMsg.value = e?.message ?? "Could not continue as guest"
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <section class="py-10">
        <VContainer>
            <VRow justify="center">
                <VCol cols="12" md="7" lg="6">
                    <VCard class="pa-6" elevation="2">
                        <h1 class="text-h6 font-weight-bold mb-4">Continue to Checkout</h1>
                        <VAlert v-if="errorMsg" type="error" variant="tonal" class="mb-4">
                            {{ errorMsg }}
                        </VAlert>
                        <VTabs v-model="tab" grow>
                            <VTab value="login">Login</VTab>
                            <VTab value="register">Create account</VTab>
                            <VTab value="guest">Guest</VTab>
                        </VTabs>
                        <VDivider class="my-4" />
                        <VWindow v-model="tab">
                            <VWindowItem value="login">
                                <VCard v-if="!customer" class="mb-6">
                                    <VCardText>
                                        <VBtn block class="mb-3" color="white" @click="handleCheckoutSocialLogin('google')">
                                            <VImg src="/images/google_login_icon.svg" width="24" class="me-3" />
                                            Login with Google
                                        </VBtn>
                                        <VBtn block class="mb-4" color="white" @click="handleCheckoutSocialLogin('facebook')">
                                            <VImg src="/images/facebook_login_icon.svg" width="24" class="me-3" />
                                            Login with Facebook
                                        </VBtn>
                                        <VDivider class="my-4" />
                                        <VForm ref="loginFormRef" @submit.prevent="handleCheckoutLogin">
                                            <VTextField v-model="loginEmail" :rules="emailRules" label="Email" />
                                            <VTextField v-model="loginPassword" :rules="passwordRules" label="Password" type="password" />
                                            <VBtn block color="primary" :loading="!auth.loading" type="submit"> Log in & Continue </VBtn>
                                        </VForm>
                                        <VAlert v-if="auth.error" type="error" class="mt-3">
                                            {{ auth.error }}
                                        </VAlert>
                                    </VCardText>
                                </VCard>
                            </VWindowItem>
                            <VWindowItem value="register">
                                <VForm @submit.prevent="submitRegister">
                                    <VRow>
                                        <VCol cols="12" md="6">
                                            <VTextField
                                                v-model="regFirstName"
                                                label="First name"
                                                variant="outlined"
                                                class="mb-3"
                                                required
                                            />
                                        </VCol>
                                        <VCol cols="12" md="6">
                                            <VTextField v-model="regLastName" label="Last name" variant="outlined" class="mb-3" required />
                                        </VCol>
                                    </VRow>
                                    <VTextField v-model="regEmail" label="Email" type="email" variant="outlined" class="mb-3" required />
                                    <VTextField
                                        v-model="regPassword"
                                        label="Password"
                                        type="password"
                                        variant="outlined"
                                        class="mb-4"
                                        required
                                    />
                                    <VBtn color="primary" block type="submit" :loading="isSubmitting" :disabled="isSubmitting">
                                        Create Account & Continue
                                    </VBtn>
                                </VForm>
                            </VWindowItem>
                            <VWindowItem value="guest">
                                <VForm @submit.prevent="submitGuest">
                                    <VTextField v-model="guestEmail" label="Email" type="email" variant="outlined" class="mb-3" required />
                                    <VBtn color="primary" block type="submit" :loading="isSubmitting" :disabled="isSubmitting">
                                        Continue as Guest
                                    </VBtn>
                                </VForm>
                            </VWindowItem>
                        </VWindow>
                    </VCard>
                </VCol>
            </VRow>
        </VContainer>
    </section>
</template>
