export default eventHandler(async (event) => {
    const { q } = await readBody(event)
    const query = getQuery(event)

    const regionId = String(query.region_id)

    if (!q) {
        throw createError({ statusCode: 400, message: "Search query is required" })
    }

    try {
        const config = useRuntimeConfig()
        const queryParams = new URLSearchParams({
            fields: `*variants.calculated_price,*variants.inventory_quantity`,
            region_id: regionId,
            q
        })

        const response = await $fetch(`${config.public.MEDUSA_URL}/store/products?${queryParams.toString()}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY
            }
        })

        return response
    } catch {
        throw createError({ statusCode: 500, message: "Failed to fetch search results" })
    }
})
