import { serverMedusaClient } from "#medusa/server"

export default eventHandler(async (event) => {
    const client = serverMedusaClient(event)
    const handle = event.context.params?.handle ?? ""
    return await client.collections.list({ handle: [handle] }).then(({ collections }) => collections[0])
})
