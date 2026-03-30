import type { H3Event } from "h3"

type CartAddress = {
    country_code?: string | null
    [key: string]: unknown
}

type StoreCartLike = {
    id: string
    shipping_address?: CartAddress | null
    billing_address?: CartAddress | null
}

const CART_FIELDS = "+items.*,+shipping_methods.*"

function getMedusaHeaders(event: H3Event, publishableKey: string) {
    return {
        "x-publishable-api-key": publishableKey,
        "Content-Type": "application/json",
        cookie: getHeader(event, "cookie") ?? ""
    }
}

export async function retrieveExpandedCart(event: H3Event, medusaUrl: string, publishableKey: string, cartId: string) {
    const data = await $fetch<{ cart?: StoreCartLike } | StoreCartLike>(`${medusaUrl}/store/carts/${cartId}`, {
        headers: getMedusaHeaders(event, publishableKey),
        query: {
            fields: CART_FIELDS
        }
    })

    return ("cart" in data ? data.cart : data) as StoreCartLike
}

export async function syncCartCountry(
    event: H3Event,
    medusaUrl: string,
    publishableKey: string,
    cart: StoreCartLike,
    countryCode?: string | null
) {
    const normalizedCountryCode = countryCode?.toLowerCase().trim()
    if (!normalizedCountryCode) {
        return cart
    }

    const currentCountryCode =
        cart.shipping_address?.country_code?.toLowerCase() ?? cart.billing_address?.country_code?.toLowerCase() ?? null
    if (currentCountryCode === normalizedCountryCode) {
        return cart
    }

    await $fetch(`${medusaUrl}/store/carts/${cart.id}`, {
        method: "POST",
        headers: getMedusaHeaders(event, publishableKey),
        body: {
            shipping_address: {
                ...(cart.shipping_address ?? {}),
                country_code: normalizedCountryCode
            }
        }
    })

    return retrieveExpandedCart(event, medusaUrl, publishableKey, cart.id)
}
