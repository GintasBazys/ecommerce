import type { ProductCategoryDTO } from "@medusajs/types"

import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"

export default defineCachedEventHandler(
    async (event) => {
        const handle = event.context.params?.handle

        if (!handle) {
            throw createError({
                statusCode: 400,
                statusMessage: "Category handle is required"
            })
        }

        try {
            const data = await fetchMedusaJson<{ product_categories: ProductCategoryDTO[] }>(
                event,
                `/store/product-categories?handle=${encodeURIComponent(handle)}&fields=*category_children,*products,*product_category_image`
            )

            const category = data.product_categories?.[0]

            if (!category) {
                throw createError({
                    statusCode: 404,
                    statusMessage: "No category found for the specified handle"
                })
            }

            setHeader(event, "Cache-Control", "public, max-age=300, s-maxage=1800, stale-while-revalidate=86400")

            return category
        } catch (error: unknown) {
            setHeader(event, "Cache-Control", "no-store")
            throw toUpstreamError(error, "Failed to fetch category")
        }
    },
    {
        name: "product-category-by-handle",
        maxAge: 1800,
        swr: true,
        getKey: (event) => {
            const h = event.context.params?.handle ?? ""
            return `product-category-v2:${h}`
        }
    }
)
