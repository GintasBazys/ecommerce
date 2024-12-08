<script setup lang="ts">
import { ref, onMounted } from "vue"
import type { Stripe, StripeElements } from "@stripe/stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useRuntimeConfig } from "#app"

definePageMeta({
    layout: "checkout"
})

const isLoading = ref(false)
let stripe: Stripe | null = null
let elements: StripeElements | null = null
const clientSecret = ref<string | null>(null)
const cartStore = useCartStore()
const { cart } = storeToRefs(cartStore)
const config = useRuntimeConfig()
const router = useRouter()

onMounted(async () => {
    const stripeKey = config.public.STRIPE_PUBLIC_KEY

    if (cart.value?.items && cart.value.items.length <= 0) {
        return
    }
    stripe = await loadStripe(stripeKey)

    if (!stripe) {
        return
    }

    try {
        const response = await fetch("/api/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cartId: cart.value?.id })
        })
        const { clientSecret: fetchedClientSecret } = await response.json()
        clientSecret.value = fetchedClientSecret

        if (clientSecret.value) {
            elements = stripe.elements({ clientSecret: clientSecret.value })

            const paymentElement = elements.create("payment")
            const linkAuthenticationElement = elements.create("linkAuthentication")

            paymentElement.mount("#payment-element")
            linkAuthenticationElement.mount("#link-authentication-element")
        } else {
            console.error("Client secret not received")
        }
    } catch (error) {
        console.error("Error setting up payment:", error)
    }

    isLoading.value = false
})

const handleSubmit = async () => {
    if (isLoading.value || !stripe || !elements || !clientSecret.value) return
    isLoading.value = true

    try {
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required"
        })

        if (error) {
            console.error("Payment confirmation error:", error)
            return
        }

        if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "requires_capture")) {
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

const completeCart = async () => {
    try {
        const response = await fetch("/api/complete-cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ cartId: cart.value?.id })
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error("Cart completion error:", errorData.message)
            return
        }

        const { type, order, error } = await response.json()

        if (type === "order" && order) {
            await createNewCart(cartStore)
            alert("Order placed.")
        } else {
            console.error("Order completion issue:", error)
        }
    } catch (error) {
        console.error("Error completing cart:", error)
    }
}
</script>

<template>
    <main>
        <div class="container py-5">
            <h1 class="mb-4">Payment</h1>
            <form id="payment-form" @submit.prevent="handleSubmit">
                <div id="link-authentication-element"></div>
                <div id="payment-element"></div>
                <button id="submit" class="btn btn-primary mt-4" :disabled="isLoading">
                    {{ isLoading ? "Processing..." : "Pay now" }}
                </button>
            </form>
        </div>
    </main>
</template>

<style scoped>
button {
    margin-top: 10px;
}
</style>
