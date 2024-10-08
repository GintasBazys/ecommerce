import type { H3Event } from "h3"
import { sendError } from "h3"

export default defineEventHandler(async (event: H3Event) => {
    try {
        const body = await readBody(event)
        const email = body.email

        if (!email) {
            return sendError(event, createError({ statusCode: 400, statusMessage: "Email is required." }))
        }

        const config = useRuntimeConfig()
        const apiKey = config.secret.mailchimpApiKey
        const audienceId = config.secret.mailchimpAudienceId
        const dc = apiKey.split("-")[1]
        const url = `https://${dc}.api.mailchimp.com/3.0/lists/${audienceId}/members`

        const payload = {
            email_address: email,
            status: "subscribed",
            merge_fields: {
                ADDRESS: ""
            }
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(`string:${apiKey}`).toString("base64")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const errorDetail = await response.json()
            return sendError(event, createError({ statusCode: 400, statusMessage: `Mailchimp error: ${errorDetail.title}` }))
        }

        const result = await response.json()

        return {
            success: true,
            message: "Subscription successful!",
            data: result
        }
    } catch (error) {
        if (error instanceof Error) {
            sendError(event, createError({ statusCode: 400, statusMessage: error.message }))
        }
    }
})
