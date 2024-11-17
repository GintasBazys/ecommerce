import { defineEventHandler, readBody } from "h3"
import { useRuntimeConfig } from "#imports"

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    try {
        const body = await readBody(event)

        const forwardedHeaders = {
            "Content-Type": "application/json",
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
            cookie: event.node.req.headers.cookie || ""
        }

        const authResponse = await fetch(`${config.public.MEDUSA_URL}/auth/customer/emailpass`, {
            method: "POST",
            headers: forwardedHeaders,
            body: JSON.stringify(body),
            credentials: "include"
        })

        if (!authResponse.ok) {
            throw new Error("Invalid credentials")
        }

        const { token } = await authResponse.json()

        const sessionResponse = await fetch(`${config.public.MEDUSA_URL}/auth/session`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                cookie: event.node.req.headers.cookie || "",
                Authorization: `Bearer ${token}`
            },
            credentials: "include"
        })

        if (!sessionResponse.ok) {
            throw new Error("Failed to set session")
        }

        const customerResponse = await fetch(`${config.public.MEDUSA_URL}/store/customers/me`, {
            headers: forwardedHeaders,
            credentials: "include"
        })

        if (!customerResponse.ok) {
            throw new Error("Failed to fetch customer details")
        }

        const { customer } = await customerResponse.json()

        return {
            success: true,
            customer
        }
    } catch (error) {
        console.error("Error in login API:", error)
        event.node.res.statusCode = 401
        return {
            success: false,
            message: "Login failed"
        }
    }
})
