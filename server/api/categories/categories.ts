import type { ProductCategoryDTO } from "@medusajs/types"

import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"

export default defineCachedEventHandler(
    async (event) => {
        try {
            const { product_categories } = await fetchMedusaJson<{ product_categories: ProductCategoryDTO[] }>(
                event,
                "/store/product-categories?fields=*category_children,*products,*parent_category,*parent_category.parent_category,*product_category_image"
            )

            if (!product_categories || product_categories.length === 0) {
                throw createError({ statusCode: 404, statusMessage: "No product categories found" })
            }

            setHeader(event, "Cache-Control", "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400")

            return product_categories
        } catch (error: unknown) {
            setHeader(event, "Cache-Control", "no-store")
            throw toUpstreamError(error, "Failed to fetch categories")
        }
    },
    {
        name: "product-categories-cache",
        maxAge: 3600,
        swr: true,
        getKey: () => "product-categories-v2"
    }
)
