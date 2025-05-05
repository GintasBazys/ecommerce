export default defineCachedEventHandler(
    async () => {
        const config = useRuntimeConfig()

        try {
            const response = await fetch(`${config.public.MEDUSA_URL}/store/product-categories`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                    "Content-Type": "application/json"
                }
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch product categories: ${response.statusText}`)
            }

            const data = await response.json()
            const productCategories = data.product_categories

            if (!productCategories) {
                throw new Error("No product categories found")
            }

            return productCategories
        } catch (error) {
            console.error("Error fetching product categories:", error)
            return { error: "Failed to fetch product categories" }
        }
    },
    { maxAge: 60 * 60 }
)
