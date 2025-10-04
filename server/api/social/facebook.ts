import { defineEventHandler, getHeader, readBody } from "h3"

import { useRuntimeConfig } from "#imports"

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    try {
        const cookie = getHeader(event, "cookie") || ""
        const body = await readBody(event).catch(() => ({}))

        return await $fetch(`${config.public.MEDUSA_URL}/auth/customer/facebook`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                cookie
            },
            body
        })
    } catch (error) {
        console.error("Error in API proxy:", error)
        return {
            success: false,
            message: "Server error occurred"
        }
    }
})
