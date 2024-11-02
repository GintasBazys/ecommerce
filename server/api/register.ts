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

        if (!authResponse.ok) throw new Error("Failed to register: Authentication error")

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

        if (!customerResponse.ok) throw new Error("Failed to create customer")

        const { customer } = await customerResponse.json()
        event.node.res.statusCode = 200
        return { customer }
    } catch {
        event.node.res.statusCode = 401
        return { message: "Registration failed" }
    }
})
