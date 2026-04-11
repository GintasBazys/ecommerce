import { assertMedusaResponse, fetchMedusaResponse, safeJson, toUpstreamError } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event).catch(() => ({}))

        const response = await fetchMedusaResponse(event, "/auth/customer/facebook", {
            method: "POST",
            body: JSON.stringify(body)
        })

        await assertMedusaResponse(response, "Authentication failed")
        const payload = await safeJson<{ success?: boolean; location?: string | null }>(response)

        if (payload === null) {
            throw createError({ statusCode: 502, statusMessage: "Invalid Medusa response" })
        }

        return payload
    } catch (error: unknown) {
        throw toUpstreamError(error, "Social login failed")
    }
})
