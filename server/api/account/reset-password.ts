import { assertMedusaResponse, fetchMedusaResponse, safeJson, toUpstreamError } from "#server/utils/medusa-proxy"

type ResetPasswordBody = {
    token?: string
    email?: string
    password?: string
}

type ResetPasswordResponse = {
    success?: boolean
    message?: string
}

export default defineEventHandler(async (event) => {
    const body = await readBody<ResetPasswordBody>(event)
    const { token, email, password } = body

    if (!token || !email || !password) {
        throw createError({ statusCode: 400, statusMessage: "Token, email, and password are required" })
    }

    try {
        const response = await fetchMedusaResponse(event, "/auth/customer/emailpass/update", {
            method: "POST",
            includePublishableKey: false,
            body: JSON.stringify({ email, password, token })
        })

        await assertMedusaResponse(response, "Failed to reset password")
        const result = await safeJson<ResetPasswordResponse>(response)

        return { success: result?.success ?? true, message: result?.message || "Password reset successful" }
    } catch (error: unknown) {
        throw toUpstreamError(error, "Error resetting password")
    }
})
