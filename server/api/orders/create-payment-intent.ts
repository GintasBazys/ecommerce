import { STRIPE_PAYMENT_PROVIDER } from "@/utils/consts"
import { assertCartOwnership } from "#server/utils/cart"
import { fetchMedusaJson } from "#server/utils/medusa-proxy"

type StripeSessionData = {
    client_secret?: string
    publishable_key?: string
    stripe_account?: string
}

type PaymentSession = {
    provider_id: string
    data?: StripeSessionData
}

type PaymentCart = {
    id: string
    payment_collection?: {
        id?: string
        payment_sessions?: PaymentSession[]
    }
}

type CartPayload = {
    cart?: PaymentCart
}

type PaymentCollectionPayload = {
    payment_collection?: {
        id?: string
    }
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const { cartId } = await readBody(event)
    const trustedCartId = assertCartOwnership(event, cartId)

    async function fetchCart() {
        const data = await fetchMedusaJson<CartPayload>(
            event,
            `/store/carts/${trustedCartId}`,
            { method: "GET" },
            "Could not prepare this cart for payment."
        )

        if (!data.cart?.id) {
            throw createError({ statusCode: 502, statusMessage: "Could not prepare this cart for payment." })
        }

        return data.cart
    }

    let cart = await fetchCart()

    let paymentCollectionId = cart.payment_collection?.id

    if (!paymentCollectionId) {
        const { payment_collection } = await fetchMedusaJson<PaymentCollectionPayload>(
            event,
            "/store/payment-collections",
            {
                method: "POST",
                body: JSON.stringify({ cart_id: cart.id })
            },
            "Could not prepare payment for this cart."
        )

        paymentCollectionId = payment_collection?.id
    }

    if (!paymentCollectionId) {
        throw createError({ statusCode: 502, statusMessage: "Could not prepare payment for this cart." })
    }

    cart = await fetchCart()

    let stripeSession = cart.payment_collection?.payment_sessions?.find(
        (session: { provider_id: string; data?: StripeSessionData }) => session.provider_id === STRIPE_PAYMENT_PROVIDER
    )

    if (!stripeSession?.data?.client_secret) {
        await fetchMedusaJson(
            event,
            `/store/payment-collections/${paymentCollectionId}/payment-sessions`,
            {
                method: "POST",
                body: JSON.stringify({ provider_id: STRIPE_PAYMENT_PROVIDER })
            },
            "Could not start the secure payment session."
        )

        cart = await fetchCart()

        stripeSession = cart.payment_collection?.payment_sessions?.find(
            (session) => session.provider_id === STRIPE_PAYMENT_PROVIDER
        )
    }

    if (!stripeSession?.data?.client_secret) {
        throw createError({ statusCode: 502, statusMessage: "Secure payment details are not available yet." })
    }

    return {
        clientSecret: stripeSession.data.client_secret,
        publishableKey: config.public.STRIPE_PUBLIC_KEY
    }
})
