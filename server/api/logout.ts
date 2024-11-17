import { defineEventHandler } from "h3"

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    try {
        const forwardedHeaders = {
            "Content-Type": "application/json",
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
            cookie: event.node.req.headers.cookie || ""
        }
        const response = await fetch(`${config.public.MEDUSA_URL}/auth/session`, {
            method: "DELETE",
            credentials: "include",
            headers: forwardedHeaders
        })

        if (!response.ok) {
            throw new Error(`Logout failed: ${response.statusText}`)
        }

        return {
            success: true,
            message: "Logout successful"
        }
    } catch (error) {
        console.error("Error during logout:", error)

        event.node.res.statusCode = 500
        return {
            success: false,
            message: "Error during logout"
        }
    }
})
