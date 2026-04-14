import type { RegionDTO } from "@medusajs/types"

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000)

    try {
        const payload = await $fetch<{ regions: RegionDTO[] }>("/store/regions", {
            baseURL: config.medusaUrl,
            headers: {
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                "Content-Type": "application/json"
            },
            signal: controller.signal
        })

        setHeader(event, "Cache-Control", "no-store")
        return payload
    } finally {
        clearTimeout(timer)
    }
})
