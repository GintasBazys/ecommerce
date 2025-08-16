import { defineEventHandler, readBody } from "h3"

import { useRuntimeConfig } from "#imports"

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    try {
        const backendResponse = await fetch(`${config.public.MEDUSA_URL}/auth/customer/google`, {
            credentials: "include",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                cookie: event.node.req.headers.cookie || ""
            },
            body: JSON.stringify(await readBody(event))
        })

        if (!backendResponse.ok) {
            return {
                success: false,
                message: "Authentication failed"
            }
        }

        const result = await backendResponse.json()

        return result
    } catch (error) {
        console.error("Error in API proxy:", error)
        return {
            success: false,
            message: "Server error occurred"
        }
    }
})
