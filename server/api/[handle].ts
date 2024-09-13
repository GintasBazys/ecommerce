import { serverMedusaClient } from "#medusa/server"

export default eventHandler(async (event) => {
    try {
        const client = serverMedusaClient(event)
        const handle = event.context.params?.handle ?? ""
        const collection = await client.collections.list({ handle: [handle] }).then(({ collections }) => collections[0])
        if (!collection) {
            return { error: "No collection found for event" }
        }

        return collection
    } catch {
        return { error: "No collection found for event" }
    }
})
