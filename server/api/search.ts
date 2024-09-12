import { readBody, createError } from "h3"

export default eventHandler(async (event) => {
    const body = await readBody(event)
    const searchValue = body.q

    if (!searchValue) {
        throw createError({ statusCode: 400, message: "Search query is required" })
    }

    try {
        const config = useRuntimeConfig()
        const response = await $fetch(`${config.public.MEDUSA_URL}/store/products/search`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: {
                q: searchValue
            }
        })
        return response
    } catch (error) {
        console.error("Error fetching search results:", error)
        throw createError({ statusCode: 500, message: "Failed to fetch search results" })
    }
})
