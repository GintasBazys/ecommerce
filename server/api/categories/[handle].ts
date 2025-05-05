export default eventHandler(async (event) => {
    const config = useRuntimeConfig()
    const handle = event.context.params?.handle || ""

    try {
        const response = await fetch(`${config.public.MEDUSA_URL}/store/product-categories?handle=${handle}`, {
            method: "GET",
            headers: {
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                "Content-Type": "application/json"
            }
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch product category: ${response.statusText}`)
        }

        const data = await response.json()
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
