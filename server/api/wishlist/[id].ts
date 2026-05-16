import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"

type MedusaWishlistMutationResponse = {
    wishlist_item?: unknown
}

export default defineEventHandler(async (event) => {
    const wishlistItemId = getRouterParam(event, "id")

    if (!wishlistItemId) {
        throw createError({ statusCode: 400, statusMessage: "wishlist item id is required" })
    }

    if (event.method !== "DELETE") {
        throw createError({ statusCode: 405, statusMessage: "Method not allowed" })
    }

    try {
        const payload = await fetchMedusaJson<MedusaWishlistMutationResponse>(event, `/store/wishlists/${wishlistItemId}`, {
            method: "DELETE"
        })

        if (!payload.wishlist_item) {
            throw createError({ statusCode: 500, statusMessage: "Failed to delete wishlist item" })
        }

        return {
            success: true,
            wishlist_item: payload.wishlist_item
        }
    } catch (error: unknown) {
        throw toUpstreamError(error, "Failed to remove wishlist item")
    }
})
