const MAX_REGION_ID_LENGTH = 128
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/
const COUNTRY_CODE = /^[A-Za-z]{2}$/

type UnknownRecord = Record<string, unknown>

export type NormalizedRegion = UnknownRecord & {
    id: string
    countries: Array<UnknownRecord & { iso_2: string }>
}

export type RegionNormalizationResult = {
    regions: NormalizedRegion[]
    malformed: {
        invalidRegions: number
        duplicateRegions: number
        invalidCountries: number
        duplicateCountries: number
    }
}

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeRegionId(value: unknown): string | null {
    if (typeof value !== "string") {
        return null
    }

    const regionId = value.trim()
    if (
        !regionId ||
        regionId.length > MAX_REGION_ID_LENGTH ||
        CONTROL_CHARACTERS.test(regionId) ||
        regionId.toLowerCase() === "null" ||
        regionId.toLowerCase() === "undefined"
    ) {
        return null
    }

    return regionId
}

export function getOptionalRegionId(value: unknown): string | null {
    if (value === undefined) {
        return null
    }

    return getRequiredRegionId(value)
}

export function getRequiredRegionId(value: unknown): string {
    const regionId = Array.isArray(value) ? null : normalizeRegionId(value)

    if (!regionId) {
        throw createError({ statusCode: 400, statusMessage: "Invalid region_id" })
    }

    return regionId
}

export function normalizeRegionsPayload(payload: unknown): RegionNormalizationResult {
    const malformed = {
        invalidRegions: 0,
        duplicateRegions: 0,
        invalidCountries: 0,
        duplicateCountries: 0
    }
    const regions: NormalizedRegion[] = []
    const seenRegionIds = new Set<string>()
    const sourceRegions = isRecord(payload) && Array.isArray(payload.regions) ? payload.regions : []

    for (const sourceRegion of sourceRegions) {
        if (!isRecord(sourceRegion)) {
            malformed.invalidRegions++
            continue
        }

        const id = normalizeRegionId(sourceRegion.id)
        if (!id) {
            malformed.invalidRegions++
            continue
        }

        if (seenRegionIds.has(id)) {
            malformed.duplicateRegions++
            continue
        }

        const countries: NormalizedRegion["countries"] = []
        const seenCountryCodes = new Set<string>()
        const sourceCountries = Array.isArray(sourceRegion.countries) ? sourceRegion.countries : []

        for (const sourceCountry of sourceCountries) {
            if (!isRecord(sourceCountry) || typeof sourceCountry.iso_2 !== "string" || !COUNTRY_CODE.test(sourceCountry.iso_2)) {
                malformed.invalidCountries++
                continue
            }

            const iso2 = sourceCountry.iso_2.toLowerCase()
            if (seenCountryCodes.has(iso2)) {
                malformed.duplicateCountries++
                continue
            }

            seenCountryCodes.add(iso2)
            countries.push({ ...sourceCountry, iso_2: iso2 })
        }

        if (!countries.length) {
            malformed.invalidRegions++
            continue
        }

        seenRegionIds.add(id)
        regions.push({ ...sourceRegion, id, countries })
    }

    return { regions, malformed }
}
