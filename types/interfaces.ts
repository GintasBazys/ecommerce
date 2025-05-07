import type { CustomerDTO, ProductDTO } from "@medusajs/types"
import type { JwtPayload } from "jwt-decode"
export interface CustomerResponseInterface {
    customer: CustomerDTO
    token: string
}

export interface CustomerAuthResponseInterface {
    customer: CustomerDTO
    success: boolean
}

export interface CustomerLoginResponseInterface {
    customer: CustomerDTO
    success: boolean
    message: string
}

export interface CustomJwtPayload extends JwtPayload {
    auth_identity_id: string
    actor_id?: string
}

export interface SimpleProductVariant {
    id: string
    title: string
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

export interface Price {
    amount: number
    currency_code: string
}

export interface ShippingOption {
    id: string
    name: string
    calculated_price?: { calculated_amount: number }
    prices: Price[]
}

export interface SearchResponse {
    products: ProductDTO[]
    count: number
}
