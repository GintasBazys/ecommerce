import { loadStripe } from "@stripe/stripe-js/pure"
import type { ComputedRef, Ref, ShallowRef } from "vue"
import type { ShippingOption } from "@/types/interfaces"
import type { CartDTO } from "@medusajs/types"
import type { Stripe, StripeElements, StripeLinkAuthenticationElement, StripePaymentElement } from "@stripe/stripe-js"
import type { CheckoutCart, CheckoutStep, CompleteCartPayload, CreatePaymentIntentPayload } from "~/types/checkout"
import { formatPrice } from "@/utils/formatPrice"
import { getCheckoutErrorMessage } from "~/utils/checkoutValidation"

type CartStore = ReturnType<typeof useCartStore>
type ShippingOptionsPayload = ShippingOption[] | { shipping_options?: ShippingOption[] }

export function useCheckoutPayment(options: {
    cartStore: CartStore
    cart: Ref<CartDTO | null | undefined>
    checkoutCart: ComputedRef<CheckoutCart | null>
    currentStep: ShallowRef<CheckoutStep>
    addressCompleted: ComputedRef<boolean>
    cartFingerprint: ComputedRef<string>
    currencyCode: ComputedRef<string>
    errorMessage: ShallowRef<string | null>
    guestCheckoutEmailCookie: Ref<string | null>
    hasExplicitGuestIdentity: ShallowRef<boolean>
}) {
    const config = useRuntimeConfig()
    const router = useRouter()
    const isLoading = shallowRef<boolean>(false)
    const isRedirectingToOrder = shallowRef<boolean>(false)
    const isShippingLoading = shallowRef<boolean>(true)
    const isPaymentInitializing = shallowRef<boolean>(false)
    const isCheckoutActive = shallowRef<boolean>(true)
    const isCheckoutReady = shallowRef<boolean>(false)
    const clientSecretValue = shallowRef<string | null>(null)
    const shippingOptions = shallowRef<ShippingOption[]>([])
    const selectedShippingOptionId = shallowRef<string | null>(null)
    const lastPaymentSignature = shallowRef<string>("")
    const lastAppliedShippingContext = shallowRef<string>("")

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

    function getShippingOptionLabel(option: ShippingOption): string {
        const amount = option.calculated_price
            ? option.calculated_price.calculated_amount
            : option.prices.length
              ? option.prices[0]!.amount
              : null

        return `${option.name} - ${amount != null ? formatPrice(amount, options.currencyCode.value) : "Free"}`
    }

    async function initializeStripe(): Promise<void> {
        stripe = await loadStripe(String(config.public.STRIPE_PUBLIC_KEY))

        if (!stripe) {
            options.errorMessage.value = "Payment system unavailable. Please refresh the page."
            throw new Error("Stripe failed to initialize: Stripe.js not loaded")
        }
    }

    function getPaymentSignature(): string {
        return `${options.cartFingerprint.value}|${selectedShippingOptionId.value ?? ""}`
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
        if (!isCheckoutActive.value || !options.checkoutCart.value?.id || !options.addressCompleted.value) {
            return
        }

        const cartId = options.checkoutCart.value.id

        if (shippingOptionsRequest && shippingOptionsRequestCartId === cartId) {
            await shippingOptionsRequest
            return
        }

        isShippingLoading.value = true
        shippingOptionsRequestCartId = cartId
        shippingOptionsRequest = fetchShippingOptions(cartId)
        await shippingOptionsRequest
    }

    async function fetchShippingOptions(cartId: string): Promise<void> {
        try {
            const data = await $fetch<ShippingOptionsPayload>("/api/orders/shipping-options", {
                method: "POST",
                credentials: "include",
                body: { cart_id: cartId }
            })

            const nextOptions = Array.isArray(data) ? data : (data.shipping_options ?? [])

            if (options.checkoutCart.value?.id !== cartId) {
                return
            }

            shippingOptions.value = nextOptions
            const persistedShippingOptionId = getPersistedShippingOptionId(options.checkoutCart.value)
            const nextSelectedShippingOptionId = nextOptions.some((option) => option.id === selectedShippingOptionId.value)
                ? selectedShippingOptionId.value
                : persistedShippingOptionId

            selectedShippingOptionId.value = nextOptions.some((option) => option.id === nextSelectedShippingOptionId)
                ? nextSelectedShippingOptionId
                : null
        } catch (error) {
            console.error("Failed to load shipping options:", error)
            options.errorMessage.value = "Could not load shipping options"
        } finally {
            if (shippingOptionsRequestCartId === cartId) {
                shippingOptionsRequest = null
                shippingOptionsRequestCartId = ""
                isShippingLoading.value = false
            }
        }
    }

    async function updateShippingOption(): Promise<void> {
        if (!isCheckoutActive.value || !options.checkoutCart.value?.id || !selectedShippingOptionId.value) {
            return
        }

        const context = `${options.checkoutCart.value.id}|${selectedShippingOptionId.value}`
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
                body: { cart_id: options.checkoutCart.value?.id, option_id: selectedShippingOptionId.value }
            })

            lastAppliedShippingContext.value = context
            await options.cartStore.loadCart()
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

        if (!document.getElementById("link-authentication-element") || !document.getElementById("payment-element")) {
            return
        }

        if (!elements) {
            mountElements(secret)
            return
        }

        if (clientSecretValue.value === secret) {
            await elements.fetchUpdates().catch(() => {})
            return
        }

        paymentElement?.destroy()
        linkAuthElement?.destroy()
        mountElements(secret)
    }

    function mountElements(secret: string): void {
        if (!stripe) {
            return
        }

        elements = stripe.elements({ clientSecret: secret })
        linkAuthElement = elements.create("linkAuthentication")
        paymentElement = elements.create("payment")
        linkAuthElement.mount("#link-authentication-element")
        paymentElement.mount("#payment-element")
    }

    async function createOrUpdatePaymentIntent(): Promise<void> {
        if (!isCheckoutActive.value || !options.checkoutCart.value?.id || !selectedShippingOptionId.value) {
            return
        }

        const signature = getPaymentSignature()
        if (paymentIntentRequest && paymentIntentRequestSignature === signature) {
            await paymentIntentRequest
            return
        }

        paymentIntentRequestSignature = signature
        paymentIntentRequest = fetchPaymentIntent()

        try {
            await paymentIntentRequest
        } finally {
            if (paymentIntentRequestSignature === signature) {
                paymentIntentRequest = null
                paymentIntentRequestSignature = ""
            }
        }
    }

    async function fetchPaymentIntent(): Promise<void> {
        isPaymentInitializing.value = true

        try {
            const payload = await $fetch<CreatePaymentIntentPayload>("/api/orders/create-payment-intent", {
                method: "POST",
                credentials: "include",
                body: { cartId: options.checkoutCart.value?.id, shippingOptionId: selectedShippingOptionId.value }
            })

            const secret = payload.clientSecret ?? payload.client_secret

            if (!secret) {
                options.errorMessage.value = "Payment initialization failed. Please try again."
                console.error("Payment intent response missing clientSecret:", payload)
                throw new Error("Payment intent response missing clientSecret")
            }

            clientSecretValue.value = secret
            await ensureElements(secret)
        } catch (error) {
            console.error("Failed to create payment intent:", error)
            options.errorMessage.value = getCheckoutErrorMessage(error, "Could not initialize payment")
            throw error
        } finally {
            isPaymentInitializing.value = false
        }
    }

    async function refreshCheckout(): Promise<void> {
        if (!isCheckoutActive.value || options.currentStep.value !== "payment" || !options.addressCompleted.value) {
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
        if (!isCheckoutActive.value || options.currentStep.value !== "payment" || !options.addressCompleted.value) {
            return
        }

        if (debounceTimer) {
            clearTimeout(debounceTimer)
        }

        debounceTimer = setTimeout(refreshCheckout, 350)
    }

    async function handleSubmit(): Promise<void> {
        if (!stripe || !elements || !clientSecretValue.value) {
            return
        }

        isLoading.value = true
        options.errorMessage.value = null

        try {
            let result = await stripe.confirmPayment({ elements, redirect: "if_required" })

            if (result.error?.code === "payment_intent_unexpected_state") {
                await createOrUpdatePaymentIntent()

                if (elements && clientSecretValue.value) {
                    result = await stripe.confirmPayment({ elements, redirect: "if_required" })
                }
            }

            if (result.error) {
                options.errorMessage.value = result.error.message ?? "Payment failed"
                return
            }

            await completeCart()
        } catch (error: unknown) {
            console.error("Checkout submission failed:", error)
            options.errorMessage.value = getCheckoutErrorMessage(error, "Could not complete checkout")
        } finally {
            isLoading.value = false
        }
    }

    async function completeCart(): Promise<void> {
        const payload = await $fetch<CompleteCartPayload>("/api/cart/complete-cart", {
            method: "POST",
            credentials: "include",
            body: { cartId: options.checkoutCart.value?.id, shippingOptionId: selectedShippingOptionId.value }
        })

        const orderId = payload.order?.id

        if (!orderId) {
            isRedirectingToOrder.value = false
            options.errorMessage.value = "Order was created but confirmation failed. Please check your orders."
            console.error("Cart completion did not return an order id:", payload)
            throw new Error(options.errorMessage.value)
        }

        isRedirectingToOrder.value = true
        options.guestCheckoutEmailCookie.value = null
        options.hasExplicitGuestIdentity.value = false
        await router.push({ name: "order-completed", query: { orderId } })
        await createNewCart(options.cartStore)
    }

    return {
        isLoading,
        isRedirectingToOrder,
        isShippingLoading,
        isPaymentInitializing,
        isCheckoutActive,
        isCheckoutReady,
        clientSecretValue,
        shippingOptions,
        selectedShippingOptionId,
        getShippingOptionLabel,
        initializeStripe,
        clearPaymentState,
        cleanup,
        loadShippingOptions,
        refreshCheckout,
        scheduleRefresh,
        handleSubmit
    }
}
