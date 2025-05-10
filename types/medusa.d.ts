// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { OrderDTO, OrderAddressDTO, ProductVariantDTO, CartLineItemDTO } from "@medusajs/types"

declare module "@medusajs/types" {
    interface OrderDTO {
        payment_status: string
        fulfillment_status: string
    }
    interface OrderAddressDTO {
        country: {
            display_name: string
        }
    }
    interface ProductVariantDTO {
        calculated_price: {
            calculated_amount: number
            original_amount: number
            currency_code: string
            calculated_price: {
                price_list_type: string
            }
        }
        inventory_quantity: number
    }
    interface CartLineItemDTO {
        stocked_quantity: number
    }
}
