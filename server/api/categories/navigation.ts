import type { ProductCategoryDTO } from "@medusajs/types"

import { fetchMedusaJson, toUpstreamError } from "#server/utils/medusa-proxy"

type NavigationCategory = {
    id: string
    handle: string
    name: string
}

export default defineEventHandler(async (event) => {
    try {
        const { product_categories } = await fetchMedusaJson<{ product_categories: ProductCategoryDTO[] }>(
            event,
            "/store/product-categories?fields=id,name,handle"
        )

        setHeader(event, "Cache-Control", "no-store")

        return (product_categories || []).map<NavigationCategory>((category) => ({
            id: category.id,
            handle: category.handle || "",
            name: category.name || ""
        }))
    } catch (error: unknown) {
        setHeader(event, "Cache-Control", "no-store")
        throw toUpstreamError(error, "Failed to fetch navigation categories")
    }
})
