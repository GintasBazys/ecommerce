import type { H3Event } from "h3"

import { retrieveExpandedCart, syncCartCountry } from "#server/utils/cart"
import { assertMedusaResponse, fetchMedusaResponse, safeJson, toUpstreamError } from "#server/utils/medusa-proxy"

type CartResponse = {
    cart?: {
        id: string
        shipping_address?: {
            country_code?: string | null
        } | null
        billing_address?: {
            country_code?: string | null
        } | null
    }
}

async function createCart(event: H3Event, regionId: string, countryCode: string | null) {
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

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const regionId = String(query.region_id || "")
    if (!regionId) {
        throw createError({ statusCode: 400, statusMessage: "Region ID is required" })
    }

    const forceNew = query.force_new === "1"
    const cartId = forceNew ? null : getCookie(event, "cart_id") || null
    const countryCode = getCookie(event, "country_code") || null

    const cookieOptions = { path: "/", sameSite: "lax" as const, secure: process.env.NODE_ENV === "production" }

    try {
        if (!cartId) {
            const cart = await createCart(event, regionId, countryCode)
            setCookie(event, "cart_id", cart.id, cookieOptions)

            return { cart, regionId }
        }

        const existingCartResponse = await fetchMedusaResponse(event, `/store/carts/${cartId}?fields=%2Bitems.*,%2Bshipping_methods.*`, {
            method: "GET"
        })

        if (!existingCartResponse.ok) {
            setCookie(event, "cart_id", "", { ...cookieOptions, maxAge: 0 })
            const cart = await createCart(event, regionId, countryCode)
            setCookie(event, "cart_id", cart.id, cookieOptions)
            return { cart, regionId }
        }

        const cart = await retrieveExpandedCart(event, cartId)
        return { cart: await syncCartCountry(event, cart, countryCode), regionId }
    } catch (error: unknown) {
        throw toUpstreamError(error, "Failed to load cart")
    }
})
