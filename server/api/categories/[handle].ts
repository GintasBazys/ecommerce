import type { ProductCategoryDTO } from "@medusajs/types"

export default defineCachedEventHandler(
    async (event) => {
        const config = useRuntimeConfig()
        const handle = event.context.params?.handle

        if (!handle) {
            throw createError({ statusCode: 400, statusMessage: "Category handle is required" })
        }

        const { product_categories } = await $fetch<{ product_categories: ProductCategoryDTO[] }>(
            `${config.public.MEDUSA_URL}/store/product-categories`,
            {
                method: "GET",
                headers: {
                    "x-publishable-api-key": config.public.PUBLISHABLE_KEY
                },
                params: { handle }
            }
        )

        const category = product_categories?.[0]
        if (!category) {
            throw createError({ statusCode: 404, statusMessage: "No category found for the specified handle" })
        }

        setHeader(event, "Cache-Control", "public, max-age=300, s-maxage=1800, stale-while-revalidate=86400")

        return category
    },
    {
        name: "product-category-by-handle",
        maxAge: 1800,
        swr: true,
        getKey: (event) => {
            const h = event.context.params?.handle ?? ""
            return `product-category:${h}`
        }
    }
)
