import { useRuntimeConfig } from "#app"

export const useRegionStore = defineStore("regionStore", () => {
    const regionStoreId = ref(null)
    const runtimeConfig = useRuntimeConfig()

    const fetchRegion = async () => {
        try {
            const response = await fetch(`${runtimeConfig.public.MEDUSA_URL}/store/regions`, {
                method: "GET",
                headers: {
                    "x-publishable-api-key": runtimeConfig.public.PUBLISHABLE_KEY,
                    "Content-Type": "application/json"
                }
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch regions: ${response.statusText}`)
            }

            const data = await response.json()
            const firstRegionId = data?.regions?.[0]?.id

            if (!firstRegionId) {
                throw new Error("No valid region ID found")
            }

            regionStoreId.value = firstRegionId
        } catch (error) {
            console.error("Failed to fetch region:", error)
        }
    }

    return {
        regionStoreId,
        fetchRegion
    }
})
