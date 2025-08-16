export default defineEventHandler(async (event) => {
    const { id } = event.context.params!
    const config = useRuntimeConfig()
    const headers = {
        "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
        "Content-Type": "application/json"
    }

    return $fetch(`${config.public.MEDUSA_URL}/store/orders/${encodeURIComponent(id)}`, {
        method: "GET",
        headers
    })
})
