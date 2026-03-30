import type { RegionCountryDTO, RegionDTO } from "@medusajs/types"

export const useRegionStore = defineStore("regionStore", () => {
    const cookieOptions = {
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30
    }

    const regionIdCookie = useCookie<string | null>("region_id", cookieOptions)
    const countryCodeCookie = useCookie<string | null>("country_code", cookieOptions)

    const regionStoreId = ref<string | null>(regionIdCookie.value)
    const selectedCountryCode = ref<string | null>(countryCodeCookie.value)
    const regions = ref<RegionDTO[]>([])

    const selectedRegion = computed<RegionDTO | null>(
        () => regions.value.find((region) => region.id === regionStoreId.value) ?? regions.value[0] ?? null
    )
    const regionCountries = computed<RegionCountryDTO[]>(() => selectedRegion.value?.countries ?? [])
    const availableCountries = computed<RegionCountryDTO[]>(() => {
        const countriesByIso2 = new Map<string, RegionCountryDTO>()

        for (const region of regions.value) {
            for (const country of region.countries ?? []) {
                if (!countriesByIso2.has(country.iso_2)) {
                    countriesByIso2.set(country.iso_2, country)
                }
            }
        }

        return [...countriesByIso2.values()]
    })

    function applyRegionSelection(region: RegionDTO, countryCode?: string | null) {
        const nextCountryCode =
            region.countries?.find((country) => country.iso_2 === countryCode)?.iso_2 ?? region.countries?.[0]?.iso_2 ?? null

        regionStoreId.value = region.id ?? null
        selectedCountryCode.value = nextCountryCode
        regionIdCookie.value = region.id ?? null
        countryCodeCookie.value = nextCountryCode
    }

    function setRegion(regionId: string) {
        const nextRegion = regions.value.find((region) => region.id === regionId)

        if (!nextRegion) {
            return
        }

        applyRegionSelection(nextRegion)
    }

    function setCountry(countryCode: string) {
        const normalizedCountryCode = countryCode.toLowerCase()
        const nextRegion = regions.value.find((region) => region.countries?.some((country) => country.iso_2 === normalizedCountryCode))

        if (!nextRegion) {
            return
        }

        applyRegionSelection(nextRegion, normalizedCountryCode)
    }

    const fetchRegion = async () => {
        try {
            const requestFetch = useRequestFetch()
            const data = await requestFetch<{ regions: RegionDTO[] }>("/api/regions")

            regions.value = data.regions ?? []

            const nextRegion = regions.value.find((region) => region.id === regionIdCookie.value) ?? regions.value[0]
            if (!nextRegion?.id) {
                console.error("No valid region ID found")
                return
            }

            applyRegionSelection(nextRegion, countryCodeCookie.value)
        } catch (error) {
            console.error("Failed to fetch region:", error)
        }
    }

    return { regionStoreId, selectedCountryCode, regions, regionCountries, availableCountries, fetchRegion, setRegion, setCountry }
})
