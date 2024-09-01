import { serverMedusaClient } from "#medusa/server"

export default eventHandler(async (event) => {
    const client = serverMedusaClient(event)
    const handle = event.context.params?.handle ?? ""
    return await client.productCategories.list({ handle: handle }).then(({ product_categories }) => product_categories[0])
})
