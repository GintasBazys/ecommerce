import type { RegionCountryDTO, RegionDTO } from "@medusajs/types"
import { defineStore } from "pinia"
import { ref } from "vue"

export const useRegionStore = defineStore("regionStore", () => {
    const regionStoreId = ref<string | null>(null)
    const regionCountries = ref<RegionCountryDTO[]>([])
    const runtimeConfig = useRuntimeConfig()

    const fetchRegion = async () => {
        try {
            const data = await $fetch<{ regions: RegionDTO[] }>("/store/regions", {
                baseURL: runtimeConfig.public.MEDUSA_URL,
                headers: {
                    "x-publishable-api-key": runtimeConfig.public.PUBLISHABLE_KEY,
                    "Content-Type": "application/json"
                }
            })

            const firstRegionId = data.regions?.[0]?.id
            regionCountries.value = data.regions?.[0].countries
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
        regionCountries,
        fetchRegion
    }
})
