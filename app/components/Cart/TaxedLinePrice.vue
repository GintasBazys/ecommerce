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
    <div class="grid justify-items-end gap-0.5">
        <strong class="font-bold text-inherit">{{ displayPrice }}</strong>
        <span v-if="showTaxLabel && hasTax && taxLabel" class="text-xs leading-5 text-slate-500">{{ taxLabel }}</span>
    </div>
</template>
