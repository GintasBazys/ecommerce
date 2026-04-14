import type { ProductCategoryDTO } from "@medusajs/types"

import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    try {
        const { product_categories } = await fetchMedusaJson<{ product_categories: ProductCategoryDTO[] }>(
            event,
            "/store/product-categories?fields=*category_children,*products,*parent_category,*parent_category.parent_category,*product_category_image"
        )

        if (!product_categories || product_categories.length === 0) {
            throw createError({ statusCode: 404, statusMessage: "No product categories found" })
        }

        setHeader(event, "Cache-Control", "no-store")

        return product_categories
    } catch (error: unknown) {
        setHeader(event, "Cache-Control", "no-store")
        throw toUpstreamError(error, "Failed to fetch categories")
    }
})
