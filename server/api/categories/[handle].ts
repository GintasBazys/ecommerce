import type { ProductCategoryDTO } from "@medusajs/types"

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const handle = event.context.params?.handle ?? ""

    try {
        const data = await $fetch<{ product_categories: ProductCategoryDTO[] }>(`${config.public.MEDUSA_URL}/store/product-categories`, {
            method: "GET",
            headers: {
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY
            },
            params: { handle }
        })

        const category = data.product_categories?.[0]
        if (!category) {
            return { error: "No category found for the specified handle" }
        }

        return category
    } catch (error) {
        console.error("Error fetching category:", error)
        return { error: "Failed to fetch category" }
    }
})
