import { defineEventHandler, readBody } from "h3"

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email } = body

    const config = useRuntimeConfig()

    if (!email) {
        event.node.res.statusCode = 400
        return {
            message: "Email is required"
        }
    }

    try {
        const response = await fetch(`${config.public.MEDUSA_URL}/auth/customer/emailpass/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                identifier: email
            })
        })

        if (!response.ok) {
            const errorResponse = await response.json()
            console.error("Error from Medusa:", errorResponse)
            event.node.res.statusCode = response.status
            return { message: errorResponse.message || "Failed to send password reset email" }
        }

        return {
            statusCode: 200,
            message: "If an account exists with the specified email, it will receive instructions to reset the password."
        }
    } catch (error) {
        console.error("Server error during password reset:", error)
        event.node.res.statusCode = 500
        return {
            message: "An error occurred",
            error: error instanceof Error ? error.message : "Unknown error"
        }
    }
})
