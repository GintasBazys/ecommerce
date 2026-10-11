import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getOptionalRegionId, getRequiredRegionId, normalizeRegionsPayload } from '../../../../server/utils/region'

function createError(input: { statusCode: number; statusMessage: string }) {
    return Object.assign(new Error(input.statusMessage), input)
}

describe('region server utilities', () => {
    beforeEach(() => {
        vi.stubGlobal('createError', createError)
    })

    it('normalizes usable regions and removes malformed and duplicate data', () => {
        const result = normalizeRegionsPayload({
            regions: [
                {
                    id: ' reg_eu ',
                    name: 'Europe',
                    countries: [
                        { iso_2: 'LT', name: 'Lithuania' },
                        { iso_2: 'lt', name: 'Duplicate' },
                        { iso_2: 'LIT' },
                    ],
                },
                { id: 'reg_eu', countries: [{ iso_2: 'DE' }] },
                { id: '', countries: [{ iso_2: 'US' }] },
                { id: 'reg_empty', countries: [{ iso_2: '1X' }] },
                null,
            ],
        })

        expect(result.regions).toEqual([
            {
                id: 'reg_eu',
                name: 'Europe',
                countries: [{ iso_2: 'lt', name: 'Lithuania' }],
            },
        ])
        expect(result.malformed).toEqual({
            invalidRegions: 3,
            duplicateRegions: 1,
            invalidCountries: 2,
            duplicateCountries: 1,
        })
    })

    it.each([null, undefined, {}, [], { regions: [] }, { regions: 'invalid' }])('returns no regions for an unusable payload', (payload) => {
        expect(normalizeRegionsPayload(payload).regions).toEqual([])
    })

    it('accepts a trimmed scalar region identifier', () => {
        expect(getRequiredRegionId(' reg_eu ')).toBe('reg_eu')
        expect(getOptionalRegionId(undefined)).toBeNull()
    })

    it.each([
        undefined,
        null,
        '',
        '   ',
        ['reg_eu', 'reg_us'],
        'null',
        ' undefined ',
        'reg_\u0000eu',
        'x'.repeat(129),
    ])('rejects invalid required region identifiers before forwarding', (value) => {
        expect(() => getRequiredRegionId(value)).toThrow('Invalid region_id')
    })

    it('rejects an invalid optional value when it was supplied', () => {
        expect(() => getOptionalRegionId(['reg_eu'])).toThrow('Invalid region_id')
    })
})
