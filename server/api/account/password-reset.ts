import { fetchMedusaResponse } from "#server/utils/medusa-proxy"

const PASSWORD_RESET_RESPONSE = {
    statusCode: 200,
    message: "If an account exists with the specified email, it will receive instructions to reset the password."
}

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email } = body

    if (!email) {
        event.node.res.statusCode = 400
        return {
            message: "Email is required"
        }
    }

    try {
        const response = await fetchMedusaResponse(
            event,
            "/auth/customer/emailpass/reset-password",
            {
                method: "POST",
                includePublishableKey: false,
                body: JSON.stringify({
                    identifier: email
                })
            }
        )

        if (!response.ok) {
            console.error("Password reset request was not accepted by Medusa", { status: response.status })
            return PASSWORD_RESET_RESPONSE
        }

        return PASSWORD_RESET_RESPONSE
    } catch (error) {
        console.error("Server error during password reset:", error)
        return PASSWORD_RESET_RESPONSE
    }
})
