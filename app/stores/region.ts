import type { RegionCountryDTO, RegionDTO } from "@medusajs/types"

export const useRegionStore = defineStore("regionStore", () => {
    const regionStoreId = ref<string | null>(null)
    const regionCountries = ref<RegionCountryDTO[]>([])

    const fetchRegion = async () => {
        try {
            const requestFetch = useRequestFetch()
            const data = await requestFetch<{ regions: RegionDTO[] }>("/api/regions")

            const first = data.regions?.[0]
            if (!first?.id) {
                console.error("No valid region ID found")
                return
            }

            regionStoreId.value = first.id
            regionCountries.value = first.countries ?? []
        } catch (error) {
            console.error("Failed to fetch region:", error)
        }
    }

    return { regionStoreId, regionCountries, fetchRegion }
})
