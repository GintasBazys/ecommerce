import type { ProductVariantDTO } from "@medusajs/types"

export function useProductPrice(selectedVariant: Ref<ProductVariantDTO | null>) {
    const amountWithTax = computed(() => selectedVariant.value?.calculated_price?.calculated_amount_with_tax ?? null)

    const amountWithoutTax = computed(() => selectedVariant.value?.calculated_price?.calculated_amount_without_tax ?? null)

    const calculatedAmount = computed(() => selectedVariant.value?.calculated_price?.calculated_amount ?? null)

    const amountToShow = computed(() => {
        const price = selectedVariant.value?.calculated_price
        if (!price) return null

        if (price.is_calculated_price_tax_inclusive) {
            return calculatedAmount.value
        }

        return amountWithTax.value ?? calculatedAmount.value
    })

    const displayPrice = computed(() => (amountToShow.value != null ? formatPrice(amountToShow.value, "EUR") : ""))

    const taxLabel = computed(() => {
        if (amountWithTax.value != null && amountWithoutTax.value != null) {
            const tax = amountWithTax.value - amountWithoutTax.value
            return `Incl. ${formatPrice(tax, "EUR")} tax`
        }

        return ""
    })

    return {
        displayPrice,
        originalPrice: computed(() => ""),
        taxLabel
    }
}
