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
    } catch (error: unknown) {
        errorMsg.value = error instanceof Error ? error.message : "Registration failed"
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
    } catch (error: unknown) {
        errorMsg.value = error instanceof Error ? error.message : "Could not continue as guest"
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <section class="checkoutAuthPage">
        <div class="checkoutAuthPage__hero">
            <VContainer class="checkoutAuthPage__container">
                <div class="checkoutAuthPage__grid">
                    <div class="checkoutAuthPage__copy">
                        <span class="checkoutAuthPage__eyebrow">Checkout access</span>
                        <h1 class="checkoutAuthPage__title">Choose how you want to continue with your order.</h1>
                        <p class="checkoutAuthPage__description">
                            Sign in, create an account, or continue as a guest without losing the calm, guided flow of checkout.
                        </p>

                        <div class="checkoutAuthPage__statCard">
                            <span class="checkoutAuthPage__statLabel">At this step</span>
                            <strong class="checkoutAuthPage__statValue"
                            >Account customers can save details, while guests can still finish checkout quickly.</strong
                            >
                        </div>
                    </div>

                    <div class="checkoutAuthPage__panel">
                        <span class="checkoutAuthPage__sectionEyebrow">Continue to checkout</span>
                        <h2 class="checkoutAuthPage__sectionTitle">Pick the path that suits this order.</h2>
                        <p class="checkoutAuthPage__sectionText">
                            Switch between account login, quick registration, or guest checkout without leaving the page.
                        </p>

                        <VAlert v-if="errorMsg" type="error" variant="tonal" class="mb-4">
                            {{ errorMsg }}
                        </VAlert>

                        <VTabs v-model="tab" grow class="checkoutAuthPage__tabs">
                            <VTab value="login" class="text-none">Login</VTab>
                            <VTab value="register" class="text-none">Create account</VTab>
                            <VTab value="guest" class="text-none">Guest</VTab>
                        </VTabs>

                        <VWindow v-model="tab" class="checkoutAuthPage__window">
                            <VWindowItem value="login">
                                <div v-if="!customer" class="checkoutAuthPage__windowPanel">
                                    <div class="checkoutAuthPage__socialButtons">
                                        <VBtn
                                            block
                                            class="checkoutAuthPage__socialBtn text-none"
                                            color="white"
                                            @click="handleCheckoutSocialLogin('google')"
                                        >
                                            <VImg src="/images/google_login_icon.svg" width="24" class="me-3" />
                                            Login with Google
                                        </VBtn>
                                        <VBtn
                                            block
                                            class="checkoutAuthPage__socialBtn text-none"
                                            color="white"
                                            @click="handleCheckoutSocialLogin('facebook')"
                                        >
                                            <VImg src="/images/facebook_login_icon.svg" width="24" class="me-3" />
                                            Login with Facebook
                                        </VBtn>
                                    </div>

                                    <div class="checkoutAuthPage__divider"><span>Or continue with email</span></div>

                                    <VForm ref="loginFormRef" class="checkoutAuthPage__form" @submit.prevent="handleCheckoutLogin">
                                        <VTextField v-model="loginEmail" :rules="emailRules" label="Email" variant="outlined" />
                                        <VTextField
                                            v-model="loginPassword"
                                            :rules="passwordRules"
                                            label="Password"
                                            type="password"
                                            variant="outlined"
                                        />
                                        <VBtn block color="primary" rounded="pill" class="text-none" :loading="!auth.loading" type="submit">
                                            Log in and continue
                                        </VBtn>
                                    </VForm>

                                    <VAlert v-if="auth.error" type="error" variant="tonal" class="mt-4">
                                        {{ auth.error }}
                                    </VAlert>
                                </div>
                            </VWindowItem>

                            <VWindowItem value="register">
                                <VForm class="checkoutAuthPage__form" @submit.prevent="submitRegister">
                                    <div class="checkoutAuthPage__nameGrid">
                                        <VTextField v-model="regFirstName" label="First name" variant="outlined" required />
                                        <VTextField v-model="regLastName" label="Last name" variant="outlined" required />
                                    </div>
                                    <VTextField v-model="regEmail" label="Email" type="email" variant="outlined" required />
                                    <VTextField v-model="regPassword" label="Password" type="password" variant="outlined" required />
                                    <VBtn
                                        color="primary"
                                        rounded="pill"
                                        class="text-none"
                                        block
                                        type="submit"
                                        :loading="isSubmitting"
                                        :disabled="isSubmitting"
                                    >
                                        Create account and continue
                                    </VBtn>
                                </VForm>
                            </VWindowItem>

                            <VWindowItem value="guest">
                                <VForm class="checkoutAuthPage__form" @submit.prevent="submitGuest">
                                    <VTextField v-model="guestEmail" label="Email" type="email" variant="outlined" required />
                                    <VBtn
                                        color="primary"
                                        rounded="pill"
                                        class="text-none"
                                        block
                                        type="submit"
                                        :loading="isSubmitting"
                                        :disabled="isSubmitting"
                                    >
                                        Continue as guest
                                    </VBtn>
                                </VForm>
                            </VWindowItem>
                        </VWindow>
                    </div>
                </div>
            </VContainer>
        </div>
    </section>
</template>

<style scoped lang="scss">
.checkoutAuthPage {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.checkoutAuthPage__hero {
    padding: clamp(4.75rem, 7vw, 6.5rem) 0 clamp(4rem, 7vw, 6rem);
}

.checkoutAuthPage__container {
    position: relative;
    z-index: 1;
}

.checkoutAuthPage__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(19rem, 0.95fr);
    gap: clamp(1.5rem, 3vw, 2rem);
    align-items: center;
}

.checkoutAuthPage__copy,
.checkoutAuthPage__panel {
    animation: checkout-auth-rise 0.8s ease both;
}

.checkoutAuthPage__panel {
    animation-delay: 0.12s;
}

.checkoutAuthPage__eyebrow,
.checkoutAuthPage__sectionEyebrow {
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

.checkoutAuthPage__title,
.checkoutAuthPage__sectionTitle {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.checkoutAuthPage__title {
    max-width: 11ch;
    margin: 1rem 0;
    font-size: clamp(2.4rem, 4.4vw, 4.5rem);
    line-height: 0.95;
}

.checkoutAuthPage__description,
.checkoutAuthPage__sectionText {
    margin: 0;
    color: #4b5874;
    line-height: 1.75;
}

.checkoutAuthPage__statCard,
.checkoutAuthPage__panel,
.checkoutAuthPage__windowPanel {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.checkoutAuthPage__statCard {
    display: grid;
    gap: 0.2rem;
    max-width: 27rem;
    margin-top: 1.75rem;
    padding: 0.9rem 1.05rem;
}

.checkoutAuthPage__statLabel {
    color: #6a7590;
    font-size: 0.88rem;
}

.checkoutAuthPage__statValue {
    color: #08173f;
    font-size: 1rem;
    line-height: 1.45;
}

.checkoutAuthPage__panel {
    padding: clamp(1.4rem, 2vw, 1.9rem);
}

.checkoutAuthPage__sectionEyebrow {
    margin-bottom: 1rem;
}

.checkoutAuthPage__sectionTitle {
    margin: 0 0 0.75rem;
    font-size: clamp(1.6rem, 2.4vw, 2.2rem);
    line-height: 1.08;
}

.checkoutAuthPage__tabs {
    margin-top: 1.35rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 999px;
    background: rgba(247, 250, 255, 0.9);
    padding: 0.25rem;
}

.checkoutAuthPage__window {
    margin-top: 1rem;
}

.checkoutAuthPage__windowPanel {
    padding: 1.1rem;
}

.checkoutAuthPage__socialButtons,
.checkoutAuthPage__form {
    display: grid;
    gap: 0.9rem;
}

.checkoutAuthPage__socialBtn {
    justify-content: flex-start;
    min-height: 3.2rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 999px;
    box-shadow: none;
}

.checkoutAuthPage__divider {
    position: relative;
    margin: 1.2rem 0;
    color: #6a7590;
    font-size: 0.9rem;
    text-align: center;
}

.checkoutAuthPage__divider::before {
    content: "";
    position: absolute;
    inset: 50% 0 auto;
    border-top: 1px solid rgba(8, 23, 63, 0.08);
}

.checkoutAuthPage__divider span {
    position: relative;
    display: inline-block;
    padding: 0 0.9rem;
    background: rgba(255, 255, 255, 0.96);
}

.checkoutAuthPage__nameGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.9rem;
}

@keyframes checkout-auth-rise {
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
    .checkoutAuthPage__grid {
        grid-template-columns: 1fr;
    }

    .checkoutAuthPage__title {
        max-width: 100%;
    }
}

@media screen and (max-width: 700px) {
    .checkoutAuthPage__hero {
        padding: 3.75rem 0 3.5rem;
    }

    .checkoutAuthPage__title {
        font-size: clamp(2rem, 9vw, 2.8rem);
        line-height: 1;
    }

    .checkoutAuthPage__panel,
    .checkoutAuthPage__windowPanel,
    .checkoutAuthPage__statCard {
        border-radius: 1.2rem;
    }

    .checkoutAuthPage__nameGrid {
        grid-template-columns: 1fr;
    }
}

@media (prefers-reduced-motion: reduce) {
    .checkoutAuthPage__copy,
    .checkoutAuthPage__panel {
        animation: none;
    }
}
</style>
