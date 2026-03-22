<script setup lang="ts">
import { loadStripe } from "@stripe/stripe-js/pure"

import type { Address, ShippingOption, VForm } from "@/types/interfaces"
import type { CartDTO } from "@medusajs/types"
import type { Stripe, StripeElements, StripeLinkAuthenticationElement, StripePaymentElement } from "@stripe/stripe-js"

import { formatPrice } from "@/utils/formatPrice"
import { DEFAULT_CURENCY } from "~/utils/consts"

definePageMeta({ layout: "checkout" })
useHead({ title: "Checkout | Ecommerce" })

type CheckoutStep = "account" | "address" | "payment"
type AuthTab = "login" | "register" | "guest"
type CheckoutCart = CartDTO & { email?: string | null }
type CreatePaymentIntentPayload = {
    clientSecret?: string
    client_secret?: string
}
type CompleteCartPayload = { order?: { id?: string } }
type ShippingOptionsPayload = ShippingOption[] | { shipping_options?: ShippingOption[] }

const cartStore = useCartStore()
const customerStore = useCustomerStore()
const regionStore = useRegionStore()

const { cart } = storeToRefs(cartStore)
const { customer } = storeToRefs(customerStore)
const { regionCountries } = storeToRefs(regionStore)

const auth = useCustomerAuth()
const config = useRuntimeConfig()
const router = useRouter()

const currentStep = ref<CheckoutStep>("account")
const authTab = ref<AuthTab>("login")
const isBooting = ref<boolean>(true)
const isSubmitting = ref<boolean>(false)
const errorMessage = ref<string | null>(null)
const isLoading = ref<boolean>(false)
const isShippingLoading = ref<boolean>(true)
const isPaymentInitializing = ref<boolean>(false)
const isCheckoutActive = ref<boolean>(true)

const loginFormRef = ref<VForm | null>(null)
const addressFormRef = ref<VForm | null>(null)

const loginEmail = ref<string>("")
const loginPassword = ref<string>("")

const regFirstName = ref<string>("")
const regLastName = ref<string>("")
const regEmail = ref<string>("")
const regPassword = ref<string>("")

const guestEmail = ref<string>("")

const billingAddress = reactive<Address>({
    first_name: "",
    last_name: "",
    address_1: "",
    address_2: "",
    city: "",
    province: "",
    postal_code: "",
    country_code: "",
    phone: "",
    company: ""
})

const shippingAddress = reactive<Address>({
    first_name: "",
    last_name: "",
    address_1: "",
    address_2: "",
    city: "",
    province: "",
    postal_code: "",
    country_code: "",
    phone: "",
    company: ""
})

const useSeparateShipping = ref<boolean>(false)

let stripe: Stripe | null = null
let elements: StripeElements | null = null
let paymentElement: StripePaymentElement | null = null
let linkAuthElement: StripeLinkAuthenticationElement | null = null
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const clientSecretValue = ref<string | null>(null)
const shippingOptions = ref<ShippingOption[]>([])
const selectedShippingOptionId = ref<string | null>(null)
const lastPaymentSignature = ref<string>("")
const lastAppliedShippingContext = ref<string>("")

const emailRules = [
    (value: string) => !!value || "E-mail is required",
    (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "E-mail must be valid"
]
const passwordRules = [(value: string) => !!value || "Password is required"]
const addressRules = {
    required: (value: unknown): boolean | string => (value !== null && value !== undefined && value !== "") || "This field is required",
    phone: (value: string): boolean | string => /^[+]?[\d\s-]{7,}$/.test(value) || "Enter a valid phone number"
}

const checkoutCart = computed<CheckoutCart | null>(() => cart.value ?? null)
const checkoutEmail = computed<string>(() => checkoutCart.value?.email ?? "")
const currencyCode = computed<string>(() => checkoutCart.value?.currency_code ?? DEFAULT_CURENCY)
const lineItems = computed(() => checkoutCart.value?.items ?? [])
const itemCount = computed<number>(() => lineItems.value.reduce((sum, item) => sum + Number(item.quantity), 0))
const identityCompleted = computed<boolean>(() => Boolean(customer.value?.id || checkoutEmail.value))

const addressCompleted = computed<boolean>(() => {
    const currentCart = checkoutCart.value
    return Boolean(
        currentCart?.billing_address?.address_1 &&
        currentCart.billing_address?.city &&
        currentCart.billing_address?.postal_code &&
        currentCart.billing_address?.country_code &&
        currentCart?.shipping_address?.address_1 &&
        currentCart.shipping_address?.city &&
        currentCart.shipping_address?.postal_code &&
        currentCart.shipping_address?.country_code
    )
})

const stepItems = computed(() => [
    {
        key: "account" as const,
        label: "Account",
        description: identityCompleted.value
            ? customer.value?.id
                ? "Signed in"
                : `Guest: ${checkoutEmail.value}`
            : "Choose login or guest"
    },
    {
        key: "address" as const,
        label: "Address",
        description: addressCompleted.value ? "Delivery details saved" : "Add billing and shipping"
    },
    {
        key: "payment" as const,
        label: "Payment",
        description: selectedShippingOptionId.value ? "Shipping and payment ready" : "Choose shipping and pay"
    }
])

const cartFingerprint = computed<string>(() => {
    const currentCart = checkoutCart.value

    if (!currentCart?.id) {
        return ""
    }

    const items = Array.isArray(currentCart.items) ? currentCart.items.map((item) => `${item.id}:${item.quantity}`).join("|") : ""
    return `${currentCart.id}|${items}|${currentCart.total ?? ""}|${currentCart.updated_at ?? ""}`
})

function resetAddress(address: Address): void {
    address.first_name = ""
    address.last_name = ""
    address.address_1 = ""
    address.address_2 = ""
    address.city = ""
    address.province = ""
    address.postal_code = ""
    address.country_code = ""
    address.phone = ""
    address.company = ""
}

function applyAddress(target: Address, source?: Partial<Address> | null): void {
    target.first_name = source?.first_name ?? ""
    target.last_name = source?.last_name ?? ""
    target.address_1 = source?.address_1 ?? ""
    target.address_2 = source?.address_2 ?? ""
    target.city = source?.city ?? ""
    target.province = source?.province ?? ""
    target.postal_code = source?.postal_code ?? ""
    target.country_code = source?.country_code?.toUpperCase() ?? ""
    target.phone = source?.phone ?? ""
    target.company = source?.company ?? ""
}

function syncAddressesFromCart(currentCart: CheckoutCart | null): void {
    applyAddress(billingAddress, currentCart?.billing_address as Partial<Address> | null)

    const currentShipping = currentCart?.shipping_address as Partial<Address> | null
    const currentBilling = currentCart?.billing_address as Partial<Address> | null

    if (currentShipping?.address_1) {
        applyAddress(shippingAddress, currentShipping)
        useSeparateShipping.value = JSON.stringify(currentShipping) !== JSON.stringify(currentBilling)
        return
    }

    resetAddress(shippingAddress)
    useSeparateShipping.value = false
}

function deriveInitialStep(): CheckoutStep {
    if (!identityCompleted.value) {
        return "account"
    }

    if (!addressCompleted.value) {
        return "address"
    }

    return "payment"
}

function getPaymentSignature(): string {
    return `${cartFingerprint.value}|${selectedShippingOptionId.value ?? ""}`
}

function clearPaymentState(): void {
    clientSecretValue.value = null
    lastPaymentSignature.value = ""
    lastAppliedShippingContext.value = ""

    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }

    paymentElement?.destroy()
    linkAuthElement?.destroy()
    paymentElement = null
    linkAuthElement = null
    elements = null
}

function cleanup(): void {
    isCheckoutActive.value = false
    clearPaymentState()
}

async function loadShippingOptions(): Promise<void> {
    if (!isCheckoutActive.value || !checkoutCart.value?.id || !addressCompleted.value) {
        return
    }

    isShippingLoading.value = true

    try {
        const response = await fetch("/api/orders/shipping-options", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ cart_id: checkoutCart.value.id })
        })

        const data = (await response.json()) as ShippingOptionsPayload
        const options = Array.isArray(data) ? data : (data.shipping_options ?? [])

        shippingOptions.value = options
        selectedShippingOptionId.value ||= options[0]?.id ?? null
    } finally {
        isShippingLoading.value = false
    }
}

async function updateShippingOption(): Promise<void> {
    if (!isCheckoutActive.value || !checkoutCart.value?.id || !selectedShippingOptionId.value) {
        return
    }

    const context = `${checkoutCart.value.id}|${selectedShippingOptionId.value}`
    if (context === lastAppliedShippingContext.value) {
        return
    }

    await fetch("/api/orders/shipping-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            cart_id: checkoutCart.value.id,
            option_id: selectedShippingOptionId.value
        })
    })

    lastAppliedShippingContext.value = context
    await cartStore.loadCart()
}

async function ensureElements(secret: string): Promise<void> {
    if (!isCheckoutActive.value || !stripe) {
        return
    }

    const linkElementRoot = document.getElementById("link-authentication-element")
    const paymentElementRoot = document.getElementById("payment-element")

    if (!linkElementRoot || !paymentElementRoot) {
        return
    }

    if (!elements) {
        elements = stripe.elements({ clientSecret: secret })
        linkAuthElement = elements.create("linkAuthentication")
        paymentElement = elements.create("payment")
        linkAuthElement.mount("#link-authentication-element")
        paymentElement.mount("#payment-element")
        return
    }

    if (clientSecretValue.value === secret) {
        await elements.fetchUpdates().catch(() => {})
        return
    }

    paymentElement?.destroy()
    linkAuthElement?.destroy()

    elements = stripe.elements({ clientSecret: secret })
    linkAuthElement = elements.create("linkAuthentication")
    paymentElement = elements.create("payment")
    linkAuthElement.mount("#link-authentication-element")
    paymentElement.mount("#payment-element")
}

async function createOrUpdatePaymentIntent(): Promise<void> {
    if (!isCheckoutActive.value || !checkoutCart.value?.id || !selectedShippingOptionId.value) {
        return
    }

    const response = await fetch("/api/orders/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            cartId: checkoutCart.value.id,
            shippingOptionId: selectedShippingOptionId.value
        })
    })

    const payload = (await response.json()) as CreatePaymentIntentPayload
    const secret = payload.clientSecret ?? payload.client_secret

    if (!secret) {
        return
    }

    clientSecretValue.value = secret
    await ensureElements(secret)
}

async function refreshCheckout(): Promise<void> {
    if (!isCheckoutActive.value || currentStep.value !== "payment" || !addressCompleted.value) {
        return
    }

    isPaymentInitializing.value = true

    try {
        await updateShippingOption()
        const signature = getPaymentSignature()

        if (signature !== lastPaymentSignature.value) {
            await createOrUpdatePaymentIntent()
            lastPaymentSignature.value = signature
        }
    } finally {
        isPaymentInitializing.value = false
    }
}

function scheduleRefresh(): void {
    if (!isCheckoutActive.value || currentStep.value !== "payment" || !addressCompleted.value) {
        return
    }

    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(refreshCheckout, 350)
}

async function goToAddressStep(): Promise<void> {
    errorMessage.value = null
    currentStep.value = "address"
}

async function attachCustomerToCheckoutCart(): Promise<void> {
    await $fetch("/api/account/assign-customer", { method: "POST", credentials: "include" })
    await cartStore.loadCart()
}

async function handleCheckoutLogin(event: Event): Promise<void> {
    event.preventDefault()

    const { valid } = (await loginFormRef.value?.validate()) ?? { valid: false }
    if (!valid) {
        return
    }

    errorMessage.value = null
    isSubmitting.value = true

    try {
        const loggedInCustomer = await auth.login(loginEmail.value, loginPassword.value, { loadCart: false })
        if (!loggedInCustomer) {
            errorMessage.value = auth.error.value ?? "Login failed"
            return
        }

        await attachCustomerToCheckoutCart()
        await goToAddressStep()
    } finally {
        isSubmitting.value = false
    }
}

async function handleCheckoutSocialLogin(provider: "google" | "facebook"): Promise<void> {
    await auth.startSocialLogin(provider, "/checkout")
}

async function submitRegister(): Promise<void> {
    errorMessage.value = null
    isSubmitting.value = true

    try {
        const registeredCustomer = await auth.register(
            {
                email: regEmail.value,
                password: regPassword.value,
                first_name: regFirstName.value,
                last_name: regLastName.value
            },
            { loadCart: false }
        )

        if (!registeredCustomer) {
            errorMessage.value = auth.error.value ?? "Registration failed"
            return
        }

        await attachCustomerToCheckoutCart()
        await goToAddressStep()
    } finally {
        isSubmitting.value = false
    }
}

async function submitGuest(): Promise<void> {
    errorMessage.value = null
    isSubmitting.value = true

    try {
        await $fetch("/api/cart/set-guest", {
            method: "POST",
            credentials: "include",
            body: { email: guestEmail.value }
        })

        await cartStore.loadCart()
        await goToAddressStep()
    } catch (error: unknown) {
        errorMessage.value = error instanceof Error ? error.message : "Could not continue as guest"
    } finally {
        isSubmitting.value = false
    }
}

async function submitAddresses(): Promise<void> {
    const { valid } = (await addressFormRef.value?.validate()) ?? { valid: false }
    if (!valid || !checkoutCart.value?.id) {
        return
    }

    const payload: { cartId: string; billing_address: Address; shipping_address: Address } = {
        cartId: checkoutCart.value.id,
        billing_address: { ...billingAddress, country_code: billingAddress.country_code.toLowerCase() },
        shipping_address: useSeparateShipping.value
            ? { ...shippingAddress, country_code: shippingAddress.country_code.toLowerCase() }
            : { ...billingAddress, country_code: billingAddress.country_code.toLowerCase() }
    }

    isSubmitting.value = true
    errorMessage.value = null

    try {
        const updatedCart = await $fetch<{ cart: CartDTO }>("/api/cart/update", {
            method: "POST",
            body: payload
        })

        cart.value = updatedCart.cart
        currentStep.value = "payment"
    } catch (error) {
        console.error("Failed to update cart addresses:", error)
        errorMessage.value = "Could not save address details"
    } finally {
        isSubmitting.value = false
    }
}

async function handleSubmit(): Promise<void> {
    if (!stripe || !elements || !clientSecretValue.value) {
        return
    }

    isLoading.value = true

    try {
        const result = await stripe.confirmPayment({ elements, redirect: "if_required" })
        if (result.error) {
            errorMessage.value = result.error.message ?? "Payment failed"
            return
        }

        await completeCart()
    } finally {
        isLoading.value = false
    }
}

async function completeCart(): Promise<void> {
    isCheckoutActive.value = false

    const response = await fetch("/api/cart/complete-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            cartId: checkoutCart.value?.id,
            shippingOptionId: selectedShippingOptionId.value
        })
    })

    const payload = (await response.json()) as CompleteCartPayload
    const orderId = payload.order?.id

    if (orderId) {
        await createNewCart(cartStore)
        await router.push({ name: "order-completed", query: { orderId } })
    }
}

onMounted(async () => {
    if (!regionCountries.value.length) {
        await regionStore.fetchRegion()
    }

    if (!checkoutCart.value) {
        await cartStore.loadCart()
    }

    if (!checkoutCart.value?.items?.length) {
        await router.push("/cart")
        return
    }

    syncAddressesFromCart(checkoutCart.value)
    currentStep.value = deriveInitialStep()
    stripe = await loadStripe(String(config.public.STRIPE_PUBLIC_KEY))
    isBooting.value = false
})

onBeforeRouteLeave(() => cleanup())
onUnmounted(() => cleanup())

watch(
    () => checkoutCart.value,
    (currentCart) => {
        syncAddressesFromCart(currentCart)

        if (isBooting.value) {
            currentStep.value = deriveInitialStep()
        }
    },
    { immediate: true }
)

watch(
    () => [checkoutCart.value?.id, addressCompleted.value] as const,
    async ([cartId, hasAddress]) => {
        if (!isCheckoutActive.value) {
            return
        }

        if (!cartId || !hasAddress) {
            clearPaymentState()
            shippingOptions.value = []
            selectedShippingOptionId.value = null
            return
        }

        await loadShippingOptions()

        if (currentStep.value === "payment") {
            scheduleRefresh()
        }
    },
    { immediate: true }
)

watch(selectedShippingOptionId, scheduleRefresh)
watch(cartFingerprint, scheduleRefresh)
</script>

<template>
    <section class="checkoutPage">
        <div class="checkoutPage__hero">
            <VContainer class="checkoutPage__container">
                <div v-if="isBooting" class="checkoutPage__loadingState">
                    <VProgressCircular indeterminate color="primary" size="40" />
                    <p class="checkoutPage__loadingText">Preparing your checkout...</p>
                </div>
                <template v-else>
                    <div class="checkoutPage__heroGrid">
                        <div class="checkoutPage__copy">
                            <span class="checkoutPage__eyebrow">Single-page checkout</span>
                            <h1 class="checkoutPage__title">Move from cart to confirmation in one calm, guided flow.</h1>
                            <p class="checkoutPage__description">
                                Sign in or continue as a guest, add your delivery details, pick shipping, and finish payment without hopping
                                across separate pages.
                            </p>
                        </div>
                        <div class="checkoutPage__progressCard">
                            <div v-for="(step, index) in stepItems" :key="step.key" class="checkoutPage__stepItem">
                                <div
                                    class="checkoutPage__stepNumber"
                                    :class="{ 'checkoutPage__stepNumber--active': currentStep === step.key }"
                                >
                                    {{ index + 1 }}
                                </div>
                                <div>
                                    <div class="checkoutPage__stepLabel">{{ step.label }}</div>
                                    <div class="checkoutPage__stepText">{{ step.description }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="checkoutPage__contentGrid">
                        <div class="checkoutPage__main">
                            <VAlert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
                                {{ errorMessage }}
                            </VAlert>
                            <section class="checkoutPage__section" :class="{ 'checkoutPage__section--active': currentStep === 'account' }">
                                <div class="checkoutPage__sectionIntro">
                                    <span class="checkoutPage__sectionEyebrow">Step 1</span>
                                    <h2 class="checkoutPage__sectionTitle">Account or guest</h2>
                                    <p class="checkoutPage__sectionText">Choose the quickest way to continue with this order.</p>
                                </div>
                                <div v-if="identityCompleted" class="checkoutPage__statusCard">
                                    <div>
                                        <strong class="checkoutPage__statusTitle">Checkout identity ready</strong>
                                        <p class="checkoutPage__statusText">
                                            {{ customer?.email || checkoutEmail }}
                                        </p>
                                    </div>
                                    <VBtn variant="outlined" rounded="pill" class="text-none" @click="currentStep = 'address'"
                                    >Continue</VBtn
                                    >
                                </div>
                                <div v-else class="checkoutPage__sectionCard">
                                    <VTabs v-model="authTab" grow class="checkoutPage__tabs">
                                        <VTab value="login" class="text-none">Login</VTab>
                                        <VTab value="register" class="text-none">Create account</VTab>
                                        <VTab value="guest" class="text-none">Guest</VTab>
                                    </VTabs>
                                    <VWindow v-model="authTab" class="checkoutPage__window">
                                        <VWindowItem value="login">
                                            <div class="checkoutPage__socialButtons">
                                                <VBtn
                                                    block
                                                    class="checkoutPage__socialBtn text-none"
                                                    color="white"
                                                    @click="handleCheckoutSocialLogin('google')"
                                                >
                                                    <VImg src="/images/google_login_icon.svg" width="24" class="me-3" />
                                                    Login with Google
                                                </VBtn>
                                                <VBtn
                                                    block
                                                    class="checkoutPage__socialBtn text-none"
                                                    color="white"
                                                    @click="handleCheckoutSocialLogin('facebook')"
                                                >
                                                    <VImg src="/images/facebook_login_icon.svg" width="24" class="me-3" />
                                                    Login with Facebook
                                                </VBtn>
                                            </div>
                                            <div class="checkoutPage__divider"><span>Or continue with email</span></div>
                                            <VForm ref="loginFormRef" class="checkoutPage__form" @submit.prevent="handleCheckoutLogin">
                                                <VTextField v-model="loginEmail" :rules="emailRules" label="Email" variant="outlined" />
                                                <VTextField
                                                    v-model="loginPassword"
                                                    :rules="passwordRules"
                                                    label="Password"
                                                    type="password"
                                                    variant="outlined"
                                                />
                                                <VBtn
                                                    color="primary"
                                                    rounded="pill"
                                                    class="text-none"
                                                    block
                                                    :loading="isSubmitting || auth.loading.value"
                                                    type="submit"
                                                >
                                                    Log in and continue
                                                </VBtn>
                                            </VForm>
                                        </VWindowItem>
                                        <VWindowItem value="register">
                                            <VForm class="checkoutPage__form" @submit.prevent="submitRegister">
                                                <div class="checkoutPage__nameGrid">
                                                    <VTextField v-model="regFirstName" label="First name" variant="outlined" required />
                                                    <VTextField v-model="regLastName" label="Last name" variant="outlined" required />
                                                </div>
                                                <VTextField
                                                    v-model="regEmail"
                                                    :rules="emailRules"
                                                    label="Email"
                                                    type="email"
                                                    variant="outlined"
                                                    required
                                                />
                                                <VTextField
                                                    v-model="regPassword"
                                                    :rules="passwordRules"
                                                    label="Password"
                                                    type="password"
                                                    variant="outlined"
                                                    required
                                                />
                                                <VBtn
                                                    color="primary"
                                                    rounded="pill"
                                                    class="text-none"
                                                    block
                                                    :loading="isSubmitting || auth.loading.value"
                                                    type="submit"
                                                >
                                                    Create account and continue
                                                </VBtn>
                                            </VForm>
                                        </VWindowItem>
                                        <VWindowItem value="guest">
                                            <VForm class="checkoutPage__form" @submit.prevent="submitGuest">
                                                <VTextField
                                                    v-model="guestEmail"
                                                    :rules="emailRules"
                                                    label="Email"
                                                    type="email"
                                                    variant="outlined"
                                                    required
                                                />
                                                <VBtn
                                                    color="primary"
                                                    rounded="pill"
                                                    class="text-none"
                                                    block
                                                    :loading="isSubmitting"
                                                    type="submit"
                                                >
                                                    Continue as guest
                                                </VBtn>
                                            </VForm>
                                        </VWindowItem>
                                    </VWindow>
                                </div>
                            </section>
                            <section class="checkoutPage__section" :class="{ 'checkoutPage__section--active': currentStep === 'address' }">
                                <div class="checkoutPage__sectionIntro">
                                    <span class="checkoutPage__sectionEyebrow">Step 2</span>
                                    <h2 class="checkoutPage__sectionTitle">Billing and shipping</h2>
                                    <p class="checkoutPage__sectionText">
                                        Add the address details for this order without leaving checkout.
                                    </p>
                                </div>
                                <div v-if="!identityCompleted" class="checkoutPage__disabledCard">
                                    Complete the account step first to unlock the address form.
                                </div>
                                <div v-else class="checkoutPage__sectionCard">
                                    <VForm ref="addressFormRef" class="checkoutPage__form" @submit.prevent="submitAddresses">
                                        <div class="checkoutPage__subsection">
                                            <h3 class="checkoutPage__subsectionTitle">Billing address</h3>
                                            <div class="checkoutPage__nameGrid">
                                                <VTextField
                                                    v-model="billingAddress.first_name"
                                                    label="First name"
                                                    :rules="[addressRules.required]"
                                                    variant="outlined"
                                                />
                                                <VTextField
                                                    v-model="billingAddress.last_name"
                                                    label="Last name"
                                                    :rules="[addressRules.required]"
                                                    variant="outlined"
                                                />
                                            </div>
                                            <VTextField
                                                v-model="billingAddress.address_1"
                                                label="Address line 1"
                                                :rules="[addressRules.required]"
                                                variant="outlined"
                                            />
                                            <VTextField v-model="billingAddress.address_2" label="Address line 2" variant="outlined" />
                                            <div class="checkoutPage__tripleGrid">
                                                <VTextField
                                                    v-model="billingAddress.postal_code"
                                                    label="Postal code"
                                                    :rules="[addressRules.required]"
                                                    variant="outlined"
                                                />
                                                <VTextField
                                                    v-model="billingAddress.city"
                                                    label="City"
                                                    :rules="[addressRules.required]"
                                                    variant="outlined"
                                                />
                                                <VTextField
                                                    v-model="billingAddress.province"
                                                    label="Province / State"
                                                    :rules="[addressRules.required]"
                                                    variant="outlined"
                                                />
                                            </div>
                                            <div class="checkoutPage__doubleGrid">
                                                <VSelect
                                                    v-model="billingAddress.country_code"
                                                    :items="regionCountries"
                                                    item-title="display_name"
                                                    item-value="iso_2"
                                                    label="Country"
                                                    :rules="[addressRules.required]"
                                                    variant="outlined"
                                                />
                                                <VTextField
                                                    v-model="billingAddress.phone"
                                                    label="Phone"
                                                    :rules="[addressRules.required, addressRules.phone]"
                                                    variant="outlined"
                                                />
                                            </div>
                                        </div>
                                        <VCheckbox v-model="useSeparateShipping" label="Use a separate shipping address" hide-details />
                                        <div v-if="useSeparateShipping" class="checkoutPage__subsection">
                                            <h3 class="checkoutPage__subsectionTitle">Shipping address</h3>
                                            <div class="checkoutPage__nameGrid">
                                                <VTextField
                                                    v-model="shippingAddress.first_name"
                                                    label="First name"
                                                    :rules="[addressRules.required]"
                                                    variant="outlined"
                                                />
                                                <VTextField
                                                    v-model="shippingAddress.last_name"
                                                    label="Last name"
                                                    :rules="[addressRules.required]"
                                                    variant="outlined"
                                                />
                                            </div>
                                            <VTextField
                                                v-model="shippingAddress.address_1"
                                                label="Address line 1"
                                                :rules="[addressRules.required]"
                                                variant="outlined"
                                            />
                                            <VTextField v-model="shippingAddress.address_2" label="Address line 2" variant="outlined" />
                                            <div class="checkoutPage__tripleGrid">
                                                <VTextField
                                                    v-model="shippingAddress.postal_code"
                                                    label="Postal code"
                                                    :rules="[addressRules.required]"
                                                    variant="outlined"
                                                />
                                                <VTextField
                                                    v-model="shippingAddress.city"
                                                    label="City"
                                                    :rules="[addressRules.required]"
                                                    variant="outlined"
                                                />
                                                <VTextField
                                                    v-model="shippingAddress.province"
                                                    label="Province / State"
                                                    :rules="[addressRules.required]"
                                                    variant="outlined"
                                                />
                                            </div>
                                            <div class="checkoutPage__doubleGrid">
                                                <VSelect
                                                    v-model="shippingAddress.country_code"
                                                    :items="regionCountries"
                                                    item-title="display_name"
                                                    item-value="iso_2"
                                                    label="Country"
                                                    :rules="[addressRules.required]"
                                                    variant="outlined"
                                                />
                                                <VTextField
                                                    v-model="shippingAddress.phone"
                                                    label="Phone"
                                                    :rules="[addressRules.required, addressRules.phone]"
                                                    variant="outlined"
                                                />
                                            </div>
                                        </div>
                                        <div class="checkoutPage__buttonRow">
                                            <VBtn variant="outlined" rounded="pill" class="text-none" @click="currentStep = 'account'"
                                            >Back</VBtn
                                            >
                                            <VBtn color="primary" rounded="pill" class="text-none" :loading="isSubmitting" type="submit"
                                            >Save and continue</VBtn
                                            >
                                        </div>
                                    </VForm>
                                </div>
                            </section>

                            <section class="checkoutPage__section" :class="{ 'checkoutPage__section--active': currentStep === 'payment' }">
                                <div class="checkoutPage__sectionIntro">
                                    <span class="checkoutPage__sectionEyebrow">Step 3</span>
                                    <h2 class="checkoutPage__sectionTitle">Shipping and payment</h2>
                                    <p class="checkoutPage__sectionText">Choose a delivery method and finish payment on the same screen.</p>
                                </div>
                                <div v-if="!addressCompleted" class="checkoutPage__disabledCard">
                                    Save your address details first to unlock shipping options and payment.
                                </div>
                                <div v-else class="checkoutPage__sectionCard checkoutPage__paymentGrid">
                                    <div class="checkoutPage__shippingCard">
                                        <div class="checkoutPage__subsectionTitle">Shipping method</div>
                                        <template v-if="isShippingLoading">
                                            <VSkeletonLoader type="list-item" />
                                            <VSkeletonLoader type="list-item" />
                                        </template>
                                        <VRadioGroup v-else v-model="selectedShippingOptionId" class="checkoutPage__shippingOptions">
                                            <VRadio
                                                v-for="option in shippingOptions"
                                                :key="option.id"
                                                :value="option.id"
                                                :label="
                                                    option.name +
                                                        ' - ' +
                                                        (option.calculated_price
                                                            ? formatPrice(option.calculated_price.calculated_amount, currencyCode)
                                                            : option.prices.length
                                                                ? formatPrice(option.prices[0]!.amount, option.prices[0]!.currency_code)
                                                                : 'Free')
                                                "
                                            />
                                        </VRadioGroup>
                                    </div>
                                    <div class="checkoutPage__paymentCard">
                                        <div class="checkoutPage__subsectionTitle">Payment details</div>
                                        <div id="link-authentication-element"></div>
                                        <div id="payment-element" class="checkoutPage__paymentElement"></div>
                                        <div class="checkoutPage__buttonRow checkoutPage__buttonRow--payment">
                                            <VBtn variant="outlined" rounded="pill" class="text-none" @click="currentStep = 'address'"
                                            >Back</VBtn
                                            >
                                            <VBtn
                                                color="primary"
                                                rounded="pill"
                                                class="text-none"
                                                :loading="isLoading || isPaymentInitializing"
                                                :disabled="!clientSecretValue || isShippingLoading || isPaymentInitializing"
                                                @click="handleSubmit"
                                            >
                                                Pay now
                                            </VBtn>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <aside class="checkoutPage__summaryColumn">
                            <div class="checkoutPage__summaryCard">
                                <span class="checkoutPage__sectionEyebrow">Order summary</span>
                                <h2 class="checkoutPage__summaryTitle">Everything you are checking out with today.</h2>
                                <div class="checkoutPage__summaryItems">
                                    <article v-for="item in lineItems" :key="item.id" class="checkoutPage__summaryItem">
                                        <VImg
                                            :src="item.thumbnail || '/images/placeholder.png'"
                                            :alt="item.product_title || 'Product image'"
                                            width="72"
                                            height="88"
                                            class="checkoutPage__summaryImage"
                                            cover
                                        />
                                        <div class="checkoutPage__summaryItemBody">
                                            <strong class="checkoutPage__summaryItemTitle">{{ item.product_title }}</strong>
                                            <span class="checkoutPage__summaryItemMeta">{{ item.variant_title || "Standard option" }}</span>
                                            <span class="checkoutPage__summaryItemMeta">Qty {{ item.quantity }}</span>
                                        </div>
                                        <strong class="checkoutPage__summaryItemPrice">
                                            {{ formatPrice(Number(item.total ?? item.unit_price) || 0, currencyCode) }}
                                        </strong>
                                    </article>
                                </div>
                                <div class="checkoutPage__totals">
                                    <div class="checkoutPage__totalRow">
                                        <span>Items</span>
                                        <span>{{ itemCount }}</span>
                                    </div>
                                    <div class="checkoutPage__totalRow">
                                        <span>Subtotal</span>
                                        <span>{{ formatPrice(Number(checkoutCart?.subtotal || 0), currencyCode) }}</span>
                                    </div>
                                    <div class="checkoutPage__totalRow">
                                        <span>Total</span>
                                        <strong>{{ formatPrice(Number(checkoutCart?.total || 0), currencyCode) }}</strong>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </template>
            </VContainer>
        </div>
    </section>
</template>

<style scoped lang="scss">
.checkoutPage {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.checkoutPage__hero {
    padding: clamp(4.75rem, 7vw, 6.5rem) 0 clamp(4rem, 7vw, 6rem);
}

.checkoutPage__container {
    position: relative;
    z-index: 1;
}

.checkoutPage__heroGrid,
.checkoutPage__contentGrid,
.checkoutPage__paymentGrid,
.checkoutPage__nameGrid,
.checkoutPage__doubleGrid,
.checkoutPage__tripleGrid {
    display: grid;
    gap: 1rem;
}

.checkoutPage__heroGrid,
.checkoutPage__contentGrid {
    gap: clamp(1.5rem, 3vw, 2rem);
}

.checkoutPage__heroGrid {
    grid-template-columns: minmax(0, 1.1fr) minmax(18rem, 0.9fr);
    align-items: end;
    margin-bottom: clamp(2rem, 4vw, 3rem);
}

.checkoutPage__contentGrid {
    grid-template-columns: minmax(0, 1.15fr) minmax(19rem, 0.85fr);
    align-items: start;
}

.checkoutPage__copy,
.checkoutPage__progressCard,
.checkoutPage__main,
.checkoutPage__summaryColumn {
    animation: checkout-rise 0.8s ease both;
}

.checkoutPage__progressCard,
.checkoutPage__summaryColumn {
    animation-delay: 0.12s;
}

.checkoutPage__eyebrow,
.checkoutPage__sectionEyebrow {
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

.checkoutPage__title,
.checkoutPage__sectionTitle,
.checkoutPage__summaryTitle {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.checkoutPage__title {
    max-width: 12ch;
    margin: 1rem 0;
    font-size: clamp(2.4rem, 4.4vw, 4.5rem);
    line-height: 0.95;
}

.checkoutPage__description,
.checkoutPage__sectionText,
.checkoutPage__loadingText,
.checkoutPage__stepText,
.checkoutPage__statusText,
.checkoutPage__summaryItemMeta {
    margin: 0;
    color: #4b5874;
    line-height: 1.75;
}

.checkoutPage__progressCard,
.checkoutPage__sectionCard,
.checkoutPage__summaryCard,
.checkoutPage__statusCard,
.checkoutPage__disabledCard {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.checkoutPage__progressCard,
.checkoutPage__sectionCard,
.checkoutPage__summaryCard,
.checkoutPage__statusCard,
.checkoutPage__disabledCard {
    padding: clamp(1.3rem, 2vw, 1.8rem);
}

.checkoutPage__stepItem {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.85rem;
}

.checkoutPage__stepItem + .checkoutPage__stepItem {
    margin-top: 0.95rem;
}

.checkoutPage__stepNumber {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 999px;
    background: rgba(8, 23, 63, 0.08);
    color: #08173f;
    font-weight: 700;
}

.checkoutPage__stepNumber--active {
    background: #010c80;
    color: #ffffff;
}

.checkoutPage__stepLabel,
.checkoutPage__statusTitle,
.checkoutPage__subsectionTitle,
.checkoutPage__summaryItemTitle {
    color: #08173f;
    font-weight: 700;
}

.checkoutPage__main {
    display: grid;
    gap: 1.25rem;
}

.checkoutPage__section {
    display: grid;
    gap: 0.9rem;
}

.checkoutPage__section--active .checkoutPage__sectionTitle {
    color: #010c80;
}

.checkoutPage__sectionTitle,
.checkoutPage__summaryTitle {
    margin: 1rem 0 0.75rem;
    font-size: clamp(1.6rem, 2.4vw, 2.15rem);
    line-height: 1.08;
}

.checkoutPage__tabs {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 999px;
    background: rgba(247, 250, 255, 0.9);
    padding: 0.25rem;
}

.checkoutPage__window,
.checkoutPage__form,
.checkoutPage__socialButtons,
.checkoutPage__subsection,
.checkoutPage__summaryItems,
.checkoutPage__totals {
    display: grid;
    gap: 0.9rem;
}

.checkoutPage__window {
    margin-top: 1rem;
}

.checkoutPage__socialBtn {
    justify-content: flex-start;
    min-height: 3.2rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 999px;
    box-shadow: none;
}

.checkoutPage__divider {
    position: relative;
    margin: 1.2rem 0;
    color: #6a7590;
    font-size: 0.9rem;
    text-align: center;
}

.checkoutPage__divider::before {
    content: "";
    position: absolute;
    inset: 50% 0 auto;
    border-top: 1px solid rgba(8, 23, 63, 0.08);
}

.checkoutPage__divider span {
    position: relative;
    display: inline-block;
    padding: 0 0.9rem;
    background: rgba(255, 255, 255, 0.96);
}

.checkoutPage__nameGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.checkoutPage__doubleGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.checkoutPage__tripleGrid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}

.checkoutPage__statusCard,
.checkoutPage__buttonRow,
.checkoutPage__summaryItem,
.checkoutPage__totalRow {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}

.checkoutPage__statusCard,
.checkoutPage__buttonRow,
.checkoutPage__summaryItem,
.checkoutPage__totalRow {
    align-items: center;
}

.checkoutPage__disabledCard {
    color: #4b5874;
}

.checkoutPage__paymentGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.checkoutPage__shippingCard,
.checkoutPage__paymentCard {
    display: grid;
    gap: 1rem;
}

.checkoutPage__paymentElement {
    margin-top: 0.4rem;
}

.checkoutPage__buttonRow {
    margin-top: 0.5rem;
}

.checkoutPage__buttonRow--payment {
    margin-top: 1rem;
}

.checkoutPage__summaryColumn {
    position: sticky;
    top: 1.5rem;
}

.checkoutPage__summaryItem {
    align-items: flex-start;
    padding-bottom: 0.9rem;
    border-bottom: 1px solid rgba(8, 23, 63, 0.08);
}

.checkoutPage__summaryImage {
    border-radius: 1rem;
    background: #edf2ff;
}

.checkoutPage__summaryItemBody {
    display: grid;
    flex: 1;
    gap: 0.15rem;
}

.checkoutPage__summaryItemPrice {
    color: #08173f;
}

.checkoutPage__totalRow {
    color: #4b5874;
}

.checkoutPage__totalRow strong {
    color: #08173f;
}

.checkoutPage__loadingState {
    display: grid;
    justify-items: center;
    gap: 0.9rem;
    padding: 4rem 0;
}

@keyframes checkout-rise {
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
    .checkoutPage__heroGrid,
    .checkoutPage__contentGrid,
    .checkoutPage__paymentGrid {
        grid-template-columns: 1fr;
    }

    .checkoutPage__title {
        max-width: 100%;
    }

    .checkoutPage__summaryColumn {
        position: static;
    }
}

@media screen and (max-width: 700px) {
    .checkoutPage__hero {
        padding: 3.75rem 0 3.5rem;
    }

    .checkoutPage__title {
        font-size: clamp(2rem, 9vw, 2.8rem);
        line-height: 1;
    }

    .checkoutPage__progressCard,
    .checkoutPage__sectionCard,
    .checkoutPage__summaryCard,
    .checkoutPage__statusCard,
    .checkoutPage__disabledCard {
        border-radius: 1.2rem;
    }

    .checkoutPage__nameGrid,
    .checkoutPage__doubleGrid,
    .checkoutPage__tripleGrid {
        grid-template-columns: 1fr;
    }

    .checkoutPage__statusCard,
    .checkoutPage__buttonRow,
    .checkoutPage__summaryItem,
    .checkoutPage__totalRow {
        flex-direction: column;
        align-items: flex-start;
    }
}

@media (prefers-reduced-motion: reduce) {
    .checkoutPage__copy,
    .checkoutPage__progressCard,
    .checkoutPage__main,
    .checkoutPage__summaryColumn {
        animation: none;
    }
}
</style>
