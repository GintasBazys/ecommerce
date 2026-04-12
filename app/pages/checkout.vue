<script setup lang="ts">
import { loadStripe } from "@stripe/stripe-js/pure"

import TaxedLinePrice from "../components/Cart/TaxedLinePrice.vue"

import type { Address, ShippingOption, VForm } from "@/types/interfaces"
import type { CartDTO, CartLineItemDTO } from "@medusajs/types"
import type { Stripe, StripeElements, StripeLinkAuthenticationElement, StripePaymentElement } from "@stripe/stripe-js"

import { formatPrice } from "@/utils/formatPrice"
import { DEFAULT_CURENCY } from "~/utils/consts"

definePageMeta({ layout: "checkout" })
useHead({ title: "Checkout | Ecommerce" })

type CheckoutStep = "account" | "address" | "payment"
type AuthTab = "login" | "register" | "guest"
type CheckoutCart = CartDTO & { email?: string | null }
type PricedCartLineItem = CartLineItemDTO & {
    subtotal?: number | null
    total?: number | null
    tax_total?: number | null
    unit_price?: number | null
}
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

function getAmountWithTax(item: CartLineItemDTO): number {
    const pricedItem = item as PricedCartLineItem
    return Number(pricedItem.total ?? pricedItem.unit_price ?? 0)
}

function getAmountWithoutTax(item: CartLineItemDTO): number {
    const pricedItem = item as PricedCartLineItem

    if (pricedItem.subtotal != null) {
        return Number(pricedItem.subtotal)
    }

    return getAmountWithTax(item) - Number(pricedItem.tax_total ?? 0)
}

function getShippingOptionLabel(option: ShippingOption): string {
    const amount = option.calculated_price
        ? option.calculated_price.calculated_amount
        : option.prices.length
          ? option.prices[0]!.amount
          : null

    return `${option.name} - ${amount != null ? formatPrice(amount, currencyCode.value) : "Free"}`
}

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
    <section class="checkout-page">
        <div class="checkout-page__hero">
            <VContainer class="checkout-page__container">
                <div v-if="isBooting" class="checkout-page__loading-state">
                    <VProgressCircular indeterminate color="primary" size="40" />
                    <p class="checkout-page__loading-text">Preparing your checkout...</p>
                </div>
                <template v-else>
                    <div class="checkout-page__hero-grid">
                        <div class="checkout-page__copy">
                            <span class="checkout-page__eyebrow">Single-page checkout</span>
                            <h1 class="checkout-page__title">Move from cart to confirmation in one calm, guided flow.</h1>
                            <p class="checkout-page__description">
                                Sign in or continue as a guest, add your delivery details, pick shipping, and finish payment without hopping
                                across separate pages.
                            </p>
                        </div>
                        <div class="checkout-page__progress-card">
                            <div v-for="(step, index) in stepItems" :key="step.key" class="checkout-page__step-item">
                                <div
                                    class="checkout-page__step-number"
                                    :class="{ 'checkout-page__step-number--active': currentStep === step.key }"
                                >
                                    {{ index + 1 }}
                                </div>
                                <div>
                                    <div class="checkout-page__step-label">{{ step.label }}</div>
                                    <div class="checkout-page__step-text">{{ step.description }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="checkout-page__content-grid">
                        <div class="checkout-page__main">
                            <VAlert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
                                {{ errorMessage }}
                            </VAlert>
                            <section
                                class="checkout-page__section"
                                :class="{ 'checkout-page__section--active': currentStep === 'account' }"
                            >
                                <div class="checkout-page__section-intro">
                                    <span class="checkout-page__section-eyebrow">Step 1</span>
                                    <h2 class="checkout-page__section-title">Account or guest</h2>
                                    <p class="checkout-page__section-text">Choose the quickest way to continue with this order.</p>
                                </div>
                                <div v-if="identityCompleted" class="checkout-page__status-card">
                                    <div>
                                        <strong class="checkout-page__status-title">Checkout identity ready</strong>
                                        <p class="checkout-page__status-text">
                                            {{ customer?.email || checkoutEmail }}
                                        </p>
                                    </div>
                                    <VBtn variant="outlined" rounded="pill" class="text-none" @click="currentStep = 'address'">
                                        Continue
                                    </VBtn>
                                </div>
                                <div v-else class="checkout-page__section-card">
                                    <VTabs v-model="authTab" grow class="checkout-page__tabs">
                                        <VTab value="login" class="text-none">Login</VTab>
                                        <VTab value="register" class="text-none">Create account</VTab>
                                        <VTab value="guest" class="text-none">Guest</VTab>
                                    </VTabs>
                                    <VWindow v-model="authTab" class="checkout-page__window">
                                        <VWindowItem value="login">
                                            <div class="checkout-page__social-buttons">
                                                <VBtn
                                                    block
                                                    class="checkout-page__social-btn text-none"
                                                    color="white"
                                                    @click="handleCheckoutSocialLogin('google')"
                                                >
                                                    <VImg src="/images/google_login_icon.svg" width="24" class="me-3" />
                                                    Login with Google
                                                </VBtn>
                                                <VBtn
                                                    block
                                                    class="checkout-page__social-btn text-none"
                                                    color="white"
                                                    @click="handleCheckoutSocialLogin('facebook')"
                                                >
                                                    <VImg src="/images/facebook_login_icon.svg" width="24" class="me-3" />
                                                    Login with Facebook
                                                </VBtn>
                                            </div>
                                            <div class="checkout-page__divider"><span>Or continue with email</span></div>
                                            <VForm ref="loginFormRef" class="checkout-page__form" @submit.prevent="handleCheckoutLogin">
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
                                            <VForm class="checkout-page__form" @submit.prevent="submitRegister">
                                                <div class="checkout-page__name-grid">
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
                                            <VForm class="checkout-page__form" @submit.prevent="submitGuest">
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
                            <section
                                class="checkout-page__section"
                                :class="{ 'checkout-page__section--active': currentStep === 'address' }"
                            >
                                <div class="checkout-page__section-intro">
                                    <span class="checkout-page__section-eyebrow">Step 2</span>
                                    <h2 class="checkout-page__section-title">Billing and shipping</h2>
                                    <p class="checkout-page__section-text">
                                        Add the address details for this order without leaving checkout.
                                    </p>
                                </div>
                                <div v-if="!identityCompleted" class="checkout-page__disabled-card">
                                    Complete the account step first to unlock the address form.
                                </div>
                                <div v-else class="checkout-page__section-card">
                                    <VForm ref="addressFormRef" class="checkout-page__form" @submit.prevent="submitAddresses">
                                        <div class="checkout-page__subsection">
                                            <h3 class="checkout-page__subsection-title">Billing address</h3>
                                            <div class="checkout-page__name-grid">
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
                                            <div class="checkout-page__triple-grid">
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
                                            <div class="checkout-page__double-grid">
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
                                        <div v-if="useSeparateShipping" class="checkout-page__subsection">
                                            <h3 class="checkout-page__subsection-title">Shipping address</h3>
                                            <div class="checkout-page__name-grid">
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
                                            <div class="checkout-page__triple-grid">
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
                                            <div class="checkout-page__double-grid">
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
                                        <div class="checkout-page__button-row">
                                            <VBtn variant="outlined" rounded="pill" class="text-none" @click="currentStep = 'account'">
                                                Back
                                            </VBtn>
                                            <VBtn color="primary" rounded="pill" class="text-none" :loading="isSubmitting" type="submit">
                                                Save and continue
                                            </VBtn>
                                        </div>
                                    </VForm>
                                </div>
                            </section>

                            <section
                                class="checkout-page__section"
                                :class="{ 'checkout-page__section--active': currentStep === 'payment' }"
                            >
                                <div class="checkout-page__section-intro">
                                    <span class="checkout-page__section-eyebrow">Step 3</span>
                                    <h2 class="checkout-page__section-title">Shipping and payment</h2>
                                    <p class="checkout-page__section-text">
                                        Choose a delivery method and finish payment on the same screen.
                                    </p>
                                </div>
                                <div v-if="!addressCompleted" class="checkout-page__disabled-card">
                                    Save your address details first to unlock shipping options and payment.
                                </div>
                                <div v-else class="checkout-page__section-card checkout-page__payment-grid">
                                    <div class="checkout-page__shipping-card">
                                        <div class="checkout-page__subsection-title">Shipping method</div>
                                        <template v-if="isShippingLoading">
                                            <VSkeletonLoader type="list-item" />
                                            <VSkeletonLoader type="list-item" />
                                        </template>
                                        <VRadioGroup v-else v-model="selectedShippingOptionId" class="checkout-page__shipping-options">
                                            <VRadio
                                                v-for="option in shippingOptions"
                                                :key="option.id"
                                                :value="option.id"
                                                :label="getShippingOptionLabel(option)"
                                            />
                                        </VRadioGroup>
                                    </div>
                                    <div class="checkout-page__payment-card">
                                        <div class="checkout-page__subsection-title">Payment details</div>
                                        <div id="link-authentication-element"></div>
                                        <div id="payment-element" class="checkout-page__payment-element"></div>
                                        <div class="checkout-page__button-row checkout-page__button-row--payment">
                                            <VBtn variant="outlined" rounded="pill" class="text-none" @click="currentStep = 'address'">
                                                Back
                                            </VBtn>
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

                        <aside class="checkout-page__summary-column">
                            <div class="checkout-page__summary-card">
                                <span class="checkout-page__section-eyebrow">Order summary</span>
                                <h2 class="checkout-page__summary-title">Everything you are checking out with today.</h2>
                                <div class="checkout-page__summary-items">
                                    <article v-for="item in lineItems" :key="item.id" class="checkout-page__summary-item">
                                        <VImg
                                            :src="item.thumbnail || '/images/placeholder.png'"
                                            :alt="item.product_title || 'Product image'"
                                            width="72"
                                            height="88"
                                            class="checkout-page__summary-image"
                                            cover
                                        />
                                        <div class="checkout-page__summary-item-body">
                                            <strong class="checkout-page__summary-item-title">{{ item.product_title }}</strong>
                                            <span class="checkout-page__summary-item-meta">{{
                                                item.variant_title || "Standard option"
                                            }}</span>
                                            <span class="checkout-page__summary-item-meta">Qty {{ item.quantity }}</span>
                                        </div>
                                        <div class="checkout-page__summary-item-price">
                                            <TaxedLinePrice
                                                :amount-with-tax="getAmountWithTax(item)"
                                                :amount-without-tax="getAmountWithoutTax(item)"
                                            />
                                        </div>
                                    </article>
                                </div>
                                <div class="checkout-page__totals">
                                    <div class="checkout-page__total-row">
                                        <span>Items</span>
                                        <span>{{ itemCount }}</span>
                                    </div>
                                    <div class="checkout-page__total-row">
                                        <span>Subtotal</span>
                                        <span>{{ formatPrice(Number(checkoutCart?.subtotal || 0), currencyCode) }}</span>
                                    </div>
                                    <div class="checkout-page__total-row">
                                        <span>Shipping</span>
                                        <span>{{ formatPrice(Number(checkoutCart?.shipping_total || 0), currencyCode) }}</span>
                                    </div>
                                    <div class="checkout-page__total-row">
                                        <span>Tax</span>
                                        <span>{{ formatPrice(Number(checkoutCart?.tax_total || 0), currencyCode) }}</span>
                                    </div>
                                    <div class="checkout-page__total-row">
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
.checkout-page {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.checkout-page__hero {
    padding: 6rem 0 5.5rem;
}

.checkout-page__container {
    position: relative;
    z-index: 1;
}

.checkout-page__hero-grid,
.checkout-page__content-grid,
.checkout-page__payment-grid,
.checkout-page__name-grid,
.checkout-page__double-grid,
.checkout-page__triple-grid {
    display: grid;
    gap: 1rem;
}

.checkout-page__hero-grid,
.checkout-page__content-grid {
    gap: 2rem;
}

.checkout-page__hero-grid {
    grid-template-columns: minmax(0, 1.1fr) minmax(18rem, 0.9fr);
    align-items: end;
    margin-bottom: 3rem;
}

.checkout-page__content-grid {
    grid-template-columns: minmax(0, 1.15fr) minmax(19rem, 0.85fr);
    align-items: start;
}

.checkout-page__copy,
.checkout-page__progress-card,
.checkout-page__main,
.checkout-page__summary-column {
    animation: checkout-rise 0.8s ease both;
}

.checkout-page__progress-card,
.checkout-page__summary-column {
    animation-delay: 0.12s;
}

.checkout-page__eyebrow,
.checkout-page__section-eyebrow {
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

.checkout-page__title,
.checkout-page__section-title,
.checkout-page__summary-title {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.checkout-page__title {
    max-width: 12ch;
    margin: 1rem 0;
    font-size: 4.5rem;
    line-height: 0.95;
}

.checkout-page__description,
.checkout-page__section-text,
.checkout-page__loading-text,
.checkout-page__step-text,
.checkout-page__status-text,
.checkout-page__summary-item-meta {
    margin: 0;
    color: #4b5874;
    line-height: 1.75;
}

.checkout-page__progress-card,
.checkout-page__section-card,
.checkout-page__summary-card,
.checkout-page__status-card,
.checkout-page__disabled-card {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.checkout-page__progress-card,
.checkout-page__section-card,
.checkout-page__summary-card,
.checkout-page__status-card,
.checkout-page__disabled-card {
    padding: 1.8rem;
}

.checkout-page__step-item {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.85rem;
}

.checkout-page__step-item + .checkout-page__step-item {
    margin-top: 0.95rem;
}

.checkout-page__step-number {
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

.checkout-page__step-number--active {
    background: #010c80;
    color: #ffffff;
}

.checkout-page__step-label,
.checkout-page__status-title,
.checkout-page__subsection-title,
.checkout-page__summary-item-title {
    color: #08173f;
    font-weight: 700;
}

.checkout-page__main {
    display: grid;
    gap: 1.25rem;
}

.checkout-page__section {
    display: grid;
    gap: 0.9rem;
}

.checkout-page__section--active .checkout-page__section-title {
    color: #010c80;
}

.checkout-page__section-title,
.checkout-page__summary-title {
    margin: 1rem 0 0.75rem;
    font-size: 2.15rem;
    line-height: 1.08;
}

.checkout-page__tabs {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 999px;
    background: rgba(247, 250, 255, 0.9);
    padding: 0.25rem;
}

.checkout-page__window,
.checkout-page__form,
.checkout-page__social-buttons,
.checkout-page__subsection,
.checkout-page__summary-items,
.checkout-page__totals {
    display: grid;
    gap: 0.9rem;
}

.checkout-page__window {
    margin-top: 1rem;
}

.checkout-page__social-btn {
    justify-content: flex-start;
    min-height: 3.2rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 999px;
    box-shadow: none;
}

.checkout-page__divider {
    position: relative;
    margin: 1.2rem 0;
    color: #6a7590;
    font-size: 0.9rem;
    text-align: center;
}

.checkout-page__divider::before {
    content: "";
    position: absolute;
    inset: 50% 0 auto;
    border-top: 1px solid rgba(8, 23, 63, 0.08);
}

.checkout-page__divider span {
    position: relative;
    display: inline-block;
    padding: 0 0.9rem;
    background: rgba(255, 255, 255, 0.96);
}

.checkout-page__name-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.checkout-page__double-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.checkout-page__triple-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}

.checkout-page__status-card,
.checkout-page__button-row,
.checkout-page__summary-item,
.checkout-page__total-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}

.checkout-page__status-card,
.checkout-page__button-row,
.checkout-page__summary-item,
.checkout-page__total-row {
    align-items: center;
}

.checkout-page__disabled-card {
    color: #4b5874;
}

.checkout-page__payment-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.checkout-page__shipping-card,
.checkout-page__payment-card {
    display: grid;
    gap: 1rem;
}

.checkout-page__payment-element {
    margin-top: 0.4rem;
}

.checkout-page__button-row {
    margin-top: 0.5rem;
}

.checkout-page__button-row--payment {
    margin-top: 1rem;
}

.checkout-page__summary-column {
    position: sticky;
    top: 1.5rem;
}

.checkout-page__summary-item {
    align-items: flex-start;
    padding-bottom: 0.9rem;
    border-bottom: 1px solid rgba(8, 23, 63, 0.08);
}

.checkout-page__summary-image {
    border-radius: 1rem;
    background: #edf2ff;
}

.checkout-page__summary-item-body {
    display: grid;
    flex: 1;
    gap: 0.15rem;
}

.checkout-page__summary-item-price {
    color: #08173f;
}

.checkout-page__total-row {
    color: #4b5874;
}

.checkout-page__total-row strong {
    color: #08173f;
}

.checkout-page__loading-state {
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
    .checkout-page__hero {
        padding: 5rem 0 4.5rem;
    }

    .checkout-page__hero-grid,
    .checkout-page__content-grid,
    .checkout-page__payment-grid {
        grid-template-columns: 1fr;
    }

    .checkout-page__title {
        font-size: 3.5rem;
        max-width: 100%;
    }

    .checkout-page__summary-column {
        position: static;
    }

    .checkout-page__section-title,
    .checkout-page__summary-title {
        font-size: 1.9rem;
    }
}

@media screen and (max-width: 700px) {
    .checkout-page__hero {
        padding: 3.75rem 0 3.5rem;
    }

    .checkout-page__title {
        font-size: 2.8rem;
        line-height: 1;
    }

    .checkout-page__progress-card,
    .checkout-page__section-card,
    .checkout-page__summary-card,
    .checkout-page__status-card,
    .checkout-page__disabled-card {
        border-radius: 1.2rem;
        padding: 1.3rem;
    }

    .checkout-page__name-grid,
    .checkout-page__double-grid,
    .checkout-page__triple-grid {
        grid-template-columns: 1fr;
    }

    .checkout-page__status-card,
    .checkout-page__button-row,
    .checkout-page__summary-item,
    .checkout-page__total-row {
        flex-direction: column;
        align-items: flex-start;
    }

    .checkout-page__section-title,
    .checkout-page__summary-title {
        font-size: 1.6rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .checkout-page__copy,
    .checkout-page__progress-card,
    .checkout-page__main,
    .checkout-page__summary-column {
        animation: none;
    }
}
</style>
