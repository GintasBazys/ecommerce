import { assertMedusaResponse, fetchMedusaResponse, toUpstreamError } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    try {
        const response = await fetchMedusaResponse(event, "/auth/session", {
            method: "DELETE"
        })

        await assertMedusaResponse(response, "Logout failed")

        event.node.res.setHeader("Set-Cookie", [`connect.sid=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`])

        return {
            success: true,
            message: "Logout successful"
        }
    } catch (error: unknown) {
        throw toUpstreamError(error, "Error during logout")
    }
})
