import { serverMedusaClient } from "#medusa/server"

export default defineCachedEventHandler(
    async (event) => {
        try {
            const client = serverMedusaClient(event)
            const query = getQuery(event)

            const limit = query.limit !== undefined && query.limit !== null ? String(query.limit) : "2"
            const offset = query.offset !== undefined && query.offset !== null ? String(query.offset) : "0"

            const {
                products,
                count,
                limit: productLimit,
                offset: productOffset
            } = await client.products.list({ limit: parseInt(limit), offset: parseInt(offset) })

            return { products, count, productLimit, productOffset }
        } catch (error) {
            console.error("Error fetching products:", error)
            return { error: "Failed to fetch products" }
        }
    },
    { maxAge: 60 * 60 }
)
