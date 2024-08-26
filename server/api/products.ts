import { serverMedusaClient } from "#medusa/server"

export default eventHandler(async (event) => {
    try {
        const client = serverMedusaClient(event)
        const { products } = await client.products.list()

        return { products }
    } catch (error) {
        console.error("Error fetching products:", error)
        return { error: "Failed to fetch products" }
    }
})
