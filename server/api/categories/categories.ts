import type { ProductCategoryDTO } from "@medusajs/types"

export default defineEventHandler(async () => {
    const config = useRuntimeConfig()
    try {
        const { product_categories: productCategories } = await $fetch<{ product_categories: ProductCategoryDTO[] }>(
            `${config.public.MEDUSA_URL}/store/product-categories`,
            {
                credentials: "include",
                headers: {
                    "x-publishable-api-key": config.public.PUBLISHABLE_KEY
                }
            }
        )

        if (!productCategories) {
            throw new Error("No product categories found")
        }

        return productCategories
    } catch (error) {
        console.error("Error fetching product categories:", error)
        return { error: "Failed to fetch product categories" }
    }
})
