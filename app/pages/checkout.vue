<script setup lang="ts">
import { loadStripe } from "@stripe/stripe-js/pure"

import TaxedLinePrice from "../components/Cart/TaxedLinePrice.vue"

import type { Address, ShippingOption } from "@/types/interfaces"
import type { CartDTO, CartLineItemDTO } from "@medusajs/types"
import type { Stripe, StripeElements, StripeLinkAuthenticationElement, StripePaymentElement } from "@stripe/stripe-js"

import { formatPrice } from "@/utils/formatPrice"
import { usePostHog } from "~/composables/usePostHog"
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
const posthog = usePostHog()

const currentStep = ref<CheckoutStep>("account")
const authTab = ref<AuthTab>("login")
const isBooting = ref<boolean>(true)
const isSubmitting = ref<boolean>(false)
const errorMessage = ref<string | null>(null)
const isLoading = ref<boolean>(false)
const isShippingLoading = ref<boolean>(true)
const isPaymentInitializing = ref<boolean>(false)
const isCheckoutActive = ref<boolean>(true)

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

type LoginErrors = {
    email: string
    password: string
}

type RegisterErrors = {
    first_name: string
    last_name: string
    email: string
    password: string
}

type GuestErrors = {
    email: string
}

type AddressErrors = {
    first_name: string
    last_name: string
    address_1: string
    city: string
    province: string
    postal_code: string
    country_code: string
    phone: string
}

const loginErrors = reactive<LoginErrors>({
    email: "",
    password: ""
})

const registerErrors = reactive<RegisterErrors>({
    first_name: "",
    last_name: "",
    email: "",
    password: ""
})

const guestErrors = reactive<GuestErrors>({
    email: ""
})

const billingErrors = reactive<AddressErrors>({
    first_name: "",
    last_name: "",
    address_1: "",
    city: "",
    province: "",
    postal_code: "",
    country_code: "",
    phone: ""
})

const shippingErrors = reactive<AddressErrors>({
    first_name: "",
    last_name: "",
    address_1: "",
    city: "",
    province: "",
    postal_code: "",
    country_code: "",
    phone: ""
})

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
const addressFields = ["first_name", "last_name", "address_1", "city", "province", "postal_code", "country_code", "phone"] as const
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

const isOrderSummaryOpen = ref<boolean>(false)

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

function clearValidationErrors<T extends Record<string, string>>(errors: T): void {
    for (const key of Object.keys(errors) as Array<keyof T>) {
        errors[key] = "" as T[keyof T]
    }
}

function runValidationRules(value: unknown, rules: Array<(_value: string) => boolean | string>): string {
    const normalizedValue = typeof value === "string" ? value : String(value ?? "")

    for (const rule of rules) {
        const result = rule(normalizedValue)

        if (result !== true) {
            return typeof result === "string" ? result : "Invalid value"
        }
    }

    return ""
}

function validateLoginForm(): boolean {
    clearValidationErrors(loginErrors)
    loginErrors.email = runValidationRules(loginEmail.value, emailRules)
    loginErrors.password = runValidationRules(loginPassword.value, passwordRules)

    return !loginErrors.email && !loginErrors.password
}

function validateRegisterForm(): boolean {
    clearValidationErrors(registerErrors)
    registerErrors.first_name = runValidationRules(regFirstName.value, [(_value) => addressRules.required(regFirstName.value)])
    registerErrors.last_name = runValidationRules(regLastName.value, [(_value) => addressRules.required(regLastName.value)])
    registerErrors.email = runValidationRules(regEmail.value, emailRules)
    registerErrors.password = runValidationRules(regPassword.value, passwordRules)

    return !registerErrors.first_name && !registerErrors.last_name && !registerErrors.email && !registerErrors.password
}

function validateGuestForm(): boolean {
    clearValidationErrors(guestErrors)
    guestErrors.email = runValidationRules(guestEmail.value, emailRules)

    return !guestErrors.email
}

function validateAddressFields(address: Address, errors: AddressErrors): boolean {
    clearValidationErrors(errors)

    for (const field of addressFields) {
        errors[field] = runValidationRules(address[field], [addressRules.required])
    }

    errors.phone = runValidationRules(address.phone, [addressRules.required, addressRules.phone])

    return !Object.values(errors).some(Boolean)
}

function validateAddressForm(): boolean {
    const billingValid = validateAddressFields(billingAddress, billingErrors)
    const shippingValid = useSeparateShipping.value ? validateAddressFields(shippingAddress, shippingErrors) : true

    if (!useSeparateShipping.value) {
        clearValidationErrors(shippingErrors)
    }

    return billingValid && shippingValid
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
        const data = await $fetch<ShippingOptionsPayload>("/api/orders/shipping-options", {
            method: "POST",
            credentials: "include",
            body: {
                cart_id: checkoutCart.value.id
            }
        })

        const options = Array.isArray(data) ? data : (data.shipping_options ?? [])

        shippingOptions.value = options
        selectedShippingOptionId.value ||= options[0]?.id ?? null
    } catch (error) {
        console.error("Failed to load shipping options:", error)
        errorMessage.value = "Could not load shipping options"
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

    await $fetch("/api/orders/shipping-methods", {
        method: "POST",
        credentials: "include",
        body: {
            cart_id: checkoutCart.value.id,
            option_id: selectedShippingOptionId.value
        }
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

    const payload = await $fetch<CreatePaymentIntentPayload>("/api/orders/create-payment-intent", {
        method: "POST",
        credentials: "include",
        body: {
            cartId: checkoutCart.value.id,
            shippingOptionId: selectedShippingOptionId.value
        }
    })

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
    if (!cart.value?.id) {
        return
    }

    await $fetch("/api/account/assign-customer", {
        method: "POST",
        credentials: "include",
        body: {
            cartId: cart.value.id
        }
    })
    await cartStore.loadCart()
}

async function handleCheckoutLogin(): Promise<void> {
    if (!validateLoginForm()) {
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
    if (!validateRegisterForm()) {
        return
    }

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
    if (!validateGuestForm()) {
        return
    }

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
    if (!validateAddressForm() || !checkoutCart.value?.id) {
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
        let result = await stripe.confirmPayment({ elements, redirect: "if_required" })

        if (result.error?.code === "payment_intent_unexpected_state") {
            await createOrUpdatePaymentIntent()

            if (elements && clientSecretValue.value) {
                result = await stripe.confirmPayment({ elements, redirect: "if_required" })
            }
        }

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

    const payload = await $fetch<CompleteCartPayload>("/api/cart/complete-cart", {
        method: "POST",
        credentials: "include",
        body: {
            cartId: checkoutCart.value?.id,
            shippingOptionId: selectedShippingOptionId.value
        }
    })

    const orderId = payload.order?.id

    if (orderId) {
        await createNewCart(cartStore)
        await router.push({ name: "order-completed", query: { orderId } })
    }
}

const isCheckoutReady = ref(false)

onMounted(async () => {
    try {
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
        isCheckoutReady.value = true

        posthog?.capture("checkout_started", {
            cart_id: checkoutCart.value?.id,
            item_count: checkoutCart.value?.items?.length,
            cart_total: checkoutCart.value?.total
        })

        if (currentStep.value === "payment" && addressCompleted.value) {
            await loadShippingOptions()
        }
    } catch (error) {
        console.error("Checkout boot failed:", error)
        errorMessage.value = "Could not prepare checkout"
        isBooting.value = false
    }
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
        if (!isCheckoutReady.value || !isCheckoutActive.value) {
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
    }
)

watch(selectedShippingOptionId, scheduleRefresh)
watch(cartFingerprint, scheduleRefresh)
</script>

<template>
    <section class="checkout-page">
        <div class="checkout-page__hero">
            <div class="checkout-page__container">
                <div v-if="isBooting" class="checkout-page__loading-state">
                    <div class="checkout-page__spinner" aria-hidden="true"></div>
                    <p class="checkout-page__loading-text">Preparing your checkout...</p>
                </div>
                <template v-else>
                    <div class="checkout-page__content-grid">
                        <div class="checkout-page__primary-column">
                            <div class="checkout-page__hero-grid">
                                <div class="checkout-page__copy">
                                    <span class="checkout-page__eyebrow">Single-page checkout</span>
                                    <h1 class="checkout-page__title">Move from cart to confirmation in one calm, guided flow.</h1>
                                    <p class="checkout-page__description">
                                        Sign in or continue as a guest, add your delivery details, pick shipping, and finish payment without hopping
                                        across separate pages.
                                    </p>
                                </div>
                            </div>

                            <section class="checkout-page__hero-summary" aria-label="Order summary">
                                <button
                                    type="button"
                                    class="checkout-page__hero-summary-toggle"
                                    :aria-expanded="isOrderSummaryOpen ? 'true' : 'false'"
                                    aria-controls="checkout-mobile-summary-panel"
                                    @click="isOrderSummaryOpen = !isOrderSummaryOpen"
                                >
                                    <span class="checkout-page__hero-summary-toggle-copy">
                                        <span class="checkout-page__hero-summary-toggle-label">Order summary</span>
                                        <span class="checkout-page__hero-summary-toggle-meta">
                                            {{ itemCount }} item{{ itemCount === 1 ? '' : 's' }}
                                        </span>
                                    </span>
                                    <span class="checkout-page__hero-summary-toggle-right">
                                        <strong class="checkout-page__hero-summary-total">
                                            {{ formatPrice(Number(checkoutCart?.total || 0), currencyCode) }}
                                        </strong>
                                        <span
                                            class="checkout-page__hero-summary-chevron"
                                            :class="{ 'checkout-page__hero-summary-chevron--open': isOrderSummaryOpen }"
                                            aria-hidden="true"
                                        ></span>
                                    </span>
                                </button>

                                <div
                                    v-show="isOrderSummaryOpen"
                                    id="checkout-mobile-summary-panel"
                                    class="checkout-page__hero-summary-panel"
                                >
                                    <div class="checkout-page__summary-items checkout-page__summary-items--hero">
                                        <article v-for="item in lineItems" :key="item.id" class="checkout-page__summary-item">
                                            <img
                                                :src="item.thumbnail || '/images/placeholder.png'"
                                                :alt="item.product_title || 'Product image'"
                                                width="72"
                                                height="88"
                                                class="checkout-page__summary-image"
                                                loading="lazy"
                                            />
                                            <div class="checkout-page__summary-item-body">
                                                <strong class="checkout-page__summary-item-title">{{ item.product_title }}</strong>
                                                <span class="checkout-page__summary-item-meta">{{ item.variant_title || "Standard option" }}</span>
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
                                    <div class="checkout-page__totals checkout-page__totals--hero">
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
                            </section>

                            <div class="checkout-page__main">
                                <div v-if="errorMessage" class="checkout-page__alert" role="alert">{{ errorMessage }}</div>

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
                                            <p class="checkout-page__status-text">{{ customer?.email || checkoutEmail }}</p>
                                        </div>
                                        <button type="button" class="ui-btn-secondary px-6" @click="currentStep = 'address'">Continue</button>
                                    </div>

                                    <div v-else class="checkout-page__section-card">
                                        <div class="checkout-page__tabs" role="tablist" aria-label="Checkout account options">
                                            <button
                                                type="button"
                                                role="tab"
                                                class="checkout-page__tab"
                                                :class="{ 'checkout-page__tab--active': authTab === 'login' }"
                                                :aria-selected="authTab === 'login'"
                                                @click="authTab = 'login'"
                                            >
                                                Login
                                            </button>
                                            <button
                                                type="button"
                                                role="tab"
                                                class="checkout-page__tab"
                                                :class="{ 'checkout-page__tab--active': authTab === 'register' }"
                                                :aria-selected="authTab === 'register'"
                                                @click="authTab = 'register'"
                                            >
                                                Create account
                                            </button>
                                            <button
                                                type="button"
                                                role="tab"
                                                class="checkout-page__tab"
                                                :class="{ 'checkout-page__tab--active': authTab === 'guest' }"
                                                :aria-selected="authTab === 'guest'"
                                                @click="authTab = 'guest'"
                                            >
                                                Guest
                                            </button>
                                        </div>

                                        <div class="checkout-page__window">
                                            <div v-if="authTab === 'login'">
                                                <div class="checkout-page__social-buttons">
                                                    <button
                                                        type="button"
                                                        class="ui-btn-secondary checkout-page__social-btn w-full px-5"
                                                        @click="handleCheckoutSocialLogin('google')"
                                                    >
                                                        <img
                                                            src="/images/google_login_icon.svg"
                                                            alt=""
                                                            width="24"
                                                            height="24"
                                                            class="checkout-page__social-icon"
                                                        />
                                                        Login with Google
                                                    </button>
                                                    <button
                                                        type="button"
                                                        class="ui-btn-secondary checkout-page__social-btn w-full px-5"
                                                        @click="handleCheckoutSocialLogin('facebook')"
                                                    >
                                                        <img
                                                            src="/images/facebook_login_icon.svg"
                                                            alt=""
                                                            width="24"
                                                            height="24"
                                                            class="checkout-page__social-icon"
                                                        />
                                                        Login with Facebook
                                                    </button>
                                                </div>

                                                <div class="checkout-page__divider"><span>Or continue with email</span></div>

                                                <form class="checkout-page__form" novalidate @submit.prevent="handleCheckoutLogin">
                                                    <div class="checkout-page__field-group">
                                                        <label class="checkout-page__field-label" for="checkout-login-email">Email</label>
                                                        <input
                                                            id="checkout-login-email"
                                                            v-model="loginEmail"
                                                            type="email"
                                                            autocomplete="email"
                                                            class="ui-input checkout-page__field"
                                                            :class="{ 'checkout-page__field--error': !!loginErrors.email }"
                                                        />
                                                        <p v-if="loginErrors.email" class="checkout-page__field-error">
                                                            {{ loginErrors.email }}
                                                        </p>
                                                    </div>

                                                    <div class="checkout-page__field-group">
                                                        <label class="checkout-page__field-label" for="checkout-login-password">Password</label>
                                                        <input
                                                            id="checkout-login-password"
                                                            v-model="loginPassword"
                                                            type="password"
                                                            autocomplete="current-password"
                                                            class="ui-input checkout-page__field"
                                                            :class="{ 'checkout-page__field--error': !!loginErrors.password }"
                                                        />
                                                        <p v-if="loginErrors.password" class="checkout-page__field-error">
                                                            {{ loginErrors.password }}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="submit"
                                                        class="ui-btn-primary w-full justify-center px-6"
                                                        :disabled="isSubmitting || auth.loading.value"
                                                    >
                                                        {{ isSubmitting || auth.loading.value ? "Logging in..." : "Log in and continue" }}
                                                    </button>
                                                </form>
                                            </div>

                                            <form
                                                v-else-if="authTab === 'register'"
                                                class="checkout-page__form"
                                                novalidate
                                                @submit.prevent="submitRegister"
                                            >
                                                <div class="checkout-page__name-grid">
                                                    <div class="checkout-page__field-group">
                                                        <label class="checkout-page__field-label" for="checkout-register-first-name"
                                                        >First name</label
                                                        >
                                                        <input
                                                            id="checkout-register-first-name"
                                                            v-model="regFirstName"
                                                            type="text"
                                                            autocomplete="given-name"
                                                            class="ui-input checkout-page__field"
                                                            :class="{ 'checkout-page__field--error': !!registerErrors.first_name }"
                                                        />
                                                        <p v-if="registerErrors.first_name" class="checkout-page__field-error">
                                                            {{ registerErrors.first_name }}
                                                        </p>
                                                    </div>

                                                    <div class="checkout-page__field-group">
                                                        <label class="checkout-page__field-label" for="checkout-register-last-name"
                                                        >Last name</label
                                                        >
                                                        <input
                                                            id="checkout-register-last-name"
                                                            v-model="regLastName"
                                                            type="text"
                                                            autocomplete="family-name"
                                                            class="ui-input checkout-page__field"
                                                            :class="{ 'checkout-page__field--error': !!registerErrors.last_name }"
                                                        />
                                                        <p v-if="registerErrors.last_name" class="checkout-page__field-error">
                                                            {{ registerErrors.last_name }}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div class="checkout-page__field-group">
                                                    <label class="checkout-page__field-label" for="checkout-register-email">Email</label>
                                                    <input
                                                        id="checkout-register-email"
                                                        v-model="regEmail"
                                                        type="email"
                                                        autocomplete="email"
                                                        class="ui-input checkout-page__field"
                                                        :class="{ 'checkout-page__field--error': !!registerErrors.email }"
                                                    />
                                                    <p v-if="registerErrors.email" class="checkout-page__field-error">
                                                        {{ registerErrors.email }}
                                                    </p>
                                                </div>

                                                <div class="checkout-page__field-group">
                                                    <label class="checkout-page__field-label" for="checkout-register-password">Password</label>
                                                    <input
                                                        id="checkout-register-password"
                                                        v-model="regPassword"
                                                        type="password"
                                                        autocomplete="new-password"
                                                        class="ui-input checkout-page__field"
                                                        :class="{ 'checkout-page__field--error': !!registerErrors.password }"
                                                    />
                                                    <p v-if="registerErrors.password" class="checkout-page__field-error">
                                                        {{ registerErrors.password }}
                                                    </p>
                                                </div>

                                                <button
                                                    type="submit"
                                                    class="ui-btn-primary w-full justify-center px-6"
                                                    :disabled="isSubmitting || auth.loading.value"
                                                >
                                                    {{
                                                        isSubmitting || auth.loading.value
                                                            ? "Creating account..."
                                                            : "Create account and continue"
                                                    }}
                                                </button>
                                            </form>

                                            <form v-else class="checkout-page__form" novalidate @submit.prevent="submitGuest">
                                                <div class="checkout-page__field-group">
                                                    <label class="checkout-page__field-label" for="checkout-guest-email">Email</label>
                                                    <input
                                                        id="checkout-guest-email"
                                                        v-model="guestEmail"
                                                        type="email"
                                                        autocomplete="email"
                                                        class="ui-input checkout-page__field"
                                                        :class="{ 'checkout-page__field--error': !!guestErrors.email }"
                                                    />
                                                    <p v-if="guestErrors.email" class="checkout-page__field-error">{{ guestErrors.email }}</p>
                                                </div>

                                                <button
                                                    type="submit"
                                                    class="ui-btn-primary w-full justify-center px-6"
                                                    :disabled="isSubmitting"
                                                >
                                                    {{ isSubmitting ? "Continuing..." : "Continue as guest" }}
                                                </button>
                                            </form>
                                        </div>
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
                                        <form class="checkout-page__form" novalidate @submit.prevent="submitAddresses">
                                            <div class="checkout-page__subsection">
                                                <h3 class="checkout-page__subsection-title">Billing address</h3>
                                                <div class="checkout-page__name-grid">
                                                    <div class="checkout-page__field-group">
                                                        <label class="checkout-page__field-label" for="checkout-billing-first-name"
                                                        >First name</label
                                                        >
                                                        <input
                                                            id="checkout-billing-first-name"
                                                            v-model="billingAddress.first_name"
                                                            type="text"
                                                            autocomplete="billing given-name"
                                                            class="ui-input checkout-page__field"
                                                            :class="{ 'checkout-page__field--error': !!billingErrors.first_name }"
                                                        />
                                                        <p v-if="billingErrors.first_name" class="checkout-page__field-error">
                                                            {{ billingErrors.first_name }}
                                                        </p>
                                                    </div>

                                                    <div class="checkout-page__field-group">
                                                        <label class="checkout-page__field-label" for="checkout-billing-last-name"
                                                        >Last name</label
                                                        >
                                                        <input
                                                            id="checkout-billing-last-name"
                                                            v-model="billingAddress.last_name"
                                                            type="text"
                                                            autocomplete="billing family-name"
                                                            class="ui-input checkout-page__field"
                                                            :class="{ 'checkout-page__field--error': !!billingErrors.last_name }"
                                                        />
                                                        <p v-if="billingErrors.last_name" class="checkout-page__field-error">
                                                            {{ billingErrors.last_name }}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div class="checkout-page__field-group">
                                                    <label class="checkout-page__field-label" for="checkout-billing-address-1"
                                                    >Address line 1</label
                                                    >
                                                    <input
                                                        id="checkout-billing-address-1"
                                                        v-model="billingAddress.address_1"
                                                        type="text"
                                                        autocomplete="billing address-line1"
                                                        class="ui-input checkout-page__field"
                                                        :class="{ 'checkout-page__field--error': !!billingErrors.address_1 }"
                                                    />
                                                    <p v-if="billingErrors.address_1" class="checkout-page__field-error">
                                                        {{ billingErrors.address_1 }}
                                                    </p>
                                                </div>

                                                <div class="checkout-page__field-group">
                                                    <label class="checkout-page__field-label" for="checkout-billing-address-2"
                                                    >Address line 2</label
                                                    >
                                                    <input
                                                        id="checkout-billing-address-2"
                                                        v-model="billingAddress.address_2"
                                                        type="text"
                                                        autocomplete="billing address-line2"
                                                        class="ui-input checkout-page__field"
                                                    />
                                                </div>

                                                <div class="checkout-page__triple-grid">
                                                    <div class="checkout-page__field-group">
                                                        <label class="checkout-page__field-label" for="checkout-billing-postal-code"
                                                        >Postal code</label
                                                        >
                                                        <input
                                                            id="checkout-billing-postal-code"
                                                            v-model="billingAddress.postal_code"
                                                            type="text"
                                                            autocomplete="billing postal-code"
                                                            class="ui-input checkout-page__field"
                                                            :class="{ 'checkout-page__field--error': !!billingErrors.postal_code }"
                                                        />
                                                        <p v-if="billingErrors.postal_code" class="checkout-page__field-error">
                                                            {{ billingErrors.postal_code }}
                                                        </p>
                                                    </div>

                                                    <div class="checkout-page__field-group">
                                                        <label class="checkout-page__field-label" for="checkout-billing-city">City</label>
                                                        <input
                                                            id="checkout-billing-city"
                                                            v-model="billingAddress.city"
                                                            type="text"
                                                            autocomplete="billing address-level2"
                                                            class="ui-input checkout-page__field"
                                                            :class="{ 'checkout-page__field--error': !!billingErrors.city }"
                                                        />
                                                        <p v-if="billingErrors.city" class="checkout-page__field-error">
                                                            {{ billingErrors.city }}
                                                        </p>
                                                    </div>

                                                    <div class="checkout-page__field-group">
                                                        <label class="checkout-page__field-label" for="checkout-billing-province"
                                                        >Province / State</label
                                                        >
                                                        <input
                                                            id="checkout-billing-province"
                                                            v-model="billingAddress.province"
                                                            type="text"
                                                            autocomplete="billing address-level1"
                                                            class="ui-input checkout-page__field"
                                                            :class="{ 'checkout-page__field--error': !!billingErrors.province }"
                                                        />
                                                        <p v-if="billingErrors.province" class="checkout-page__field-error">
                                                            {{ billingErrors.province }}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div class="checkout-page__double-grid">
                                                    <div class="checkout-page__field-group">
                                                        <label class="checkout-page__field-label" for="checkout-billing-country">Country</label>
                                                        <select
                                                            id="checkout-billing-country"
                                                            v-model="billingAddress.country_code"
                                                            class="checkout-page__select"
                                                            :class="{ 'checkout-page__field--error': !!billingErrors.country_code }"
                                                        >
                                                            <option value="">Select a country</option>
                                                            <option
                                                                v-for="country in regionCountries"
                                                                :key="country.iso_2"
                                                                :value="country.iso_2"
                                                            >
                                                                {{ country.display_name }}
                                                            </option>
                                                        </select>
                                                        <p v-if="billingErrors.country_code" class="checkout-page__field-error">
                                                            {{ billingErrors.country_code }}
                                                        </p>
                                                    </div>

                                                    <div class="checkout-page__field-group">
                                                        <label class="checkout-page__field-label" for="checkout-billing-phone">Phone</label>
                                                        <input
                                                            id="checkout-billing-phone"
                                                            v-model="billingAddress.phone"
                                                            type="tel"
                                                            autocomplete="billing tel"
                                                            class="ui-input checkout-page__field"
                                                            :class="{ 'checkout-page__field--error': !!billingErrors.phone }"
                                                        />
                                                        <p v-if="billingErrors.phone" class="checkout-page__field-error">
                                                            {{ billingErrors.phone }}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <label class="checkout-page__checkbox">
                                                <input v-model="useSeparateShipping" type="checkbox" class="checkout-page__checkbox-input" />
                                                <span>Use a separate shipping address</span>
                                            </label>

                                            <div v-if="useSeparateShipping" class="checkout-page__subsection">
                                                <h3 class="checkout-page__subsection-title">Shipping address</h3>
                                                <div class="checkout-page__name-grid">
                                                    <div class="checkout-page__field-group">
                                                        <label class="checkout-page__field-label" for="checkout-shipping-first-name"
                                                        >First name</label
                                                        >
                                                        <input
                                                            id="checkout-shipping-first-name"
                                                            v-model="shippingAddress.first_name"
                                                            type="text"
                                                            autocomplete="shipping given-name"
                                                            class="ui-input checkout-page__field"
                                                            :class="{ 'checkout-page__field--error': !!shippingErrors.first_name }"
                                                        />
                                                        <p v-if="shippingErrors.first_name" class="checkout-page__field-error">
                                                            {{ shippingErrors.first_name }}
                                                        </p>
                                                    </div>

                                                    <div class="checkout-page__field-group">
                                                        <label class="checkout-page__field-label" for="checkout-shipping-last-name"
                                                        >Last name</label
                                                        >
                                                        <input
                                                            id="checkout-shipping-last-name"
                                                            v-model="shippingAddress.last_name"
                                                            type="text"
                                                            autocomplete="shipping family-name"
                                                            class="ui-input checkout-page__field"
                                                            :class="{ 'checkout-page__field--error': !!shippingErrors.last_name }"
                                                        />
                                                        <p v-if="shippingErrors.last_name" class="checkout-page__field-error">
                                                            {{ shippingErrors.last_name }}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div class="checkout-page__field-group">
                                                    <label class="checkout-page__field-label" for="checkout-shipping-address-1"
                                                    >Address line 1</label
                                                    >
                                                    <input
                                                        id="checkout-shipping-address-1"
                                                        v-model="shippingAddress.address_1"
                                                        type="text"
                                                        autocomplete="shipping address-line1"
                                                        class="ui-input checkout-page__field"
                                                        :class="{ 'checkout-page__field--error': !!shippingErrors.address_1 }"
                                                    />
                                                    <p v-if="shippingErrors.address_1" class="checkout-page__field-error">
                                                        {{ shippingErrors.address_1 }}
                                                    </p>
                                                </div>

                                                <div class="checkout-page__field-group">
                                                    <label class="checkout-page__field-label" for="checkout-shipping-address-2"
                                                    >Address line 2</label
                                                    >
                                                    <input
                                                        id="checkout-shipping-address-2"
                                                        v-model="shippingAddress.address_2"
                                                        type="text"
                                                        autocomplete="shipping address-line2"
                                                        class="ui-input checkout-page__field"
                                                    />
                                                </div>

                                                <div class="checkout-page__triple-grid">
                                                    <div class="checkout-page__field-group">
                                                        <label class="checkout-page__field-label" for="checkout-shipping-postal-code"
                                                        >Postal code</label
                                                        >
                                                        <input
                                                            id="checkout-shipping-postal-code"
                                                            v-model="shippingAddress.postal_code"
                                                            type="text"
                                                            autocomplete="shipping postal-code"
                                                            class="ui-input checkout-page__field"
                                                            :class="{ 'checkout-page__field--error': !!shippingErrors.postal_code }"
                                                        />
                                                        <p v-if="shippingErrors.postal_code" class="checkout-page__field-error">
                                                            {{ shippingErrors.postal_code }}
                                                        </p>
                                                    </div>

                                                    <div class="checkout-page__field-group">
                                                        <label class="checkout-page__field-label" for="checkout-shipping-city">City</label>
                                                        <input
                                                            id="checkout-shipping-city"
                                                            v-model="shippingAddress.city"
                                                            type="text"
                                                            autocomplete="shipping address-level2"
                                                            class="ui-input checkout-page__field"
                                                            :class="{ 'checkout-page__field--error': !!shippingErrors.city }"
                                                        />
                                                        <p v-if="shippingErrors.city" class="checkout-page__field-error">
                                                            {{ shippingErrors.city }}
                                                        </p>
                                                    </div>

                                                    <div class="checkout-page__field-group">
                                                        <label class="checkout-page__field-label" for="checkout-shipping-province"
                                                        >Province / State</label
                                                        >
                                                        <input
                                                            id="checkout-shipping-province"
                                                            v-model="shippingAddress.province"
                                                            type="text"
                                                            autocomplete="shipping address-level1"
                                                            class="ui-input checkout-page__field"
                                                            :class="{ 'checkout-page__field--error': !!shippingErrors.province }"
                                                        />
                                                        <p v-if="shippingErrors.province" class="checkout-page__field-error">
                                                            {{ shippingErrors.province }}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div class="checkout-page__double-grid">
                                                    <div class="checkout-page__field-group">
                                                        <label class="checkout-page__field-label" for="checkout-shipping-country"
                                                        >Country</label
                                                        >
                                                        <select
                                                            id="checkout-shipping-country"
                                                            v-model="shippingAddress.country_code"
                                                            class="checkout-page__select"
                                                            :class="{ 'checkout-page__field--error': !!shippingErrors.country_code }"
                                                        >
                                                            <option value="">Select a country</option>
                                                            <option
                                                                v-for="country in regionCountries"
                                                                :key="`shipping-${country.iso_2}`"
                                                                :value="country.iso_2"
                                                            >
                                                                {{ country.display_name }}
                                                            </option>
                                                        </select>
                                                        <p v-if="shippingErrors.country_code" class="checkout-page__field-error">
                                                            {{ shippingErrors.country_code }}
                                                        </p>
                                                    </div>

                                                    <div class="checkout-page__field-group">
                                                        <label class="checkout-page__field-label" for="checkout-shipping-phone">Phone</label>
                                                        <input
                                                            id="checkout-shipping-phone"
                                                            v-model="shippingAddress.phone"
                                                            type="tel"
                                                            autocomplete="shipping tel"
                                                            class="ui-input checkout-page__field"
                                                            :class="{ 'checkout-page__field--error': !!shippingErrors.phone }"
                                                        />
                                                        <p v-if="shippingErrors.phone" class="checkout-page__field-error">
                                                            {{ shippingErrors.phone }}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="checkout-page__button-row">
                                                <button type="button" class="ui-btn-secondary px-6" @click="currentStep = 'account'">
                                                    Back
                                                </button>
                                                <button type="submit" class="ui-btn-primary px-6" :disabled="isSubmitting">
                                                    {{ isSubmitting ? "Saving..." : "Save and continue" }}
                                                </button>
                                            </div>
                                        </form>
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
                                                <div class="checkout-page__shipping-skeleton"></div>
                                                <div class="checkout-page__shipping-skeleton"></div>
                                            </template>
                                            <div
                                                v-else-if="shippingOptions.length"
                                                class="checkout-page__shipping-options"
                                                role="radiogroup"
                                                aria-label="Shipping method"
                                            >
                                                <label
                                                    v-for="option in shippingOptions"
                                                    :key="option.id"
                                                    class="checkout-page__shipping-option"
                                                    :class="{
                                                        'checkout-page__shipping-option--active': selectedShippingOptionId === option.id
                                                    }"
                                                >
                                                    <input
                                                        v-model="selectedShippingOptionId"
                                                        type="radio"
                                                        :value="option.id"
                                                        class="checkout-page__shipping-radio"
                                                    />
                                                    <span class="checkout-page__shipping-option-copy">{{
                                                        getShippingOptionLabel(option)
                                                    }}</span>
                                                </label>
                                            </div>
                                            <p v-else class="checkout-page__status-text">
                                                No shipping options are available for this address yet.
                                            </p>
                                        </div>

                                        <div class="checkout-page__payment-card">
                                            <div class="checkout-page__subsection-title">Payment details</div>
                                            <div id="link-authentication-element"></div>
                                            <div id="payment-element" class="checkout-page__payment-element"></div>
                                            <div class="checkout-page__button-row checkout-page__button-row--payment">
                                                <button type="button" class="ui-btn-secondary px-6" @click="currentStep = 'address'">
                                                    Back
                                                </button>
                                                <button
                                                    type="button"
                                                    class="ui-btn-primary px-6"
                                                    :disabled="!clientSecretValue || isShippingLoading || isPaymentInitializing || isLoading"
                                                    @click="handleSubmit"
                                                >
                                                    {{ isLoading || isPaymentInitializing ? "Processing..." : "Pay now" }}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>

                        <aside class="checkout-page__summary-column">
                            <div class="checkout-page__summary-card">
                                <span class="checkout-page__section-eyebrow">Order summary</span>
                                <h2 class="checkout-page__summary-title">Everything you are checking out with today.</h2>
                                <div class="checkout-page__summary-items">
                                    <article v-for="item in lineItems" :key="item.id" class="checkout-page__summary-item">
                                        <img
                                            :src="item.thumbnail || '/images/placeholder.png'"
                                            :alt="item.product_title || 'Product image'"
                                            width="72"
                                            height="88"
                                            class="checkout-page__summary-image"
                                            loading="lazy"
                                        />
                                        <div class="checkout-page__summary-item-body">
                                            <strong class="checkout-page__summary-item-title">{{ item.product_title }}</strong>
                                            <span class="checkout-page__summary-item-meta">{{ item.variant_title || "Standard option" }}</span>
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
            </div>
        </div>
    </section>
</template>

<style scoped lang="scss">
.checkout-page {
    overflow: visible;
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
    overflow: visible;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

        .checkout-page__hero-grid,
        .checkout-page__content-grid,
        .checkout-page__payment-grid,
        .checkout-page__primary-column,
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
        grid-template-columns: minmax(0, 1fr);
        align-items: start;
        margin-bottom: 2.5rem;
        }

.checkout-page__content-grid {
    overflow: visible;
    grid-template-columns: minmax(0, 1.12fr) minmax(20rem, 0.88fr);
    align-items: start;
}

.checkout-page__primary-column {
    overflow: visible;
    gap: 0;
}

.checkout-page__copy,
.checkout-page__progress-card,
.checkout-page__main,
.checkout-page__summary-card,
.checkout-page__hero-summary {
    animation: checkout-rise 0.8s ease both;
}

.checkout-page__summary-card,
.checkout-page__hero-summary {
    animation-delay: 0.12s;
}

        .checkout-page__eyebrow,
        .checkout-page__section-eyebrow {
        display: inline-flex;
        align-items: center;
        min-height: 2.25rem;
        padding: 0.45rem 0.9rem;
        border-radius: 999px;
        background: rgba(205, 164, 94, 0.14);
        color: #8c5d17;
        border: 1px solid rgba(205, 164, 94, 0.2);
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
        margin: 1rem 0 1.25rem;
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

.checkout-page__summary-card {
    backdrop-filter: none;
    background: rgba(255, 255, 255, 0.96);
}

        .checkout-page__section-card,
        .checkout-page__summary-card,
        .checkout-page__status-card,
        .checkout-page__disabled-card {
        padding: 1.8rem;
        }

        .checkout-page__step-label,
        .checkout-page__status-title,
        .checkout-page__subsection-title,
        .checkout-page__summary-item-title {
        color: #08173f;
        font-weight: 700;
        }

        .checkout-page__hero-summary {
        display: none;
        }

        .checkout-page__hero-summary-toggle {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        border: 1px solid rgba(205, 164, 94, 0.22);
        border-radius: 1.35rem;
        background: linear-gradient(180deg, rgba(255, 251, 245, 0.98), rgba(255, 255, 255, 0.96));
        padding: 1rem 1.05rem;
        text-align: left;
        }

        .checkout-page__hero-summary-toggle-copy,
        .checkout-page__hero-summary-toggle-right {
        display: grid;
        gap: 0.15rem;
        }

        .checkout-page__hero-summary-toggle-label {
        color: #08173f;
        font-size: 1rem;
        font-weight: 700;
        }

        .checkout-page__hero-summary-toggle-meta {
        color: #6a7590;
        font-size: 0.82rem;
        }

        .checkout-page__hero-summary-toggle-right {
        grid-auto-flow: column;
        align-items: center;
        gap: 0.75rem;
        }

        .checkout-page__hero-summary-total {
        color: #08173f;
        font-size: 1.05rem;
        }

        .checkout-page__hero-summary-chevron {
        width: 0.75rem;
        height: 0.75rem;
        border-right: 2px solid #8c5d17;
        border-bottom: 2px solid #8c5d17;
        transform: rotate(45deg);
        transition: transform 0.2s ease;
        }

        .checkout-page__hero-summary-chevron--open {
        transform: rotate(225deg);
        }

        .checkout-page__hero-summary-panel {
        margin-top: 0.8rem;
        border: 1px solid rgba(205, 164, 94, 0.18);
        border-radius: 1.35rem;
        background: rgba(255, 255, 255, 0.98);
        padding: 1rem;
        }

        .checkout-page__summary-items--hero {
        gap: 0.85rem;
        }

        .checkout-page__totals--hero {
        margin-top: 1rem;
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
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.25rem;
        }

        .checkout-page__tab {
        min-height: 2.9rem;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: #4b5874;
        font-size: 0.95rem;
        font-weight: 700;
        transition:
        background-color 0.2s ease,
        color 0.2s ease,
        box-shadow 0.2s ease;
        }

        .checkout-page__tab--active {
        background: #ffffff;
        color: #010c80;
        box-shadow: 0 12px 24px rgba(8, 27, 90, 0.08);
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
        box-shadow: none;
        }

        .checkout-page__social-icon {
        flex-shrink: 0;
        margin-right: 0.75rem;
        }

        .checkout-page__field-group {
        display: grid;
        gap: 0.45rem;
        }

        .checkout-page__field-label {
        color: #08173f;
        font-size: 0.92rem;
        font-weight: 700;
        }

        .checkout-page__field,
        .checkout-page__select {
        border-radius: 1rem;
        }

        .checkout-page__select {
        min-height: 2.75rem;
        width: 100%;
        appearance: none;
        border: 1px solid #cbd5e1;
        background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94)),
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 7.5 10 12.5 15 7.5' stroke='%23475569' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
        right 0.9rem center / 0.95rem 0.95rem no-repeat;
        padding: 0 2.75rem 0 1rem;
        color: #1e293b;
        font-size: 0.95rem;
        outline: none;
        transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;
        }

        .checkout-page__field--error {
        border-color: #fca5a5;
        box-shadow: 0 0 0 3px rgba(254, 226, 226, 0.9);
        }

        .checkout-page__field-error {
        margin: 0;
        color: #dc2626;
        font-size: 0.86rem;
        line-height: 1.45;
        }

        .checkout-page__checkbox {
        display: inline-flex;
        align-items: center;
        gap: 0.7rem;
        color: #08173f;
        font-weight: 600;
        }

        .checkout-page__checkbox-input,
        .checkout-page__shipping-radio {
        width: 1rem;
        height: 1rem;
        accent-color: #010c80;
        }

        .checkout-page__alert {
        border: 1px solid #fecaca;
        border-radius: 1.2rem;
        background: #fef2f2;
        padding: 0.95rem 1rem;
        color: #b91c1c;
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

        .checkout-page__shipping-options {
        display: grid;
        gap: 0.75rem;
        }

        .checkout-page__shipping-option {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.95rem 1rem;
        border: 1px solid rgba(8, 23, 63, 0.1);
        border-radius: 1rem;
        background: rgba(247, 250, 255, 0.72);
        transition:
        border-color 0.2s ease,
        background-color 0.2s ease,
        box-shadow 0.2s ease;
        }

        .checkout-page__shipping-option--active {
        border-color: rgba(1, 12, 128, 0.3);
        background: rgba(237, 242, 255, 0.92);
        box-shadow: 0 10px 24px rgba(8, 27, 90, 0.08);
        }

        .checkout-page__shipping-option-copy {
        color: #08173f;
        font-weight: 600;
        line-height: 1.5;
        }

        .checkout-page__shipping-skeleton {
        min-height: 4.2rem;
        border-radius: 1rem;
        background: linear-gradient(90deg, rgba(226, 232, 240, 0.9), rgba(241, 245, 249, 1), rgba(226, 232, 240, 0.9));
        background-size: 200% 100%;
        animation: checkout-shimmer 1.4s linear infinite;
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
    top: calc(var(--site-header-offset, 98px) + 1rem);
    align-self: start;
    height: fit-content;
}

.checkout-page__summary-card {
    position: relative;
}

        .checkout-page__summary-item {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
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

        .checkout-page__spinner {
        width: 2.5rem;
        height: 2.5rem;
        border: 3px solid rgba(1, 12, 128, 0.12);
        border-top-color: #010c80;
        border-radius: 999px;
        animation: checkout-spin 0.8s linear infinite;
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

        @keyframes checkout-shimmer {
        from {
        background-position: 200% 0;
        }

        to {
        background-position: -200% 0;
        }
        }

        @keyframes checkout-spin {
        from {
        transform: rotate(0deg);
        }

        to {
        transform: rotate(360deg);
        }
        }

        @media screen and (max-width: 1100px) {
        .checkout-page__hero {
        padding: 5rem 0 4.5rem;
        }

        .checkout-page__hero-grid,
        .checkout-page__content-grid,
        .checkout-page__primary-column,
        .checkout-page__payment-grid {
        grid-template-columns: 1fr;
        }

        .checkout-page__title {
        font-size: 3.5rem;
        max-width: 100%;
        }

        .checkout-page__hero-summary {
        display: block;
        margin-bottom: 1.5rem;
        }

        .checkout-page__summary-column {
        display: none;
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

        .checkout-page__container {
        padding: 0 1rem;
        }

        .checkout-page__title {
        font-size: 2.8rem;
        line-height: 1;
        }

        .checkout-page__hero-grid,
        .checkout-page__content-grid {
        gap: 1.5rem;
        }

        .checkout-page__tabs {
        grid-template-columns: 1fr;
        }

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
        .checkout-page__button-row {
        flex-direction: column;
        align-items: flex-start;
        }

        .checkout-page__section-title,
        .checkout-page__summary-title {
        font-size: 1.6rem;
        }

        .checkout-page__hero-summary-toggle {
        padding: 0.95rem 1rem;
        }

        .checkout-page__hero-summary-toggle-label {
        font-size: 0.95rem;
        }

        .checkout-page__hero-summary-total {
        font-size: 1rem;
        }
        }

        @media (prefers-reduced-motion: reduce) {
    .checkout-page__copy,
    .checkout-page__hero-summary,
    .checkout-page__main,
    .checkout-page__summary-card {
        animation: none;
    }

        .checkout-page__shipping-skeleton,
        .checkout-page__spinner,
        .checkout-page__hero-summary-chevron {
        animation: none;
        transition: none;
        }
        }
</style>
