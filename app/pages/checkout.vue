<script setup lang="ts">
import { loadStripe } from "@stripe/stripe-js/pure"

import type { Address, ShippingOption } from "@/types/interfaces"
import type { CartDTO, CartLineItemDTO, CustomerAddressDTO } from "@medusajs/types"
import type { Stripe, StripeElements, StripeLinkAuthenticationElement, StripePaymentElement } from "@stripe/stripe-js"

import { formatPrice } from "@/utils/formatPrice"
import CheckoutAccountStep from "~/components/Checkout/CheckoutAccountStep.vue"
import CheckoutAddressStep from "~/components/Checkout/CheckoutAddressStep.vue"
import CheckoutOrderSummary from "~/components/Checkout/CheckoutOrderSummary.vue"
import CheckoutPaymentStep from "~/components/Checkout/CheckoutPaymentStep.vue"
import { usePostHog } from "~/composables/usePostHog"
import { DEFAULT_CURENCY } from "~/utils/consts"

definePageMeta({ layout: "checkout" })
useHead({ title: "Checkout | Medusa Commerce" })

type CheckoutStep = "account" | "address" | "payment"
type AuthTab = "login" | "register" | "guest"
type EditableAddressField =
    | "first_name"
    | "last_name"
    | "address_1"
    | "address_2"
    | "city"
    | "province"
    | "postal_code"
    | "country_code"
    | "phone"
type CheckoutCartShippingMethod = {
    shipping_option_id?: string | null
}
type CheckoutCart = CartDTO & {
    email?: string | null
    shipping_methods?: CheckoutCartShippingMethod[] | null
}
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
type ErrorWithMessage = { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
type CheckoutAccountStepInstance = {
    executeLoginTurnstile: () => Promise<string>
    executeRegisterTurnstile: () => Promise<string>
}

const cartStore = useCartStore()
const customerStore = useCustomerStore()
const regionStore = useRegionStore()

const { cart } = storeToRefs(cartStore)
const { customer, isAuthenticated } = storeToRefs(customerStore)
const { regionCountries } = storeToRefs(regionStore)

const auth = useCustomerAuth()
const config = useRuntimeConfig()
const router = useRouter()
const posthog = usePostHog()

const currentStep = ref<CheckoutStep>("account")
const authTab = ref<AuthTab>("login")
const checkoutAccountStep = ref<CheckoutAccountStepInstance | null>(null)
const isBooting = ref<boolean>(true)
const isSubmitting = ref<boolean>(false)
const errorMessage = ref<string | null>(null)
const isLoading = ref<boolean>(false)
const isRedirectingToOrder = ref<boolean>(false)
const isShippingLoading = ref<boolean>(true)
const isPaymentInitializing = ref<boolean>(false)
const isCheckoutActive = ref<boolean>(true)
const isEditingIdentity = ref<boolean>(false)
const hasExplicitGuestIdentity = ref<boolean>(false)
const guestCheckoutEmailCookie = useCookie<string | null>("checkout_guest_email", {
    sameSite: "lax",
    path: "/"
})

const loginEmail = ref<string>("")
const loginPassword = ref<string>("")
const loginTurnstileToken = ref<string>("")
const loginTurnstileResetKey = ref<number>(0)

const regFirstName = ref<string>("")
const regLastName = ref<string>("")
const regEmail = ref<string>("")
const regPassword = ref<string>("")
const registerTurnstileToken = ref<string>("")
const registerTurnstileResetKey = ref<number>(0)

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
    verification: string
}

type RegisterErrors = {
    first_name: string
    last_name: string
    email: string
    password: string
    verification: string
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
    password: "",
    verification: ""
})

const registerErrors = reactive<RegisterErrors>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    verification: ""
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
let shippingOptionsRequest: Promise<void> | null = null
let shippingOptionsRequestCartId = ""
let shippingMethodRequest: Promise<void> | null = null
let shippingMethodRequestContext = ""
let paymentIntentRequest: Promise<void> | null = null
let paymentIntentRequestSignature = ""
let refreshCheckoutRequest: Promise<void> | null = null

const clientSecretValue = ref<string | null>(null)
const shippingOptions = ref<ShippingOption[]>([])
const selectedShippingOptionId = ref<string | null>(null)
const lastPaymentSignature = ref<string>("")
const lastAppliedShippingContext = ref<string>("")
const savedAddresses = ref<CustomerAddressDTO[]>([])
const isSavedAddressesLoading = ref<boolean>(false)
const savedAddressesError = ref<string | null>(null)
const selectedBillingSavedAddressId = ref<string>("")
const selectedShippingSavedAddressId = ref<string>("")

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
const turnstileSiteKey = computed<string>(() => String(config.public.TURNSTILE_SITE_KEY || ""))
const checkoutEmail = computed<string>(() => checkoutCart.value?.email ?? "")
const currencyCode = computed<string>(() => checkoutCart.value?.currency_code ?? DEFAULT_CURENCY)
const lineItems = computed(() => checkoutCart.value?.items ?? [])
const itemCount = computed<number>(() => lineItems.value.reduce((sum, item) => sum + Number(item.quantity), 0))
const hasAuthenticatedIdentity = computed<boolean>(() => isAuthenticated.value)
const hasPersistedGuestIdentity = computed<boolean>(() =>
    Boolean(checkoutEmail.value && guestCheckoutEmailCookie.value === checkoutEmail.value)
)
const isGuestIdentity = computed<boolean>(
    () =>
        !isAuthenticated.value &&
        (hasExplicitGuestIdentity.value || hasPersistedGuestIdentity.value || (!checkoutCart.value?.customer_id && !!checkoutEmail.value))
)
const identityCompleted = computed<boolean>(() => hasAuthenticatedIdentity.value || isGuestIdentity.value)
const shouldShowIdentityReady = computed<boolean>(() => identityCompleted.value && !(isGuestIdentity.value && isEditingIdentity.value))

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

function getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (typeof error === "object" && error !== null) {
        const typedError = error as ErrorWithMessage
        return typedError.data?.statusMessage ?? typedError.statusMessage ?? typedError.message ?? fallbackMessage
    }

    return fallbackMessage
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

    if (!turnstileSiteKey.value) {
        loginErrors.verification = "Security verification is currently unavailable. Please try again later."
    }

    return !loginErrors.email && !loginErrors.password && !loginErrors.verification
}

function validateRegisterForm(): boolean {
    clearValidationErrors(registerErrors)
    registerErrors.first_name = runValidationRules(regFirstName.value, [(_value) => addressRules.required(regFirstName.value)])
    registerErrors.last_name = runValidationRules(regLastName.value, [(_value) => addressRules.required(regLastName.value)])
    registerErrors.email = runValidationRules(regEmail.value, emailRules)
    registerErrors.password = runValidationRules(regPassword.value, passwordRules)

    if (!turnstileSiteKey.value) {
        registerErrors.verification = "Security verification is currently unavailable. Please try again later."
    }

    return (
        !registerErrors.first_name &&
        !registerErrors.last_name &&
        !registerErrors.email &&
        !registerErrors.password &&
        !registerErrors.verification
    )
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
    target.country_code = source?.country_code?.toLowerCase() ?? ""
    target.phone = source?.phone ?? ""
    target.company = source?.company ?? ""
}

function hasAddressDetails(address?: Partial<Address> | null): boolean {
    return Boolean(address?.address_1 || address?.city || address?.postal_code || address?.country_code)
}

function getAddressComparisonSignature(address?: Partial<Address> | null): string {
    return JSON.stringify({
        first_name: address?.first_name ?? "",
        last_name: address?.last_name ?? "",
        address_1: address?.address_1 ?? "",
        address_2: address?.address_2 ?? "",
        city: address?.city ?? "",
        province: address?.province ?? "",
        postal_code: address?.postal_code ?? "",
        country_code: address?.country_code?.toLowerCase() ?? "",
        phone: address?.phone ?? "",
        company: address?.company ?? ""
    })
}

function getMatchingSavedAddressId(address: Address): string {
    if (!hasAddressDetails(address)) {
        return ""
    }

    const signature = getAddressComparisonSignature(address)
    return savedAddresses.value.find((savedAddress) => getAddressComparisonSignature(savedAddress as Partial<Address>) === signature)?.id ?? ""
}

function syncSelectedSavedAddressIds(): void {
    selectedBillingSavedAddressId.value = getMatchingSavedAddressId(billingAddress)
    selectedShippingSavedAddressId.value = useSeparateShipping.value ? getMatchingSavedAddressId(shippingAddress) : ""
}

function applyDefaultSavedAddresses(): void {
    syncSelectedSavedAddressIds()

    const defaultBillingAddress = savedAddresses.value.find((address) => address.is_default_billing)
    const defaultShippingAddress = savedAddresses.value.find((address) => address.is_default_shipping)

    if (defaultBillingAddress?.id && !selectedBillingSavedAddressId.value && !hasAddressDetails(billingAddress)) {
        updateSelectedBillingSavedAddress(defaultBillingAddress.id)
    }

    if (!defaultShippingAddress?.id || selectedShippingSavedAddressId.value || hasAddressDetails(shippingAddress)) {
        return
    }

    if (defaultShippingAddress.id === selectedBillingSavedAddressId.value) {
        return
    }

    useSeparateShipping.value = true
    updateSelectedShippingSavedAddress(defaultShippingAddress.id)
}

async function loadSavedAddresses(): Promise<void> {
    if (!hasAuthenticatedIdentity.value) {
        savedAddresses.value = []
        selectedBillingSavedAddressId.value = ""
        selectedShippingSavedAddressId.value = ""
        return
    }

    isSavedAddressesLoading.value = true
    savedAddressesError.value = null

    try {
        const response = await $fetch<{ addresses: CustomerAddressDTO[]; count: number }>("/api/account/get-addresses", {
            credentials: "include",
            query: {
                limit: 12,
                offset: 0
            }
        })

        savedAddresses.value = response.addresses.filter((address) => Boolean(address.id && address.address_1))
        applyDefaultSavedAddresses()
    } catch (error) {
        console.error("Failed to load saved checkout addresses:", error)
        savedAddressesError.value = "Could not load saved addresses. You can still enter a new address."
    } finally {
        isSavedAddressesLoading.value = false
    }
}

function applySavedAddress(addressId: string, target: "billing" | "shipping"): void {
    const savedAddress = savedAddresses.value.find((address) => address.id === addressId)

    if (!savedAddress) {
        return
    }

    applyAddress(target === "billing" ? billingAddress : shippingAddress, savedAddress as Partial<Address>)
    clearValidationErrors(target === "billing" ? billingErrors : shippingErrors)
}

function updateSelectedBillingSavedAddress(addressId: string): void {
    selectedBillingSavedAddressId.value = addressId
    applySavedAddress(addressId, "billing")
}

function updateSelectedShippingSavedAddress(addressId: string): void {
    selectedShippingSavedAddressId.value = addressId
    applySavedAddress(addressId, "shipping")
}

function updateBillingAddressField(payload: { field: EditableAddressField; value: string }): void {
    selectedBillingSavedAddressId.value = ""
    billingAddress[payload.field] = payload.value
}

function updateShippingAddressField(payload: { field: EditableAddressField; value: string }): void {
    selectedShippingSavedAddressId.value = ""
    shippingAddress[payload.field] = payload.value
}

function syncAddressesFromCart(currentCart: CheckoutCart | null): void {
    applyAddress(billingAddress, currentCart?.billing_address as Partial<Address> | null)

    const currentShipping = currentCart?.shipping_address as Partial<Address> | null
    const currentBilling = currentCart?.billing_address as Partial<Address> | null

    if (currentShipping?.address_1) {
        applyAddress(shippingAddress, currentShipping)
        useSeparateShipping.value = getAddressComparisonSignature(currentShipping) !== getAddressComparisonSignature(currentBilling)
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

function getPersistedShippingOptionId(currentCart: CheckoutCart | null): string | null {
    return currentCart?.shipping_methods?.[0]?.shipping_option_id ?? null
}

function clearPaymentState(): void {
    clientSecretValue.value = null
    lastPaymentSignature.value = ""
    lastAppliedShippingContext.value = ""
    shippingOptionsRequest = null
    shippingOptionsRequestCartId = ""
    shippingMethodRequest = null
    shippingMethodRequestContext = ""
    paymentIntentRequest = null
    paymentIntentRequestSignature = ""
    refreshCheckoutRequest = null

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

    const cartId = checkoutCart.value.id

    if (shippingOptionsRequest && shippingOptionsRequestCartId === cartId) {
        await shippingOptionsRequest
        return
    }

    isShippingLoading.value = true

    shippingOptionsRequestCartId = cartId
    shippingOptionsRequest = (async () => {
        try {
            const data = await $fetch<ShippingOptionsPayload>("/api/orders/shipping-options", {
                method: "POST",
                credentials: "include",
                body: {
                    cart_id: cartId
                }
            })

            const options = Array.isArray(data) ? data : (data.shipping_options ?? [])

            if (checkoutCart.value?.id !== cartId) {
                return
            }

            shippingOptions.value = options

            const persistedShippingOptionId = getPersistedShippingOptionId(checkoutCart.value)
            const nextSelectedShippingOptionId = options.some((option) => option.id === selectedShippingOptionId.value)
                ? selectedShippingOptionId.value
                : persistedShippingOptionId

            selectedShippingOptionId.value = options.some((option) => option.id === nextSelectedShippingOptionId)
                ? nextSelectedShippingOptionId
                : null
        } catch (error) {
            console.error("Failed to load shipping options:", error)
            errorMessage.value = "Could not load shipping options"
        } finally {
            if (shippingOptionsRequestCartId === cartId) {
                shippingOptionsRequest = null
                shippingOptionsRequestCartId = ""
                isShippingLoading.value = false
            }
        }
    })()

    await shippingOptionsRequest
}

async function updateShippingOption(): Promise<void> {
    if (!isCheckoutActive.value || !checkoutCart.value?.id || !selectedShippingOptionId.value) {
        return
    }

    const context = `${checkoutCart.value.id}|${selectedShippingOptionId.value}`
    if (context === lastAppliedShippingContext.value) {
        return
    }

    if (shippingMethodRequest && shippingMethodRequestContext === context) {
        await shippingMethodRequest
        return
    }

    shippingMethodRequestContext = context
    shippingMethodRequest = (async () => {
        await $fetch("/api/orders/shipping-methods", {
            method: "POST",
            credentials: "include",
            body: {
                cart_id: checkoutCart.value?.id,
                option_id: selectedShippingOptionId.value
            }
        })

        lastAppliedShippingContext.value = context
        await cartStore.loadCart()
    })()

    try {
        await shippingMethodRequest
    } finally {
        if (shippingMethodRequestContext === context) {
            shippingMethodRequest = null
            shippingMethodRequestContext = ""
        }
    }
}

async function ensureElements(secret: string): Promise<void> {
    if (!isCheckoutActive.value || !stripe) {
        return
    }

    await nextTick()

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

    const signature = getPaymentSignature()
    if (paymentIntentRequest && paymentIntentRequestSignature === signature) {
        await paymentIntentRequest
        return
    }

    paymentIntentRequestSignature = signature
    paymentIntentRequest = (async () => {
        const payload = await $fetch<CreatePaymentIntentPayload>("/api/orders/create-payment-intent", {
            method: "POST",
            credentials: "include",
            body: {
                cartId: checkoutCart.value?.id,
                shippingOptionId: selectedShippingOptionId.value
            }
        })

        const secret = payload.clientSecret ?? payload.client_secret

        if (!secret) {
            return
        }

        clientSecretValue.value = secret
        await ensureElements(secret)
    })()

    try {
        await paymentIntentRequest
    } finally {
        if (paymentIntentRequestSignature === signature) {
            paymentIntentRequest = null
            paymentIntentRequestSignature = ""
        }
    }
}

async function refreshCheckout(): Promise<void> {
    if (!isCheckoutActive.value || currentStep.value !== "payment" || !addressCompleted.value) {
        return
    }

    if (refreshCheckoutRequest) {
        await refreshCheckoutRequest
        return
    }

    isPaymentInitializing.value = true

    refreshCheckoutRequest = (async () => {
        try {
            await updateShippingOption()
            const signature = getPaymentSignature()

            if (signature !== lastPaymentSignature.value) {
                await createOrUpdatePaymentIntent()
                lastPaymentSignature.value = signature
            }
        } finally {
            isPaymentInitializing.value = false
            refreshCheckoutRequest = null
        }
    })()

    await refreshCheckoutRequest
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
    isEditingIdentity.value = false
    currentStep.value = "address"
}

function returnToAccountOptions(): void {
    errorMessage.value = null
    currentStep.value = "account"
    authTab.value = "login"
    isEditingIdentity.value = true
    hasExplicitGuestIdentity.value = false
    guestCheckoutEmailCookie.value = null
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
        if (!loginTurnstileToken.value) {
            try {
                loginTurnstileToken.value = await checkoutAccountStep.value?.executeLoginTurnstile() || ""
            } catch (error) {
                loginErrors.verification =
                    error instanceof Error ? error.message : "Security verification failed. Please complete the challenge and try again."
                return
            }

            if (!loginTurnstileToken.value) {
                loginErrors.verification = "Security verification failed. Please complete the challenge and try again."
                return
            }
        }

        const loggedInCustomer = await auth.login(loginEmail.value, loginPassword.value, {
            loadCart: false,
            turnstileToken: loginTurnstileToken.value
        })
        if (!loggedInCustomer) {
            const message = auth.error.value ?? "Could not sign in. Check your email and password, then try again."

            loginTurnstileToken.value = ""
            loginTurnstileResetKey.value += 1

            if (isVerificationError(message)) {
                loginErrors.verification = message
                return
            }

            if (isCredentialError(message)) {
                loginErrors.email = "Email or password is incorrect. Please check your details and try again."
                loginErrors.password = "Email or password is incorrect. Please check your details and try again."
                return
            }

            errorMessage.value = message
            return
        }

        hasExplicitGuestIdentity.value = false
        guestCheckoutEmailCookie.value = null
        await attachCustomerToCheckoutCart()
        await loadSavedAddresses()
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
        if (!registerTurnstileToken.value) {
            try {
                registerTurnstileToken.value = await checkoutAccountStep.value?.executeRegisterTurnstile() || ""
            } catch (error) {
                registerErrors.verification =
                    error instanceof Error ? error.message : "Security verification failed. Please complete the challenge and try again."
                return
            }

            if (!registerTurnstileToken.value) {
                registerErrors.verification = "Security verification failed. Please complete the challenge and try again."
                return
            }
        }

        const registeredCustomer = await auth.register(
            {
                email: regEmail.value,
                password: regPassword.value,
                first_name: regFirstName.value,
                last_name: regLastName.value,
                turnstileToken: registerTurnstileToken.value
            },
            { loadCart: false }
        )

        if (!registeredCustomer) {
            errorMessage.value = auth.error.value ?? "Registration failed"
            registerTurnstileToken.value = ""
            registerTurnstileResetKey.value += 1
            return
        }

        hasExplicitGuestIdentity.value = false
        guestCheckoutEmailCookie.value = null
        await attachCustomerToCheckoutCart()
        await loadSavedAddresses()
        await goToAddressStep()
    } finally {
        isSubmitting.value = false
    }
}

function updateLoginTurnstileToken(value: string): void {
    loginTurnstileToken.value = value
    loginErrors.verification = ""
}

function updateRegisterTurnstileToken(value: string): void {
    registerTurnstileToken.value = value
    registerErrors.verification = ""
}

function handleTurnstileError(target: "login" | "register", message: string): void {
    if (target === "login") {
        loginTurnstileToken.value = ""
        loginErrors.verification = message
        return
    }

    registerTurnstileToken.value = ""
    registerErrors.verification = message
}

function isVerificationError(message: string): boolean {
    return /verification|turnstile/i.test(message)
}

function isCredentialError(message: string): boolean {
    return /email or password|invalid credentials|incorrect/i.test(message)
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
        hasExplicitGuestIdentity.value = true
        guestCheckoutEmailCookie.value = guestEmail.value
        isEditingIdentity.value = false
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
    errorMessage.value = null

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
    } catch (error: unknown) {
        console.error("Checkout submission failed:", error)
        errorMessage.value = getErrorMessage(error, "Could not complete checkout")
    } finally {
        isLoading.value = false
    }
}

async function completeCart(): Promise<void> {
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
        isRedirectingToOrder.value = true
        guestCheckoutEmailCookie.value = null
        hasExplicitGuestIdentity.value = false
        await router.push({ name: "order-completed", query: { orderId } })
        await createNewCart(cartStore)
    }
}

const isCheckoutReady = ref<boolean>(false)

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

        if (isAuthenticated.value || !checkoutEmail.value || guestCheckoutEmailCookie.value !== checkoutEmail.value) {
            guestCheckoutEmailCookie.value = null
        }

        hasExplicitGuestIdentity.value = guestCheckoutEmailCookie.value === checkoutEmail.value
        isEditingIdentity.value = false
        syncAddressesFromCart(checkoutCart.value)
        await loadSavedAddresses()
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
            await nextTick()
            await refreshCheckout()
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
watch(currentStep, async (step) => {
    if (step !== "payment" || !addressCompleted.value || !isCheckoutReady.value || !isCheckoutActive.value) {
        return
    }

    await nextTick()

    if (!shippingOptions.value.length) {
        await loadShippingOptions()
    }

    await refreshCheckout()
})
</script>

<template>
    <main class="bg-linear-to-b from-blue-50 via-white to-slate-50 pt-28 pb-14 sm:pt-32 sm:pb-18">
        <div class="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            <div v-if="isBooting" class="grid justify-items-center gap-4 px-4 py-20 text-center">
                <span class="border-brand-200 border-t-brand-700 inline-flex h-10 w-10 animate-spin rounded-full border-4"></span>
                <p class="text-sm leading-6 text-slate-600">Preparing your checkout...</p>
            </div>

            <template v-else>
                <section class="grid gap-5 xl:grid-cols-checkout xl:items-start xl:gap-7">
                    <div class="space-y-5 sm:space-y-6">
                        <div
                            class="rounded-panel border border-white/80 bg-linear-to-b from-white to-slate-50 p-5 sm:rounded-4xl sm:p-7"
                        >
                            <span
                                class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                            >
                                Single-page checkout
                            </span>
                            <h1
                                class="mt-4 max-w-xl text-4xl leading-none font-bold tracking-tighter text-slate-950 sm:text-5xl lg:text-7xl"
                            >
                                Move from cart to confirmation in one calm, guided flow.
                            </h1>
                        </div>

                        <CheckoutOrderSummary
                            collapsible
                            :is-open="isOrderSummaryOpen"
                            :item-count="itemCount"
                            :currency-code="currencyCode"
                            :subtotal="Number(checkoutCart?.subtotal || 0)"
                            :shipping-total="Number(checkoutCart?.shipping_total || 0)"
                            :tax-total="Number(checkoutCart?.tax_total || 0)"
                            :total="Number(checkoutCart?.total || 0)"
                            :line-items="lineItems"
                            :get-amount-with-tax="getAmountWithTax"
                            :get-amount-without-tax="getAmountWithoutTax"
                            @toggle="isOrderSummaryOpen = !isOrderSummaryOpen"
                        />

                        <div
                            v-if="errorMessage"
                            class="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-700"
                            role="alert"
                        >
                            {{ errorMessage }}
                        </div>

                        <div class="grid gap-5">
                            <CheckoutAccountStep
                                ref="checkoutAccountStep"
                                :current-step="currentStep"
                                :auth-tab="authTab"
                                :identity-completed="shouldShowIdentityReady"
                                :is-guest-identity="isGuestIdentity"
                                :checkout-identity="customer?.email || checkoutEmail"
                                :login-email="loginEmail"
                                :login-password="loginPassword"
                                :reg-first-name="regFirstName"
                                :reg-last-name="regLastName"
                                :reg-email="regEmail"
                                :reg-password="regPassword"
                                :guest-email="guestEmail"
                                :login-errors="loginErrors"
                                :register-errors="registerErrors"
                                :guest-errors="guestErrors"
                                :turnstile-site-key="turnstileSiteKey"
                                :login-turnstile-token="loginTurnstileToken"
                                :register-turnstile-token="registerTurnstileToken"
                                :login-turnstile-reset-key="loginTurnstileResetKey"
                                :register-turnstile-reset-key="registerTurnstileResetKey"
                                :is-submitting="isSubmitting"
                                :is-auth-loading="auth.loading.value"
                                @update:auth-tab="authTab = $event"
                                @update:login-email="loginEmail = $event"
                                @update:login-password="loginPassword = $event"
                                @update:reg-first-name="regFirstName = $event"
                                @update:reg-last-name="regLastName = $event"
                                @update:reg-email="regEmail = $event"
                                @update:reg-password="regPassword = $event"
                                @update:login-turnstile-token="updateLoginTurnstileToken"
                                @update:register-turnstile-token="updateRegisterTurnstileToken"
                                @update:guest-email="guestEmail = $event"
                                @turnstile-error="handleTurnstileError"
                                @submit-login="handleCheckoutLogin"
                                @submit-register="submitRegister"
                                @submit-guest="submitGuest"
                                @social-login="handleCheckoutSocialLogin"
                                @change-identity="returnToAccountOptions"
                            />

                            <CheckoutAddressStep
                                :current-step="currentStep"
                                :identity-completed="identityCompleted"
                                :address-completed="addressCompleted"
                                :use-separate-shipping="useSeparateShipping"
                                :billing-address="billingAddress"
                                :shipping-address="shippingAddress"
                                :billing-errors="billingErrors"
                                :shipping-errors="shippingErrors"
                                :countries="regionCountries"
                                :saved-addresses="savedAddresses"
                                :is-saved-addresses-loading="isSavedAddressesLoading"
                                :saved-addresses-error="savedAddressesError"
                                :selected-billing-saved-address-id="selectedBillingSavedAddressId"
                                :selected-shipping-saved-address-id="selectedShippingSavedAddressId"
                                :is-submitting="isSubmitting"
                                @update:use-separate-shipping="useSeparateShipping = $event"
                                @update:selected-billing-saved-address-id="updateSelectedBillingSavedAddress"
                                @update:selected-shipping-saved-address-id="updateSelectedShippingSavedAddress"
                                @update:billing-field="updateBillingAddressField"
                                @update:shipping-field="updateShippingAddressField"
                                @back="currentStep = 'account'"
                                @submit="submitAddresses"
                            />

                            <CheckoutPaymentStep
                                :current-step="currentStep"
                                :address-completed="addressCompleted"
                                :is-shipping-loading="isShippingLoading"
                                :shipping-options="shippingOptions"
                                :selected-shipping-option-id="selectedShippingOptionId"
                                :client-secret-value="clientSecretValue"
                                :is-payment-initializing="isPaymentInitializing"
                                :is-loading="isLoading"
                                :is-redirecting-to-order="isRedirectingToOrder"
                                :get-shipping-option-label="getShippingOptionLabel"
                                @update:selected-shipping-option-id="selectedShippingOptionId = $event"
                                @back="currentStep = 'address'"
                                @submit="handleSubmit"
                            />
                        </div>
                    </div>

                    <aside class="hidden xl:sticky xl:top-28 xl:block xl:self-start">
                        <CheckoutOrderSummary
                            :item-count="itemCount"
                            :currency-code="currencyCode"
                            :subtotal="Number(checkoutCart?.subtotal || 0)"
                            :shipping-total="Number(checkoutCart?.shipping_total || 0)"
                            :tax-total="Number(checkoutCart?.tax_total || 0)"
                            :total="Number(checkoutCart?.total || 0)"
                            :line-items="lineItems"
                            :get-amount-with-tax="getAmountWithTax"
                            :get-amount-without-tax="getAmountWithoutTax"
                        />
                    </aside>
                </section>
            </template>
        </div>
    </main>
</template>
