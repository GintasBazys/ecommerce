<script setup lang="ts">
import { loadStripe } from "@stripe/stripe-js/pure"

import type { ShippingOption } from "@/types/interfaces"
import type { Stripe, StripeElements, StripePaymentElement, StripeLinkAuthenticationElement } from "@stripe/stripe-js"

import { formatPrice } from "@/utils/formatPrice"

definePageMeta({ layout: "checkout" })
useHead({ title: "Checkout | Ecommerce" })

const isLoading = ref<boolean>(false)
const isShippingLoading = ref<boolean>(true)
const isPaymentInitializing = ref<boolean>(false)
const isCheckoutActive = ref<boolean>(true)

let stripe: Stripe | null = null
let elements: StripeElements | null = null
let paymentElement: StripePaymentElement | null = null
let linkAuthElement: StripeLinkAuthenticationElement | null = null

const clientSecretValue = ref<string | null>(null)

const shippingOptions = ref<ShippingOption[]>([])
const selectedShippingOptionId = ref<string | null>(null)

const { cart } = storeToRefs(useCartStore())
const config = useRuntimeConfig()
const router = useRouter()

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const debounceMs = 350
const lastPaymentSignature = ref("")
const lastAppliedShippingContext = ref("")

type CartLike = {
    id: string
    items?: Array<{ id: string; quantity: number }>
    total?: string | number | null
    updated_at?: string | number | null
}

const cartFingerprint = computed(() => {
    const c = cart.value as CartLike | null | undefined
    if (!c?.id) {
        return ""
    }
    const items = Array.isArray(c.items) ? c.items.map((i) => `${i.id}:${i.quantity}`).join("|") : ""
    return `${c.id}|${items}|${c.total ?? ""}|${c.updated_at ?? ""}`
})

function getPaymentSignature() {
    return `${cartFingerprint.value}|${selectedShippingOptionId.value ?? ""}`
}

function cleanup() {
    isCheckoutActive.value = false
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

type ShippingOptionsPayload = ShippingOption[] | { shipping_options?: ShippingOption[] }

async function loadShippingOptions() {
    if (!isCheckoutActive.value || !cart.value?.id) {
        return
    }

    isShippingLoading.value = true
    try {
        const res = await fetch("/api/orders/shipping-options", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ cart_id: cart.value.id })
        })

        const data = (await res.json()) as unknown
        const payload = data as ShippingOptionsPayload

        const options = Array.isArray(payload) ? payload : (payload.shipping_options ?? [])
        shippingOptions.value = options
        selectedShippingOptionId.value ||= options[0]?.id ?? null
    } finally {
        isShippingLoading.value = false
    }
}

async function updateShippingOption() {
    if (!isCheckoutActive.value || !cart.value?.id || !selectedShippingOptionId.value) {
        return
    }

    const ctx = `${cart.value.id}|${selectedShippingOptionId.value}`
    if (ctx === lastAppliedShippingContext.value) {
        return
    }

    await fetch("/api/orders/shipping-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            cart_id: cart.value.id,
            option_id: selectedShippingOptionId.value
        })
    })

    lastAppliedShippingContext.value = ctx
}

async function ensureElements(secret: string) {
    if (!isCheckoutActive.value || !stripe) {
        return
    }

    const linkEl = document.getElementById("link-authentication-element")
    const payEl = document.getElementById("payment-element")
    if (!linkEl || !payEl) {
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

type CreatePaymentIntentPayload = {
    clientSecret?: string
    client_secret?: string
}

async function createOrUpdatePaymentIntent() {
    if (!isCheckoutActive.value || !cart.value?.id || !selectedShippingOptionId.value) {
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

    const body = (await resp.json()) as unknown
    const payload = body as CreatePaymentIntentPayload
    const secret = payload.clientSecret ?? payload.client_secret
    if (!secret) {
        return
    }

    clientSecretValue.value = secret
    await ensureElements(secret)
}

async function refreshCheckout() {
    if (!isCheckoutActive.value) {
        return
    }

    isPaymentInitializing.value = true
    try {
        await updateShippingOption()
        const sig = getPaymentSignature()
        if (sig !== lastPaymentSignature.value) {
            await createOrUpdatePaymentIntent()
            lastPaymentSignature.value = sig
        }
    } finally {
        isPaymentInitializing.value = false
    }
}

function scheduleRefresh() {
    if (!isCheckoutActive.value) {
        return
    }
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(refreshCheckout, debounceMs)
}

onMounted(async () => {
    stripe = await loadStripe(String(config.public.STRIPE_PUBLIC_KEY))
})

onBeforeRouteLeave(() => cleanup())
onUnmounted(() => cleanup())

watch(
    () => cart.value?.id,
    async (id, prev) => {
        if (!isCheckoutActive.value) {
            return
        }
        if (id && id !== prev) {
            cleanup()
            isCheckoutActive.value = true
            await loadShippingOptions()
        }
    },
    { immediate: true }
)

watch(selectedShippingOptionId, scheduleRefresh)
watch(cartFingerprint, scheduleRefresh)

async function handleSubmit() {
    if (!stripe || !elements || !clientSecretValue.value) {
        return
    }

    isLoading.value = true
    try {
        const result = await stripe.confirmPayment({ elements, redirect: "if_required" })
        if (result.error) {
            return
        }
        await completeCart()
    } finally {
        isLoading.value = false
    }
}

type CompleteCartPayload = { order?: { id?: string } }

async function completeCart() {
    isCheckoutActive.value = false
    const res = await fetch("/api/cart/complete-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            cartId: cart.value?.id,
            shippingOptionId: selectedShippingOptionId.value
        })
    })

    const payload = (await res.json()) as unknown as CompleteCartPayload
    const orderId = payload.order?.id
    if (orderId) {
        await createNewCart(useCartStore())
        await router.push({ name: "order-completed", query: { orderId } })
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
                                                    ? formatPrice(option.prices[0]!.amount, option.prices[0]!.currency_code)
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
                            :loading="isLoading || isPaymentInitializing"
                            :disabled="!clientSecretValue || isShippingLoading || isPaymentInitializing"
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
