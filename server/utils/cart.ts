import type { H3Event } from "h3"

import { fetchMedusaJson } from "#server/utils/medusa-proxy"

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

export async function retrieveExpandedCart(event: H3Event, cartId: string) {
    const data = await fetchMedusaJson<{ cart?: StoreCartLike } | StoreCartLike>(
        event,
        `/store/carts/${cartId}?fields=${encodeURIComponent(CART_FIELDS)}`
    )

    return ("cart" in data ? data.cart : data) as StoreCartLike
}

export async function syncCartCountry(event: H3Event, cart: StoreCartLike, countryCode?: string | null) {
    const normalizedCountryCode = countryCode?.toLowerCase().trim()
    if (!normalizedCountryCode) {
        return cart
    }

    const currentCountryCode =
        cart.shipping_address?.country_code?.toLowerCase() ?? cart.billing_address?.country_code?.toLowerCase() ?? null
    if (currentCountryCode === normalizedCountryCode) {
        return cart
    }

    await fetchMedusaJson(event, `/store/carts/${cart.id}`, {
        method: "POST",
        body: JSON.stringify({
            shipping_address: {
                ...(cart.shipping_address ?? {}),
                country_code: normalizedCountryCode
            }
        })
    })

    return retrieveExpandedCart(event, cart.id)
}
