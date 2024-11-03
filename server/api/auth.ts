import { defineEventHandler } from "h3"
import { useRuntimeConfig } from "#imports"

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    const cookies = parseCookies(event)
    const token = cookies.jwtToken

    try {
        const response = await fetch(`${config.public.MEDUSA_URL}/store/customers/me`, {
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                Authorization: `Bearer ${token}`
            }
        })

        const data = await response.json()
        return {
            success: true,
            customer: data.customer
        }
    } catch (error) {
        console.error("Error fetching customer data:", error)

        event.node.res.statusCode = 500
        return {
            success: false,
            message: "Error fetching customer data"
        }
    }
})
