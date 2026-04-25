import type { H3Event } from "h3"

import { assertMedusaResponse, fetchMedusaJson, fetchMedusaResponse, safeJson } from "#server/utils/medusa-proxy"

type CartAddress = {
    country_code?: string | null
    [key: string]: unknown
}

type StoreCartLike = {
    id: string
    region_id?: string | null
    items?: Array<{
        id: string
        variant_id?: string | null
        quantity?: number | null
    }> | null
    shipping_address?: CartAddress | null
    billing_address?: CartAddress | null
}

type CartResponse = {
    cart?: StoreCartLike
}

const CART_FIELDS = "+items.*,+shipping_methods.*"

export type RecoverableCartItem = NonNullable<StoreCartLike["items"]>[number]

type RecoveryResponse = {
    success: true
    cart: StoreCartLike
    recovered: true
    recoveryMessage: string
}

type RecoverPoisonedCartOptions = {
    event: H3Event
    currentCart: StoreCartLike
    nextItems: RecoverableCartItem[]
    countryCode: string | null
    emptyMessage: string
    preservedMessage: string
}

export function isPoisonedPaymentSessionError(error: unknown): error is { statusMessage?: string } {
    return typeof error === "object"
        && error !== null
        && "statusMessage" in error
        && typeof error.statusMessage === "string"
        && error.statusMessage.toLowerCase().includes("payment session")
}

export async function recoverPoisonedCart({
    event,
    currentCart,
    nextItems,
    countryCode,
    emptyMessage,
    preservedMessage
}: RecoverPoisonedCartOptions): Promise<RecoveryResponse | null> {
    const regionId = currentCart.region_id ?? (getCookie(event, "region_id") || null)

    if (!regionId) {
        return null
    }

    const replacementCart = await createCartForRegion(event, regionId, countryCode)

    for (const item of nextItems) {
        if (!item.variant_id || !item.quantity || item.quantity <= 0) {
            continue
        }

        await fetchMedusaJson(event, `/store/carts/${replacementCart.id}/line-items`, {
            method: "POST",
            body: JSON.stringify({
                variant_id: item.variant_id,
                quantity: item.quantity
            })
        })
    }

    const hydratedReplacementCart = await retrieveExpandedCart(event, replacementCart.id)
    setCookie(event, "cart_id", replacementCart.id, {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    })

    return {
        success: true,
        cart: await syncCartCountry(event, hydratedReplacementCart, countryCode),
        recovered: true,
        recoveryMessage: nextItems.length ? preservedMessage : emptyMessage
    }
}

export async function createCartForRegion(event: H3Event, regionId: string, countryCode: string | null) {
    const response = await fetchMedusaResponse(event, "/store/carts", {
        method: "POST",
        body: JSON.stringify({ region_id: regionId })
    })

    await assertMedusaResponse(response, "Failed to create cart")

    const payload = await safeJson<CartResponse>(response)
    const cart = payload?.cart

    if (!cart?.id) {
        throw createError({ statusCode: 502, statusMessage: "Invalid Medusa cart response" })
    }

    return await syncCartCountry(event, cart, countryCode)
}

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
