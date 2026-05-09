import type { ProductDTO } from "@medusajs/types"

export type ProductListResponse = {
    products?: ProductDTO[]
    count?: number
    productLimit?: number
    productOffset?: number
}

export type ProductCategorySummary = {
    id: string
    name?: string | null
}

export type ProductGalleryImage = {
    id: string
    src: string
}

export type ProductTag = {
    id?: string | null
    value?: string | null
}

export type ProductFact = {
    label: string
    value: string
}

export type ProductReviewForm = {
    title: string
    content: string
    rating: number
    firstName: string
    lastName: string
    productId: string
}

export type SafeProductReview = {
    id: string
    rating: number
    title: string
    author: string
    content: string
    createdAt: string
}
