<script setup lang="ts">
import type { Address } from "@/types/interfaces"
import type { CartDTO, CartLineItemDTO } from "@medusajs/types"
import type { CheckoutAccountStepInstance, CheckoutCart, CheckoutStep, PricedCartLineItem } from "~/types/checkout"

import CheckoutAccountStep from "~/components/Checkout/CheckoutAccountStep.vue"
import CheckoutAddressStep from "~/components/Checkout/CheckoutAddressStep.vue"
import CheckoutOrderSummary from "~/components/Checkout/CheckoutOrderSummary.vue"
import CheckoutPaymentStep from "~/components/Checkout/CheckoutPaymentStep.vue"
import { usePostHog } from "~/composables/analytics/usePostHog"
import { useCustomerAuth } from "~/composables/auth/useCustomerAuth"
import { useCheckoutAddresses } from "~/composables/checkout/useCheckoutAddresses"
import { useCheckoutIdentity } from "~/composables/checkout/useCheckoutIdentity"
import { useCheckoutPayment } from "~/composables/checkout/useCheckoutPayment"
import { DEFAULT_CURENCY } from "~/utils/consts"

definePageMeta({ layout: "checkout" })
useHead({ title: "Checkout | Medusa Commerce" })

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

const currentStep = shallowRef<CheckoutStep>("account")
const checkoutAccountStep = shallowRef<CheckoutAccountStepInstance | null>(null)
const isBooting = shallowRef<boolean>(true)
const isSubmitting = shallowRef<boolean>(false)
const errorMessage = shallowRef<string | null>(null)
const isOrderSummaryOpen = shallowRef<boolean>(false)

const checkoutCart = computed<CheckoutCart | null>(() => cart.value ?? null)
const turnstileSiteKey = computed<string>(() => String(config.public.TURNSTILE_SITE_KEY || ""))
const checkoutEmail = computed<string>(() => checkoutCart.value?.email ?? "")
const currencyCode = computed<string>(() => checkoutCart.value?.currency_code ?? DEFAULT_CURENCY)
const lineItems = computed<CartLineItemDTO[]>(() => checkoutCart.value?.items ?? [])
const itemCount = computed<number>(() => lineItems.value.reduce((sum, item) => sum + Number(item.quantity), 0))
const hasAuthenticatedIdentity = computed<boolean>(() => isAuthenticated.value)
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
const cartFingerprint = computed<string>(() => {
    const currentCart = checkoutCart.value

    if (!currentCart?.id) {
        return ""
    }

    const items = Array.isArray(currentCart.items) ? currentCart.items.map((item) => `${item.id}:${item.quantity}`).join("|") : ""
    return `${currentCart.id}|${items}|${currentCart.total ?? ""}|${currentCart.updated_at ?? ""}`
})

const addresses = useCheckoutAddresses({ hasAuthenticatedIdentity })
const identity = useCheckoutIdentity({
    auth,
    cart,
    cartStore,
    checkoutAccountStep,
    checkoutEmail,
    isAuthenticated,
    loadSavedAddresses: addresses.loadSavedAddresses,
    goToAddressStep,
    errorMessage,
    isSubmitting
})
const payment = useCheckoutPayment({
    cartStore,
    cart,
    checkoutCart,
    currentStep,
    addressCompleted,
    cartFingerprint,
    currencyCode,
    errorMessage,
    guestCheckoutEmailCookie: identity.guestCheckoutEmailCookie,
    hasExplicitGuestIdentity: identity.hasExplicitGuestIdentity
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

function deriveInitialStep(): CheckoutStep {
    if (!identity.identityCompleted.value) {
        return "account"
    }

    if (!addressCompleted.value) {
        return "address"
    }

    return "payment"
}

async function goToAddressStep(): Promise<void> {
    errorMessage.value = null
    identity.isEditingIdentity.value = false
    currentStep.value = "address"
}

function returnToAccountOptions(): void {
    currentStep.value = "account"
    identity.returnToAccountOptions()
}

async function submitAddresses(): Promise<void> {
    if (!addresses.validateAddressForm() || !checkoutCart.value?.id) {
        return
    }

    const billingAddress = addresses.billingAddress
    const shippingAddress = addresses.shippingAddress
    const payload: { cartId: string; billing_address: Address; shipping_address: Address } = {
        cartId: checkoutCart.value.id,
        billing_address: { ...billingAddress, country_code: billingAddress.country_code.toLowerCase() },
        shipping_address: addresses.useSeparateShipping.value
            ? { ...shippingAddress, country_code: shippingAddress.country_code.toLowerCase() }
            : { ...billingAddress, country_code: billingAddress.country_code.toLowerCase() }
    }

    isSubmitting.value = true
    errorMessage.value = null

    try {
        const updatedCart = await $fetch<{ cart: CartDTO }>("/api/cart/update", { method: "POST", body: payload })
        cart.value = updatedCart.cart
        currentStep.value = "payment"
    } catch (error) {
        console.error("Failed to update cart addresses:", error)
        errorMessage.value = "Could not save address details"
    } finally {
        isSubmitting.value = false
    }
}

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

        identity.syncGuestIdentityCookie()
        addresses.syncAddressesFromCart(checkoutCart.value)
        await addresses.loadSavedAddresses()
        currentStep.value = deriveInitialStep()
        await payment.initializeStripe()

        isBooting.value = false
        payment.isCheckoutReady.value = true
        posthog?.capture("checkout_started", {
            cart_id: checkoutCart.value?.id,
            item_count: checkoutCart.value?.items?.length,
            cart_total: checkoutCart.value?.total
        })

        if (currentStep.value === "payment" && addressCompleted.value) {
            await payment.loadShippingOptions()
            await nextTick()
            await payment.refreshCheckout()
        }
    } catch (error) {
        console.error("Checkout boot failed:", error)
        errorMessage.value = "Could not prepare checkout"
        isBooting.value = false
    }
})

onBeforeRouteLeave(() => payment.cleanup())
onUnmounted(() => payment.cleanup())

watch(
    () => checkoutCart.value,
    (currentCart) => {
        addresses.syncAddressesFromCart(currentCart)

        if (isBooting.value) {
            currentStep.value = deriveInitialStep()
        }
    },
    { immediate: true }
)

watch(
    () => [checkoutCart.value?.id, addressCompleted.value] as const,
    async ([cartId, hasAddress]) => {
        if (!payment.isCheckoutReady.value || !payment.isCheckoutActive.value) {
            return
        }

        if (!cartId || !hasAddress) {
            payment.clearPaymentState()
            payment.shippingOptions.value = []
            payment.selectedShippingOptionId.value = null
            return
        }

        await payment.loadShippingOptions()

        if (currentStep.value === "payment") {
            payment.scheduleRefresh()
        }
    }
)

watch(payment.selectedShippingOptionId, payment.scheduleRefresh)
watch(cartFingerprint, payment.scheduleRefresh)
watch(currentStep, async (step) => {
    if (step !== "payment" || !addressCompleted.value || !payment.isCheckoutReady.value || !payment.isCheckoutActive.value) {
        return
    }

    await nextTick()

    if (!payment.shippingOptions.value.length) {
        await payment.loadShippingOptions()
    }

    await payment.refreshCheckout()
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
                <section class="xl:grid-cols-checkout grid gap-5 xl:items-start xl:gap-7">
                    <div class="space-y-5 sm:space-y-6">
                        <div class="rounded-panel border border-white/80 bg-linear-to-b from-white to-slate-50 p-5 sm:rounded-4xl sm:p-7">
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
                                :auth-tab="identity.authTab.value"
                                :identity-completed="identity.shouldShowIdentityReady.value"
                                :is-guest-identity="identity.isGuestIdentity.value"
                                :checkout-identity="customer?.email || checkoutEmail"
                                :login-email="identity.loginEmail.value"
                                :login-password="identity.loginPassword.value"
                                :reg-first-name="identity.regFirstName.value"
                                :reg-last-name="identity.regLastName.value"
                                :reg-email="identity.regEmail.value"
                                :reg-password="identity.regPassword.value"
                                :guest-email="identity.guestEmail.value"
                                :login-errors="identity.loginErrors"
                                :register-errors="identity.registerErrors"
                                :guest-errors="identity.guestErrors"
                                :turnstile-site-key="turnstileSiteKey"
                                :login-turnstile-token="identity.loginTurnstileToken.value"
                                :register-turnstile-token="identity.registerTurnstileToken.value"
                                :login-turnstile-reset-key="identity.loginTurnstileResetKey.value"
                                :register-turnstile-reset-key="identity.registerTurnstileResetKey.value"
                                :is-submitting="isSubmitting"
                                :is-auth-loading="auth.loading.value"
                                @update:auth-tab="identity.authTab.value = $event"
                                @update:login-email="identity.loginEmail.value = $event"
                                @update:login-password="identity.loginPassword.value = $event"
                                @update:reg-first-name="identity.regFirstName.value = $event"
                                @update:reg-last-name="identity.regLastName.value = $event"
                                @update:reg-email="identity.regEmail.value = $event"
                                @update:reg-password="identity.regPassword.value = $event"
                                @update:login-turnstile-token="identity.updateLoginTurnstileToken"
                                @update:register-turnstile-token="identity.updateRegisterTurnstileToken"
                                @update:guest-email="identity.guestEmail.value = $event"
                                @turnstile-error="identity.handleTurnstileError"
                                @submit-login="identity.handleCheckoutLogin(turnstileSiteKey)"
                                @submit-register="identity.submitRegister(turnstileSiteKey)"
                                @submit-guest="identity.submitGuest"
                                @social-login="identity.handleCheckoutSocialLogin"
                                @change-identity="returnToAccountOptions"
                            />

                            <CheckoutAddressStep
                                :current-step="currentStep"
                                :identity-completed="identity.identityCompleted.value"
                                :address-completed="addressCompleted"
                                :use-separate-shipping="addresses.useSeparateShipping.value"
                                :billing-address="addresses.billingAddress"
                                :shipping-address="addresses.shippingAddress"
                                :billing-errors="addresses.billingErrors"
                                :shipping-errors="addresses.shippingErrors"
                                :countries="regionCountries"
                                :saved-addresses="addresses.savedAddresses.value"
                                :is-saved-addresses-loading="addresses.isSavedAddressesLoading.value"
                                :saved-addresses-error="addresses.savedAddressesError.value"
                                :selected-billing-saved-address-id="addresses.selectedBillingSavedAddressId.value"
                                :selected-shipping-saved-address-id="addresses.selectedShippingSavedAddressId.value"
                                :is-submitting="isSubmitting"
                                @update:use-separate-shipping="addresses.useSeparateShipping.value = $event"
                                @update:selected-billing-saved-address-id="addresses.updateSelectedBillingSavedAddress"
                                @update:selected-shipping-saved-address-id="addresses.updateSelectedShippingSavedAddress"
                                @update:billing-field="addresses.updateBillingAddressField"
                                @update:shipping-field="addresses.updateShippingAddressField"
                                @back="currentStep = 'account'"
                                @submit="submitAddresses"
                            />

                            <CheckoutPaymentStep
                                :current-step="currentStep"
                                :address-completed="addressCompleted"
                                :is-shipping-loading="payment.isShippingLoading.value"
                                :shipping-options="payment.shippingOptions.value"
                                :selected-shipping-option-id="payment.selectedShippingOptionId.value"
                                :client-secret-value="payment.clientSecretValue.value"
                                :is-payment-initializing="payment.isPaymentInitializing.value"
                                :is-loading="payment.isLoading.value"
                                :is-redirecting-to-order="payment.isRedirectingToOrder.value"
                                :get-shipping-option-label="payment.getShippingOptionLabel"
                                @update:selected-shipping-option-id="payment.selectedShippingOptionId.value = $event"
                                @back="currentStep = 'address'"
                                @submit="payment.handleSubmit"
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
