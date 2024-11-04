import { createError } from "h3"

export default eventHandler(async (event) => {
    const { q } = await readBody(event)

    if (!q) {
        throw createError({ statusCode: 400, message: "Search query is required" })
    }

    try {
        const config = useRuntimeConfig()
        const searchParams = new URLSearchParams({ q })

        const response = await $fetch(`${config.public.MEDUSA_URL}/store/products?${searchParams.toString()}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY
            }
        })

        return response
    } catch (error) {
        console.error("Error fetching search results:", error)
        throw createError({ statusCode: 500, message: "Failed to fetch search results" })
    }
})
