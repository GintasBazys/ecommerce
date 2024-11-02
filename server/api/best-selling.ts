export default defineCachedEventHandler(
    async () => {
        const config = useRuntimeConfig()

        try {
            const response = await fetch(`${config.public.MEDUSA_URL}/store/best-selling`, {
                method: "GET",
                headers: {
                    "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                    "Content-Type": "application/json"
                }
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.statusText}`)
            }

            const data = await response.json()
            const { products } = data
            return products
        } catch (error) {
            console.error("Error fetching products:", error)
            return { error: "Failed to fetch products" }
        }
    },
    { maxAge: 60 * 60 }
)
