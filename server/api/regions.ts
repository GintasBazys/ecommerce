import type { RegionDTO } from "@medusajs/types"

export default defineCachedEventHandler(
    async () => {
        const config = useRuntimeConfig()

        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 3000)

        try {
            return await $fetch<{ regions: RegionDTO[] }>("/store/regions", {
                baseURL: config.medusaUrl,
                headers: {
                    "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                    "Content-Type": "application/json"
                },
                signal: controller.signal
            })
        } finally {
            clearTimeout(timer)
        }
    },
    { maxAge: 60 * 60, swr: true, getKey: () => "regions" }
)
