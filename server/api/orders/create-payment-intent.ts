import { STRIPE_PAYMENT_PROVIDER } from "@/utils/consts"

type StripeSessionData = {
    client_secret?: string
    publishable_key?: string
    stripe_account?: string
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const { cartId } = await readBody(event)
    const sessionCartId = getCookie(event, "cart_id") || null

    if (!cartId) {
        throw createError({ statusCode: 400, statusMessage: "Cart ID is required." })
    }

    if (!sessionCartId || sessionCartId !== cartId) {
        throw createError({ statusCode: 403, statusMessage: "This cart is not available for payment." })
    }

    const headers = {
        "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
        "Content-Type": "application/json"
    }

    async function fetchCart() {
        const res = await fetch(`${config.public.MEDUSA_URL}/store/carts/${cartId}`, {
            method: "GET",
            headers,
            credentials: "include"
        })

        if (!res.ok) {
            console.error("Failed to fetch payment cart", await res.text().catch(() => res.statusText))
            throw createError({ statusCode: 502, statusMessage: "Could not prepare this cart for payment." })
        }

        const data = await res.json()
        return data.cart
    }

    let cart = await fetchCart()

    let paymentCollectionId = cart.payment_collection?.id

    if (!paymentCollectionId) {
        const collectionResponse = await fetch(`${config.public.MEDUSA_URL}/store/payment-collections`, {
            method: "POST",
            headers,
            credentials: "include",
            body: JSON.stringify({ cart_id: cart.id })
        })

        if (!collectionResponse.ok) {
            console.error("Failed to create payment collection", await collectionResponse.text().catch(() => collectionResponse.statusText))
            throw createError({ statusCode: 502, statusMessage: "Could not prepare payment for this cart." })
        }

        const { payment_collection } = await collectionResponse.json()
        paymentCollectionId = payment_collection.id
    }

    cart = await fetchCart()

    let stripeSession = cart.payment_collection?.payment_sessions?.find(
        (session: { provider_id: string; data?: StripeSessionData }) => session.provider_id === STRIPE_PAYMENT_PROVIDER
    )

    if (!stripeSession?.data?.client_secret) {
        const createSessionResponse = await fetch(
            `${config.public.MEDUSA_URL}/store/payment-collections/${paymentCollectionId}/payment-sessions`,
            {
                method: "POST",
                headers,
                credentials: "include",
                body: JSON.stringify({ provider_id: STRIPE_PAYMENT_PROVIDER })
            }
        )

        if (!createSessionResponse.ok) {
            console.error("Failed to create Stripe payment session", await createSessionResponse.text().catch(() => createSessionResponse.statusText))
            throw createError({ statusCode: 502, statusMessage: "Could not start the secure payment session." })
        }

        cart = await fetchCart()

        stripeSession = cart.payment_collection?.payment_sessions?.find(
            (session: { provider_id: string; data?: StripeSessionData }) => session.provider_id === STRIPE_PAYMENT_PROVIDER
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
