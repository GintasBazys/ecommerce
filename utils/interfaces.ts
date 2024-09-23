import type { ProductStatus } from "@medusajs/types"
import type { Relation } from "typeorm"
import type { ProductVariant } from "@medusajs/medusa"

export interface CustomerInterface {
    id: string
    email: string
    first_name: string
    last_name: string
    billing_address_id: string
    phone: number
    has_account: boolean
    created_at: string
    updated_at: string
    deleted_at: string
    metadata: {
        [key: string]: string
    }
}

export interface ProductInterface {
    title: string
    subtitle: string | null
    description: string | null
    handle: string | null
    is_giftcard: boolean
    status: ProductStatus
    thumbnail: string | null
    variants: Relation<ProductVariant>[]
    images: {
        url: string
        metadata: Record<string, unknown>
        deleted_at: Date | null
        id: string
        created_at: Date
        updated_at: Date
    }[]
    updated_at: Date
}

export interface CustomerResponseInterface {
    customer: CustomerInterface
}
