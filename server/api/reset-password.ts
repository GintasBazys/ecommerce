import { defineEventHandler, readBody } from "h3"
import { useRuntimeConfig } from "#imports"

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { token, email, password } = body
    const config = useRuntimeConfig()

    if (!token || !email || !password) {
        event.node.res.statusCode = 400
        return { success: false, message: "Token, email, and password are required" }
    }

    try {
        const response = await fetch(`${config.public.MEDUSA_URL}/auth/customer/emailpass/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, token })
        })

        if (!response.ok) throw new Error("Failed to reset password")

        const result = await response.json()

        event.node.res.statusCode = 200
        return { success: result.success, message: result.message || "Password reset successful" }
    } catch {
        event.node.res.statusCode = 500
        return { success: false, message: "Error resetting password" }
    }
})
