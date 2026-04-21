import type { ProductDTO } from "@medusajs/types"

export type CategoryImage = {
    type?: string
    url?: string
}

export type FacetItem = {
    id: string
    label: string
    count: number
}

export type PriceRange = [number, number]

export type CategoryProduct = ProductDTO & {
    collection?: { id: string; title?: string } | null
    type?: { id: string; value?: string } | null
    tags?: { id: string; value?: string }[]
    categories?: { id: string; name?: string; parent_category_id?: string | null }[]
}

export type CategoryProductsFacets = {
    categories: FacetItem[]
    collections: FacetItem[]
    types: FacetItem[]
    tags: FacetItem[]
    price: {
        min: number
        max: number
        currencyCode: string | null
    }
}

export type CategoryProductsResponse = {
    products: CategoryProduct[]
    count: number
    facets: CategoryProductsFacets
}

export type CategorySortOption = {
    text: string
    value: string
}
