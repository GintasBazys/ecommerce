export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    try {
        const headers = {
            "Content-Type": "application/json",
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
            cookie: event.node.req.headers.cookie || ""
        }

        const response = await fetch(`${config.public.MEDUSA_URL}/store/customers/me`, {
            headers: headers,
            credentials: "include"
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
