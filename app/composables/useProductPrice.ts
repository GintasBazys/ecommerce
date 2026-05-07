import type { ProductVariantDTO } from "@medusajs/types"
import type { Ref } from "vue"

import { computed } from "vue"
import { formatPrice } from "~/utils/formatPrice"

type ProductVariantPrice = {
    calculated_amount?: number | null
    calculated_amount_with_tax?: number | null
    calculated_amount_without_tax?: number | null
    is_calculated_price_tax_inclusive?: boolean | null
}

type ProductVariantWithPrice = ProductVariantDTO & {
    calculated_price?: ProductVariantPrice | null
}

export function useProductPrice(selectedVariant: Ref<ProductVariantWithPrice | null>) {
    const amountWithTax = computed<number | null>(() => selectedVariant.value?.calculated_price?.calculated_amount_with_tax ?? null)

    const amountWithoutTax = computed<number | null>(() => selectedVariant.value?.calculated_price?.calculated_amount_without_tax ?? null)

    const calculatedAmount = computed<number | null>(() => selectedVariant.value?.calculated_price?.calculated_amount ?? null)

    const amountToShow = computed<number | null>(() => {
        const price = selectedVariant.value?.calculated_price
        if (!price) return null

        if (price.is_calculated_price_tax_inclusive) {
            return calculatedAmount.value
        }

        return amountWithTax.value ?? calculatedAmount.value
    })

    const displayPrice = computed<string>(() => (amountToShow.value != null ? formatPrice(amountToShow.value, "EUR") : ""))

    const taxLabel = computed<string>(() => {
        if (amountWithTax.value != null && amountWithoutTax.value != null) {
            const tax = amountWithTax.value - amountWithoutTax.value

            if (tax <= 0) {
                return ""
            }

            return `Incl. ${formatPrice(tax, "EUR")} tax`
        }

        return ""
    })

    return {
        displayPrice,
        originalPrice: computed<string>(() => ""),
        taxLabel
    }
}
