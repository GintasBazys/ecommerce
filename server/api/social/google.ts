import { assertMedusaResponse, fetchMedusaResponse, safeJson, toUpstreamError } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    try {
        const backendResponse = await fetchMedusaResponse(event, "/auth/customer/google", {
            method: "POST",
            body: JSON.stringify(await readBody(event))
        })

        await assertMedusaResponse(backendResponse, "Authentication failed")
        const payload = await safeJson<{ success?: boolean; location?: string | null }>(backendResponse)

        if (payload === null) {
            throw createError({ statusCode: 502, statusMessage: "Invalid Medusa response" })
        }

        return payload
    } catch (error: unknown) {
        throw toUpstreamError(error, "Social login failed")
    }
})
