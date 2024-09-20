import { serverMedusaClient } from "#medusa/server"
import { defineEventHandler, readBody } from "h3"

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const { email, password, first_name, last_name } = body

    if (!email || !password) {
        event.node.res.statusCode = 400
        return {
            message: "Email and password are required"
        }
    }

    const medusa = serverMedusaClient(event)
    try {
        const response = await medusa.customers.create({
            first_name,
            last_name,
            email,
            password
        })

        const headers = response.response.headers
        for (const [key, value] of Object.entries(headers)) {
            event.node.res.setHeader(key, value)
        }

        event.node.res.statusCode = 200
        return {
            customer: response.customer
        }
    } catch {
        event.node.res.statusCode = 401
        return {
            message: "Invalid email or password"
        }
    }
})
