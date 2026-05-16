import type { ProductDTO } from "@medusajs/types"
import type { H3Event } from "h3"

import { fetchMedusaJson, fetchMedusaResponse, safeJson, toUpstreamError } from "#server/utils/medusa-proxy"

type MedusaWishlistItem = {
    id: string
    customer_id: string
    product_id: string
    created_at?: string
    updated_at?: string
}

type MedusaWishlistResponse = {
    wishlist?: {
        customer_id?: string
        items?: MedusaWishlistItem[]
    }
}

type MedusaWishlistMutationResponse = {
    wishlist_item?: MedusaWishlistItem
}

type StoreProductResponse = {
    product?: ProductDTO | null
}

const PRODUCT_FIELDS = "id,title,handle,thumbnail,subtitle,description,*images,+metadata,*collection,*type,*categories,*variants,*variants.calculated_price,+variants.inventory_quantity"

function getRequiredString(value: unknown, name: string): string {
    const text = typeof value === "string" ? value.trim() : ""

    if (!text) {
        throw createError({ statusCode: 400, statusMessage: `${name} is required` })
    }

    return text
}

async function fetchWishlistProduct(event: H3Event, productId: string, regionId: string, countryCode: string) {
    try {
        const params = new URLSearchParams({
            fields: PRODUCT_FIELDS,
            region_id: regionId,
            country_code: countryCode
        })

        const payload = await fetchMedusaJson<StoreProductResponse>(event, `/store/products/${productId}?${params.toString()}`)

        return payload.product ?? null
    } catch {
        return null
    }
}

async function handleGetWishlist(event: H3Event) {
    const query = getQuery(event)
    const regionId = getRequiredString(query.region_id, "region_id")
    const countryCode = getRequiredString(query.country_code, "country_code")

    const response = await fetchMedusaResponse(event, "/store/wishlists", {
        method: "GET"
    })

    if (response.status === 401) {
        throw createError({ statusCode: 401, statusMessage: "Sign in to view your wishlist" })
    }

    if (!response.ok) {
        throw createError({ statusCode: response.status, statusMessage: "Failed to fetch wishlist" })
    }

    const payload = await safeJson<MedusaWishlistResponse>(response)
    const items = payload?.wishlist?.items ?? []
    const products = await Promise.all(items.map((item) => fetchWishlistProduct(event, item.product_id, regionId, countryCode)))

    return {
        success: true,
        wishlist: {
            customer_id: payload?.wishlist?.customer_id,
            items: items.map((item, index) => ({
                ...item,
                product: products[index] ?? null
            }))
        }
    }
}

async function handleAddWishlistItem(event: H3Event) {
    const body = await readBody<{ product_id?: string }>(event)
    const productId = getRequiredString(body?.product_id, "product_id")

    const payload = await fetchMedusaJson<MedusaWishlistMutationResponse>(event, "/store/wishlists", {
        method: "POST",
        body: JSON.stringify({ product_id: productId })
    })

    if (!payload.wishlist_item) {
        throw createError({ statusCode: 500, statusMessage: "Failed to create wishlist item" })
    }

    return {
        success: true,
        wishlist_item: payload.wishlist_item
    }
}

export default defineEventHandler(async (event) => {
    try {
        if (event.method === "GET") {
            return await handleGetWishlist(event)
        }

        if (event.method === "POST") {
            return await handleAddWishlistItem(event)
        }

        throw createError({ statusCode: 405, statusMessage: "Method not allowed" })
    } catch (error: unknown) {
        throw toUpstreamError(error, "Wishlist request failed")
    }
})
