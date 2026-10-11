import type { RegionCountryDTO, RegionDTO } from "@medusajs/types"
import { REGION_ERROR_MESSAGE } from "~/utils/region"

export type RegionStatus = "idle" | "loading" | "ready" | "error"

export type RegionFetchResult =
    | { success: true }
    | { success: false }

type RegionsResponse = {
    regions?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}

function getValidatedRegions(payload: unknown): RegionDTO[] {
    if (!isRecord(payload) || !Array.isArray(payload.regions)) {
        return []
    }

    const regionIds = new Set<string>()

    return payload.regions.flatMap((regionValue) => {
        if (!isRecord(regionValue)) {
            return []
        }

        const id = typeof regionValue.id === "string" ? regionValue.id.trim() : ""
        if (!id || id.length > 255 || regionIds.has(id) || !Array.isArray(regionValue.countries)) {
            return []
        }

        const countryCodes = new Set<string>()
        const countries = regionValue.countries.flatMap((countryValue) => {
            if (!isRecord(countryValue) || typeof countryValue.iso_2 !== "string") {
                return []
            }

            const iso2 = countryValue.iso_2.toLowerCase()
            if (!/^[a-z]{2}$/.test(iso2) || countryCodes.has(iso2)) {
                return []
            }

            countryCodes.add(iso2)
            return [{ ...countryValue, iso_2: iso2 } as RegionCountryDTO]
        })

        if (!countries.length) {
            return []
        }

        regionIds.add(id)
        return [{ ...regionValue, id, countries } as RegionDTO]
    })
}

export const useRegionStore = defineStore("regionStore", () => {
    const cookieOptions = {
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30
    }

    const regionIdCookie = useCookie<string | null>("region_id", cookieOptions)
    const countryCodeCookie = useCookie<string | null>("country_code", cookieOptions)

    const regionStoreId = ref<string | null>(null)
    const selectedCountryCode = ref<string | null>(null)
    const regions = ref<RegionDTO[]>([])
    const status = ref<RegionStatus>("idle")
    const errorMessage = ref<string | null>(null)
    let inFlightRequest: Promise<RegionFetchResult> | null = null

    const selectedRegion = computed<RegionDTO | null>(
        () => regions.value.find((region) => region.id === regionStoreId.value) ?? null
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

    async function requestRegions(): Promise<RegionFetchResult> {
        const hadReadyState = status.value === "ready" && Boolean(selectedRegion.value && selectedCountryCode.value)
        status.value = "loading"
        errorMessage.value = null

        try {
            const requestFetch = useRequestFetch()
            const data = await requestFetch<RegionsResponse>("/api/regions")
            const nextRegions = getValidatedRegions(data)
            const nextRegion = nextRegions.find((region) => region.id === regionIdCookie.value) ?? nextRegions[0]

            if (!nextRegion?.id || !nextRegion.countries?.length) {
                throw new Error("Invalid regional response")
            }

            const nextCountryCode =
                nextRegion.countries.find((country) => country.iso_2 === countryCodeCookie.value?.toLowerCase())?.iso_2 ??
                nextRegion.countries[0]?.iso_2 ??
                null

            if (!nextCountryCode) {
                throw new Error("Invalid regional response")
            }

            regions.value = nextRegions
            regionStoreId.value = nextRegion.id
            selectedCountryCode.value = nextCountryCode
            regionIdCookie.value = nextRegion.id
            countryCodeCookie.value = nextCountryCode
            status.value = "ready"

            return { success: true }
        } catch {
            errorMessage.value = REGION_ERROR_MESSAGE
            status.value = hadReadyState ? "ready" : "error"

            return { success: false }
        }
    }

    function fetchRegion(): Promise<RegionFetchResult> {
        if (inFlightRequest) {
            return inFlightRequest
        }

        inFlightRequest = requestRegions().finally(() => {
            inFlightRequest = null
        })

        return inFlightRequest
    }

    return {
        regionStoreId,
        selectedCountryCode,
        regions,
        status,
        errorMessage,
        regionCountries,
        availableCountries,
        fetchRegion,
        setRegion,
        setCountry
    }
})
