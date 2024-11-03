import { defineEventHandler, readBody } from "h3"

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email, password, first_name, last_name } = body

    const config = useRuntimeConfig()

    if (!email || !password || !first_name || !last_name) {
        event.node.res.statusCode = 400
        return { message: "Email, password, first name, and last name are required" }
    }

    try {
        const authResponse = await fetch(`${config.public.MEDUSA_URL}/auth/customer/emailpass/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password })
        })

        if (!authResponse.ok) {
            console.error("Authentication failed:", await authResponse.text())
            throw new Error("Failed to register: Authentication error")
        }

        const { token } = await authResponse.json()

        const customerResponse = await fetch(`${config.public.MEDUSA_URL}/store/customers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY
            },
            credentials: "include",
            body: JSON.stringify({
                first_name,
                last_name,
                email
            })
        })

        if (!customerResponse.ok) {
            console.error("Customer creation failed:", await customerResponse.text())
            throw new Error("Failed to create customer")
        }

        event.node.res.setHeader("Set-Cookie", [`jwtToken=${token}; HttpOnly; Secure; SameSite=Lax; Path=/`])

        const { customer } = await customerResponse.json()
        event.node.res.statusCode = 200
        return { customer, token }
    } catch (error) {
        console.error("Registration error:", error)
        event.node.res.statusCode = 401
        return { message: "Registration failed" }
    }
})
