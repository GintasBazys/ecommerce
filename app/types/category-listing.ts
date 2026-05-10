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
}

export type CategoryPriceRange = {
    min: number | null
    max: number | null
    currencyCode: string | null
}

export type CategoryProductsResponse = {
    products: CategoryProduct[]
    count: number
    facets: CategoryProductsFacets
    priceRange: CategoryPriceRange
}

export type CategorySortOption = {
    text: string
    value: string
}

export type CategoryFilterSection = {
    id: string
    title: string
}

export type CategorySelectionGroup = "child" | "collection" | "type" | "tag"
