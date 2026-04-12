<script setup lang="ts">
import type { ProductVariantDTO } from "@medusajs/types"

const props = withDefaults(
    defineProps<{
        amountWithTax: number
        amountWithoutTax: number
        showTaxLabel?: boolean
    }>(),
    {
        showTaxLabel: true
    }
)

const selectedVariant = computed<ProductVariantDTO | null>(
    () =>
        ({
            inventory_quantity: 0,
            calculated_price: {
                calculated_amount: props.amountWithoutTax,
                calculated_amount_with_tax: props.amountWithTax,
                calculated_amount_without_tax: props.amountWithoutTax,
                original_amount: props.amountWithTax,
                currency_code: "EUR",
                is_calculated_price_tax_inclusive: false,
                calculated_price: {
                    price_list_type: "default"
                }
            }
        }) as ProductVariantDTO
)

const { displayPrice, taxLabel } = useProductPrice(selectedVariant)
const hasTax = computed(() => props.amountWithTax > props.amountWithoutTax)
</script>

<template>
    <div class="taxed-line-price">
        <strong class="taxed-line-price__amount">{{ displayPrice }}</strong>
        <span v-if="showTaxLabel && hasTax && taxLabel" class="taxed-line-price__tax">{{ taxLabel }}</span>
    </div>
</template>

<style scoped lang="scss">
.taxed-line-price {
    display: grid;
    gap: 0.2rem;
    justify-items: end;
}

.taxed-line-price__amount {
    color: inherit;
    font: inherit;
    font-weight: 700;
}

.taxed-line-price__tax {
    color: #5a6480;
    font-size: 0.82rem;
    line-height: 1.4;
}
</style>
