import { defineEventHandler, deleteCookie } from "h3"

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    try {
        const response = await fetch(`${config.public.MEDUSA_URL}/auth/session`, {
            method: "DELETE",
            credentials: "include"
        })

        if (!response.ok) {
            console.error("Failed to invalidate session on Medusa server:", await response.text())
            throw new Error("Failed to invalidate session")
        }

        deleteCookie(event, "connect.sid")

        event.node.res.statusCode = 200
        return { message: "Logged out successfully", redirectUrl: "/" }
    } catch (error) {
        console.error("Logout error in /api/logout handler:", error)
        event.node.res.statusCode = 500
        return { message: "Failed to log out due to server error" }
    }
})
