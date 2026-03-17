export default defineEventHandler(async (event) => {
    const { id } = event.context.params!
    const config = useRuntimeConfig()

    return $fetch(`${config.public.MEDUSA_URL}/store/orders/${encodeURIComponent(id ?? "")}`, {
        method: "GET",
        headers: {
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
            "Content-Type": "application/json",
            cookie: getHeader(event, "cookie") ?? ""
        }
    })
})
