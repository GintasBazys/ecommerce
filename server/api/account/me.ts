export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const cookie = getHeader(event, "cookie") ?? ""

    try {
        const res = await fetch(`${config.public.MEDUSA_URL}/store/customers/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                cookie
            }
        })

        if (res.status === 401) {
            return { success: true, customer: null }
        }

        if (!res.ok) {
            return { success: false, customer: null }
        }

        const data = await res.json()
        return { success: true, customer: data.customer ?? null }
    } catch (err: any) {
        console.error("Medusa unreachable in /account/me:", err?.cause?.code || err)

        return {
            success: false,
            customer: null,
            unavailable: true
        }
    }
})
