export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const { cartId } = await readBody(event)

    if (!cartId) {
        throw new Error("Cart ID is required.")
    }

    let cartResponse = await fetch(`${config.public.MEDUSA_URL}/store/carts/${cartId}`, {
        method: "GET",
        headers: {
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
            "Content-Type": "application/json"
        },
        credentials: "include"
    })

    let { cart } = await cartResponse.json()

    const providersResponse = await fetch(`${config.public.MEDUSA_URL}/store/payment-providers?region_id=${cart.region_id}`, {
        method: "GET",
        headers: {
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
            "Content-Type": "application/json"
        },
        credentials: "include"
    })

    const { payment_providers } = await providersResponse.json()
    if (!payment_providers || payment_providers.length === 0) {
        throw new Error("No payment providers available for this region.")
    }

    let paymentCollectionId = cart.payment_collection?.id
    if (!paymentCollectionId) {
        const collectionResponse = await fetch(`${config.public.MEDUSA_URL}/store/payment-collections`, {
            method: "POST",
            headers: {
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ cart_id: cart.id })
        })

        const { payment_collection } = await collectionResponse.json()
        paymentCollectionId = payment_collection.id
    }

    await fetch(`${config.public.MEDUSA_URL}/store/payment-collections/${paymentCollectionId}/payment-sessions`, {
        method: "POST",
        headers: {
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ provider_id: "pp_stripe_stripe" })
    })

    cartResponse = await fetch(`${config.public.MEDUSA_URL}/store/carts/${cartId}`, {
        method: "GET",
        headers: {
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
            "Content-Type": "application/json"
        },
        credentials: "include"
    })

    cart = (await cartResponse.json()).cart

    const paymentSessions = cart.payment_collection.payment_sessions
    const stripeSession = paymentSessions.find((session: { provider_id: string }) => session.provider_id === "pp_stripe_stripe")

    if (!stripeSession || !stripeSession.data.client_secret) {
        throw new Error("Client secret not available for Stripe payment session.")
    }

    return { clientSecret: stripeSession.data.client_secret }
})
