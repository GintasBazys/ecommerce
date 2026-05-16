import type { ProductDTO } from "@medusajs/types"

export type WishlistItem = {
    id: string
    customer_id: string
    product_id: string
    product?: ProductDTO | null
    created_at?: string
    updated_at?: string
}

export type WishlistResponse = {
    success: boolean
    wishlist: {
        customer_id?: string
        items: WishlistItem[]
    }
}

export type WishlistMutationResponse = {
    success: boolean
    wishlist_item: WishlistItem
}
