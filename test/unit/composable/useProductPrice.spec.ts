import type { ProductVariantDTO } from '@medusajs/types'
import type { Ref } from 'vue'

import { describe, expect, it } from 'vitest'
import { ref } from 'vue'

import { useProductPrice } from '../../../app/composables/product/useProductPrice'

type TestCalculatedPrice = {
    calculated_amount: number
    calculated_amount_with_tax?: number
    calculated_amount_without_tax?: number
    original_amount: number
    currency_code: string
    is_calculated_price_tax_inclusive?: boolean
    calculated_price: {
        price_list_type: string
    }
}

function createVariant(price: Partial<TestCalculatedPrice>): ProductVariantDTO {
    return {
        id: 'variant_1',
        calculated_price: {
            calculated_amount: 120,
            original_amount: 120,
            currency_code: 'EUR',
            calculated_price: {
                price_list_type: 'default'
            },
            ...price
        },
        inventory_quantity: 10
    } as unknown as ProductVariantDTO
}

function getProductPrice(selectedVariant: Ref<ProductVariantDTO | null>) {
    return useProductPrice(selectedVariant)
}

describe('useProductPrice', () => {
    it('returns empty price labels when no variant is selected', () => {
        const selectedVariant = ref<ProductVariantDTO | null>(null)
        const price = getProductPrice(selectedVariant)

        expect(price.displayPrice.value).toBe('')
        expect(price.originalPrice.value).toBe('')
        expect(price.taxLabel.value).toBe('')
    })

    it('uses calculated amount for tax-inclusive prices', () => {
        const selectedVariant = ref<ProductVariantDTO | null>(
            createVariant({
                calculated_amount: 199.99,
                calculated_amount_with_tax: 240,
                calculated_amount_without_tax: 199.99,
                is_calculated_price_tax_inclusive: true
            })
        )
        const price = getProductPrice(selectedVariant)

        expect(price.displayPrice.value).toBe('€199.99')
        expect(price.taxLabel.value).toBe('Incl. €40.01 tax')
    })

    it('uses amount with tax for non-tax-inclusive prices', () => {
        const selectedVariant = ref<ProductVariantDTO | null>(
            createVariant({
                calculated_amount: 100,
                calculated_amount_with_tax: 121,
                calculated_amount_without_tax: 100,
                is_calculated_price_tax_inclusive: false
            })
        )
        const price = getProductPrice(selectedVariant)

        expect(price.displayPrice.value).toBe('€121.00')
        expect(price.taxLabel.value).toBe('Incl. €21.00 tax')
    })

    it('falls back to calculated amount when amount with tax is missing', () => {
        const selectedVariant = ref<ProductVariantDTO | null>(
            createVariant({
                calculated_amount: 89.5,
                calculated_amount_without_tax: 75,
                is_calculated_price_tax_inclusive: false
            })
        )
        const price = getProductPrice(selectedVariant)

        expect(price.displayPrice.value).toBe('€89.50')
        expect(price.taxLabel.value).toBe('')
    })

    it('does not show a tax label when tax is zero or negative', () => {
        const selectedVariant = ref<ProductVariantDTO | null>(
            createVariant({
                calculated_amount: 100,
                calculated_amount_with_tax: 100,
                calculated_amount_without_tax: 100
            })
        )
        const price = getProductPrice(selectedVariant)

        expect(price.taxLabel.value).toBe('')

        selectedVariant.value = createVariant({
            calculated_amount: 100,
            calculated_amount_with_tax: 90,
            calculated_amount_without_tax: 100
        })

        expect(price.taxLabel.value).toBe('')
    })

    it('reacts when the selected variant changes', () => {
        const selectedVariant = ref<ProductVariantDTO | null>(
            createVariant({
                calculated_amount: 50,
                calculated_amount_with_tax: 60,
                calculated_amount_without_tax: 50
            })
        )
        const price = getProductPrice(selectedVariant)

        expect(price.displayPrice.value).toBe('€60.00')

        selectedVariant.value = createVariant({
            calculated_amount: 75,
            is_calculated_price_tax_inclusive: true
        })

        expect(price.displayPrice.value).toBe('€75.00')
    })
})
