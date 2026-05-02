import type { ProductCategoryDTO } from "@medusajs/types"

import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"

type NavigationCategory = {
    id: string
    handle: string
    name: string
    imageUrl: string | null
}

type CategoryImage = {
    url?: string | null
    type?: string | null
}

type NavigationCategoryResponse = ProductCategoryDTO & {
    product_category_image?: CategoryImage[] | null
}

function getCategoryImageUrl(category: NavigationCategoryResponse): string | null {
    const images = Array.isArray(category.product_category_image) ? category.product_category_image : []
    return images.find((image) => image.type === "thumbnail")?.url || images.find((image) => image.url)?.url || null
}

export default defineEventHandler(async (event) => {
    try {
        const { product_categories } = await fetchMedusaJson<{ product_categories: NavigationCategoryResponse[] }>(
            event,
            "/store/product-categories?fields=id,name,handle,*product_category_image"
        )

        setHeader(event, "Cache-Control", "no-store")

        return (product_categories || []).map<NavigationCategory>((category) => ({
            id: category.id,
            handle: category.handle || "",
            name: category.name || "",
            imageUrl: getCategoryImageUrl(category)
        }))
    } catch (error: unknown) {
        setHeader(event, "Cache-Control", "no-store")
        throw toUpstreamError(error, "Failed to fetch navigation categories")
    }
})
