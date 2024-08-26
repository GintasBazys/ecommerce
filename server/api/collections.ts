import { serverMedusaClient } from "#medusa/server"

export default eventHandler(async (event) => {
    try {
        const client = serverMedusaClient(event)
        const { collections } = await client.collections.list()

        return { collections }
    } catch (error) {
        console.error("Error fetching collections:", error)
        return { error: "Failed to fetch collections" }
    }
})
