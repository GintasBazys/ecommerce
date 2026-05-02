import { describe, expect, it } from 'vitest'

import { createBreadcrumbSchema, normalizeSchemaDate } from '../../app/composables/useStructuredData'

const siteUrl = 'https://shop.example.com'

function absoluteUrl(path = ''): string {
    if (!path) {
        return siteUrl
    }

    return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}

describe('home structured data helpers', () => {
    it('builds homepage breadcrumb schema with absolute item URLs', () => {
        expect(
            createBreadcrumbSchema(
                [
                    { name: 'Home', path: '/' },
                    { name: 'Shop', path: '/' }
                ],
                absoluteUrl
            )
        ).toEqual({
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://shop.example.com/'
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Shop',
                    item: 'https://shop.example.com/'
                }
            ]
        })
    })

    it('normalizes valid schema dates and ignores malformed dates', () => {
        expect(normalizeSchemaDate('2026-05-02T10:30:00.000Z')).toBe('2026-05-02T10:30:00.000Z')
        expect(normalizeSchemaDate('not-a-date')).toBeUndefined()
        expect(normalizeSchemaDate(null)).toBeUndefined()
    })
})
