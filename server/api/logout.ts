import { serverMedusaClient } from "#medusa/server"
export default eventHandler(async (event) => {
    const client = serverMedusaClient(event)
    await client.auth.deleteSession({
        Cookie: event.node.req.headers.cookie
    })
    return { redirectUrl: "/" }
})
