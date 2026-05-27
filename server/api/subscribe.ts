import { sendError } from "h3"

import type { H3Event } from "h3"

type MailchimpMemberResponse = Record<string, unknown>

type MailchimpErrorResponse = {
    title?: string
}

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

        if (!apiKey || !audienceId) {
            return sendError(event, createError({ statusCode: 500, statusMessage: "Subscription service is not configured." }))
        }

        const dc = apiKey.split("-")[1]

        if (!dc) {
            return sendError(event, createError({ statusCode: 500, statusMessage: "Subscription service is not configured." }))
        }

        const url = `https://${dc}.api.mailchimp.com/3.0/lists/${audienceId}/members`

        const payload = {
            email_address: email,
            status: "subscribed",
            merge_fields: {
                ADDRESS: ""
            }
        }

        const response = await $fetch.raw<MailchimpMemberResponse | MailchimpErrorResponse>(url, {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(`string:${apiKey}`).toString("base64")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            ignoreResponseError: true
        })

        if (response.status < 200 || response.status >= 300) {
            const errorDetail = response._data as MailchimpErrorResponse | undefined
            console.error("Mailchimp subscription failed", { status: response.status, title: errorDetail?.title })
            return sendError(event, createError({ statusCode: 400, statusMessage: "Could not complete this subscription." }))
        }

        return {
            success: true,
            message: "Subscription successful!",
            data: response._data
        }
    } catch (error) {
        console.error("Subscription failed", error)
        return sendError(event, createError({ statusCode: 400, statusMessage: "Could not complete this subscription." }))
    }
})
