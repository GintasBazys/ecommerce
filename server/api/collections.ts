import { serverMedusaClient } from "#medusa/server"

export default defineCachedEventHandler(
    async (event) => {
        try {
            const client = serverMedusaClient(event)
            const { product_categories } = await client.productCategories.list()

            return { product_categories }
        } catch (error) {
            console.error("Error fetching collections:", error)
            return { error: "Failed to fetch collections" }
        }
    },
    { maxAge: 60 * 60 }
)
