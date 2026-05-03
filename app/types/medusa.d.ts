import type { StoreCartPromotion } from "@medusajs/types"
import type { StoreFulfillmentStatus, StorePaymentStatus } from "@/enumerators/order"

declare module "@medusajs/types" {
    interface OrderDTO {
        payment_status: StorePaymentStatus
        fulfillment_status: StoreFulfillmentStatus
    }
    interface OrderAddressDTO {
        country: {
            display_name: string
        }
    }
    interface ProductVariantDTO {
        calculated_price: {
            calculated_amount: number
            calculated_amount_with_tax?: number
            calculated_amount_without_tax?: number
            original_amount: number
            original_amount_with_tax?: number
            currency_code: string
            is_calculated_price_tax_inclusive?: boolean
            calculated_price: {
                price_list_type: string
            }
        }
        inventory_quantity: number
    }

    interface CartDTO {
        parent: CartDTO
        promotions: StoreCartPromotion[]
    }
    interface CartLineItemDTO {
        stocked_quantity: number
    }
}
