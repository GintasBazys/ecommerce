import { defineEventHandler, deleteCookie } from "h3"

export default defineEventHandler(async (event) => {
    try {
        deleteCookie(event, "connect.sid")
        event.node.res.statusCode = 200
        return { message: "Logged out successfully", redirectUrl: "/" }
    } catch (error) {
        console.error("Logout error in /api/logout handler:", error)
        event.node.res.statusCode = 500
        return { message: "Failed to log out due to server error" }
    }
})
