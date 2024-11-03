import { defineEventHandler, readBody } from "h3"

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email, password } = body

    const config = useRuntimeConfig()

    if (!email || !password) {
        event.node.res.statusCode = 400
        return { message: "Email and password are required" }
    }

    try {
        const authResponse = await fetch(`${config.public.MEDUSA_URL}/auth/customer/emailpass`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })

        if (!authResponse.ok) throw new Error("Failed to login: Authentication error")

        const { token } = await authResponse.json()

        const customerResponse = await fetch(`${config.public.MEDUSA_URL}/store/customers/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY
            },
            credentials: "include"
        })

        if (!customerResponse.ok) throw new Error("Failed to fetch customer profile")

        const { customer } = await customerResponse.json()

        event.node.res.setHeader("Set-Cookie", [`connect.sid=${token}; HttpOnly; Secure; SameSite=Lax; Path=/`])

        event.node.res.statusCode = 200
        return { customer }
    } catch {
        event.node.res.statusCode = 401
        return { message: "Login failed" }
    }
})
