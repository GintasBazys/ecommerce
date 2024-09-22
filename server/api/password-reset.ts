import { serverMedusaClient } from "#medusa/server"
import { defineEventHandler, readBody } from "h3"

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const { email } = body

    if (!email) {
        event.node.res.statusCode = 400
        return {
            message: "Email is required"
        }
    }

    const medusa = serverMedusaClient(event)

    try {
        const existsResponse = await medusa.auth.exists(email)

        if (!existsResponse.exists) {
            event.node.res.statusCode = 404
            return {
                message: "Customer with this email does not exist"
            }
        }

        await medusa.customers.generatePasswordToken({
            email
        })

        return {
            statusCode: 200,
            message: "Password reset email sent"
        }
    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : "Unknown error"

        event.node.res.statusCode = 500
        return {
            message: "An error occurred",
            error: errMessage
        }
    }
})
