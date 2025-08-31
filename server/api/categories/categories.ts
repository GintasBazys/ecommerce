import type { ProductCategoryDTO } from "@medusajs/types"

export default defineCachedEventHandler(
    async (event) => {
        const config = useRuntimeConfig()

        const { product_categories } = await $fetch<{ product_categories: ProductCategoryDTO[] }>(
            `${config.public.MEDUSA_URL}/store/product-categories`,
            {
                credentials: "include",
                headers: {
                    "x-publishable-api-key": config.public.PUBLISHABLE_KEY
                }
            }
        )

        if (!product_categories || product_categories.length === 0) {
            throw createError({ statusCode: 404, statusMessage: "No product categories found" })
        }

        setHeader(event, "Cache-Control", "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400")

        return product_categories
    },
    {
        name: "product-categories-cache",
        maxAge: 3600,
        swr: true,
        getKey: () => "product-categories"
    }
)
