<script setup lang="ts">
import { ref, onMounted } from "vue"
import type { Stripe, StripeElements } from "@stripe/stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useRuntimeConfig } from "#app"
import { useCartStore } from "~/stores/cart"
import { storeToRefs } from "pinia"
import { useRouter } from "vue-router"
import { VSkeletonLoader } from "vuetify/components"

interface Price {
    amount: number
    currency_code: string
}

interface ShippingOption {
    id: string
    name: string
    calculated_price?: { calculated_amount: number }
    prices: Price[]
}

definePageMeta({ layout: "checkout" })

const isLoading = ref(false)
const isShippingLoading = ref(true)
let stripe: Stripe | null = null
let elements: StripeElements | null = null
const clientSecretValue = ref<string | null>(null)

const shippingOptions = ref<Array<ShippingOption>>([])
const selectedShippingOptionId = ref<string | null>(null)

const cartStore = useCartStore()
const { cart } = storeToRefs(cartStore)
const config = useRuntimeConfig()
const router = useRouter()

function formatPrice(cents: number, currency: string) {
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: 2
    }).format(cents)
}

async function initializeStripe() {
    if (!cart.value?.items?.length) return

    const publicKey = config.public.STRIPE_PUBLIC_KEY
    stripe = await loadStripe(publicKey)
    if (!stripe) return

    try {
        const paymentIntentResponse = await fetch("/api/orders/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cartId: cart.value.id })
        })
        const { clientSecret } = await paymentIntentResponse.json()
        clientSecretValue.value = clientSecret

        if (clientSecret) {
            elements = stripe.elements({ clientSecret })
            elements.create("linkAuthentication").mount("#link-authentication-element")
            elements.create("payment").mount("#payment-element")
        } else {
            console.error("Client secret not received")
        }
    } catch (error) {
        console.error("Error setting up payment:", error)
    }
}

async function loadShippingOptions() {
    if (!cart.value?.id) {
        isShippingLoading.value = false
        return
    }

    try {
        const response = await fetch("/api/orders/shipping-options", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ cart_id: cart.value.id })
        })
        const data = await response.json()
        const options = Array.isArray(data) ? data : Array.isArray(data.shipping_options) ? data.shipping_options : []

        shippingOptions.value = options
        if (options.length) {
            selectedShippingOptionId.value = options[0].id
        }
    } catch (error) {
        console.error("Error loading shipping options:", error)
    } finally {
        isShippingLoading.value = false
    }
}

onMounted(async () => {
    await loadShippingOptions()
    await initializeStripe()
    isLoading.value = false
})

async function updateShippingOption() {
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

const handleSubmit = async () => {
    if (isLoading.value || !stripe || !elements || !clientSecretValue.value) return
    isLoading.value = true

    await updateShippingOption()

    try {
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required"
        })

        if (error) {
            console.error("Payment confirmation error:", error)
            return
        }

        if (paymentIntent?.status === "succeeded" || paymentIntent?.status === "requires_capture") {
            await completeCart()
            await router.push("/order-completed")
        } else {
            console.error("Payment was not successful.")
        }
    } catch (error) {
        console.error("Error processing payment:", error)
    } finally {
        isLoading.value = false
    }
}

async function completeCart() {
    try {
        const response = await fetch("/api/cart/complete-cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                cartId: cart.value?.id,
                shippingOptionId: selectedShippingOptionId.value
            })
        })
        const payload = await response.json()
        if (!response.ok) {
            console.error("Cart completion error:", payload.message)
            return
        }

        if (payload.type === "order") {
            alert("Order placed.")
        } else {
            console.error("Order completion issue:", payload.error)
        }
    } catch (error) {
        console.error("Error completing cart:", error)
    } finally {
        await createNewCart(cartStore)
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
                            <VRadioGroup v-model="selectedShippingOptionId" row @change="updateShippingOption">
                                <VRadio
                                    v-for="option in shippingOptions"
                                    :key="option.id"
                                    :value="option.id"
                                    :label="`
                                        ${option.name} -
                                        ${
                                            option.calculated_price
                                                ? formatPrice(option.calculated_price.calculated_amount, 'EUR')
                                                : option.prices.length
                                                  ? formatPrice(option.prices[0].amount, option.prices[0].currency_code)
                                                  : 'Free'
                                        }
                                    `"
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
                        <VBtn variant="tonal" :loading="isLoading" color="primary" large class="font-weight-bold" @click="handleSubmit">
                            Pay Now
                        </VBtn>
                    </VCardActions>
                </VCard>
            </VCol>
        </VRow>
    </VContainer>
</template>
