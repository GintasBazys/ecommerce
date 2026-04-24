import type { AddressDTO, CustomerDTO, OrderDTO, ProductDTO } from "@medusajs/types"
import type { JwtPayload } from "jwt-decode"

export interface CustomerResponseInterface {
    customer: CustomerDTO
    token: string
}

export interface CustomerAuthResponseInterface {
    customer: CustomerDTO
    success: boolean
}

export interface CustomJwtPayload extends JwtPayload {
    auth_identity_id: string
    actor_id?: string
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

export type Review = {
    id: string
    rating: number
    title: string
    first_name: string
    last_name: string
    content: string
    created_at: string
}

export type ReviewApiResponse = {
    reviews: Review[]
}

export interface NavLink {
    label: string
    to: string
    icon?: string
}

export interface OrdersResponse {
    orders: OrderDTO[]
    total: number
}

export interface Customer {
    company_name: string
    first_name: string
    last_name: string
    phone: string
}

export interface APIError {
    data?: {
        message?: string
    }
}

export interface Address extends AddressDTO {
    first_name: string
    last_name: string
}
