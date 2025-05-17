<script setup lang="ts">
import type { Stripe, StripeElements } from "@stripe/stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import type { ShippingOption } from "@/types/interfaces"
import { formatPrice } from "@/utils/formatPrice"

definePageMeta({ layout: "checkout" })

useHead({
    title: "Checkout | Ecommerce"
})

const isLoading = ref<boolean>(false)
const isShippingLoading = ref<boolean>(true)
let stripe: Stripe | null = null
let elements: StripeElements | null = null
const clientSecretValue = ref<string | null>(null)

const shippingOptions = ref<ShippingOption[]>([])
const selectedShippingOptionId = ref<string | null>(null)

const { cart } = storeToRefs(useCartStore())
const config = useRuntimeConfig()
const router = useRouter()

async function createPaymentIntent(): Promise<void> {
    if (!stripe || !cart.value?.id || !selectedShippingOptionId.value) return

    isShippingLoading.value = true

    try {
        await updateShippingOption()
    } catch (e) {
        console.error("Could not update shipping method:", e)
        isShippingLoading.value = false
        return
    }

    const resp = await fetch("/api/orders/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            cartId: cart.value.id,
            shippingOptionId: selectedShippingOptionId.value
        })
    })
    const body = await resp.json()
    const secret = body.clientSecret ?? body.client_secret
    if (!secret) {
        console.error("No client_secret in response:", body)
        isShippingLoading.value = false
        return
    }

    clientSecretValue.value = secret

    const { paymentIntent } = await stripe.retrievePaymentIntent(secret)
    if (!paymentIntent) {
        console.error("Unable to retrieve PaymentIntent")
        isShippingLoading.value = false
        return
    }
    if (["succeeded", "requires_capture"].includes(paymentIntent.status)) {
        await router.push("/order-completed")
        return
    }

    if (!elements) {
        elements = stripe.elements({ clientSecret: secret })
        elements.create("linkAuthentication").mount("#link-authentication-element")
        elements.create("payment").mount("#payment-element")
    }

    isShippingLoading.value = false
}

async function loadShippingOptions(): Promise<void> {
    if (!cart.value?.id) {
        isShippingLoading.value = false
        return
    }
    try {
        const res = await fetch("/api/orders/shipping-options", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ cart_id: cart.value.id })
        })
        const data = await res.json()
        const options: ShippingOption[] = Array.isArray(data) ? data : Array.isArray(data.shipping_options) ? data.shipping_options : []

        shippingOptions.value = options
        if (options.length) {
            selectedShippingOptionId.value = options[0].id
        }
    } catch (e) {
        console.error("Error loading shipping options:", e)
    }
}

async function updateShippingOption(): Promise<void> {
    if (!cart.value?.id || !selectedShippingOptionId.value) return

    try {
        const res = await fetch("/api/orders/shipping-methods", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                cart_id: cart.value.id,
                option_id: selectedShippingOptionId.value
            })
        })

        if (!res.ok) {
            const err = await res.json()
            console.error("Failed to set shipping method:", err)
        }
    } catch (e) {
        console.error("Error updating shipping method:", e)
    }
}

onMounted(async () => {
    stripe = await loadStripe(config.public.STRIPE_PUBLIC_KEY)
    if (!stripe) {
        console.error("Failed to load Stripe.js")
        return
    }
    await loadShippingOptions()
})

watch(
    () => cart.value?.id,
    (id) => {
        if (id) loadShippingOptions()
    },
    { immediate: true }
)

watch(
    selectedShippingOptionId,
    async (newId) => {
        if (newId) await createPaymentIntent()
    },
    { immediate: true }
)

async function handleSubmit(): Promise<void> {
    if (isLoading.value || !stripe || !elements || !clientSecretValue.value) return
    isLoading.value = true

    try {
        const { error } = await stripe.confirmPayment({
            elements,
            redirect: "if_required"
        })

        if (error) {
            console.error("Payment confirmation error:", error)
            return
        }
        await completeCart()
    } catch (e) {
        console.error("Error processing payment:", e)
    } finally {
        isLoading.value = false
    }
}

async function completeCart(): Promise<void> {
    try {
        const res = await fetch("/api/cart/complete-cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                cartId: cart.value?.id,
                shippingOptionId: selectedShippingOptionId.value
            })
        })
        const payload = await res.json()
        if (!res.ok) {
            console.error("Cart completion error:", payload.message)
            return
        }
        if (payload.type === "order") {
            const orderId = payload.order.id
            await createNewCart(useCartStore())
            await router.push({ name: "order-completed", query: { orderId } })
        } else {
            console.error("Order completion issue:", payload.error)
        }
    } catch (e) {
        console.error("Error completing cart:", e)
    }
}
</script>

<template>
    <VContainer class="py-8">
        <VRow>
            <VCol cols="12" md="6">
                <VCard>
                    <VCardTitle>Shipping Method</VCardTitle>
                    <VCardText>
                        <template v-if="isShippingLoading">
                            <VSkeletonLoader type="list-item" />
                            <VSkeletonLoader type="list-item" />
                            <VSkeletonLoader type="list-item" />
                        </template>
                        <template v-else>
                            <VRadioGroup v-model="selectedShippingOptionId" row>
                                <VRadio
                                    v-for="option in shippingOptions"
                                    :key="option.id"
                                    :value="option.id"
                                    :label="
                                        option.name +
                                        ' - ' +
                                        (option.calculated_price
                                            ? formatPrice(option.calculated_price.calculated_amount, 'EUR')
                                            : option.prices.length
                                              ? formatPrice(option.prices[0].amount, option.prices[0].currency_code)
                                              : 'Free')
                                    "
                                />
                            </VRadioGroup>
                        </template>
                    </VCardText>
                </VCard>
            </VCol>
            <VCol cols="12" md="6">
                <VCard>
                    <VCardTitle>Payment Details</VCardTitle>
                    <VCardText>
                        <div id="link-authentication-element"></div>
                        <div id="payment-element" class="my-4"></div>
                    </VCardText>
                    <VCardActions>
                        <VSpacer />
                        <VBtn
                            variant="tonal"
                            :loading="isLoading"
                            :disabled="!clientSecretValue || isShippingLoading"
                            color="primary"
                            large
                            class="font-weight-bold"
                            @click="handleSubmit"
                        >
                            Pay Now
                        </VBtn>
                    </VCardActions>
                </VCard>
            </VCol>
        </VRow>
    </VContainer>
</template>
