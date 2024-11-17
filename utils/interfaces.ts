import type { Customer } from "@medusajs/medusa"
export interface CustomerResponseInterface {
    customer: Customer
    token: string
}

export interface CustomerAuthResponseInterface {
    customer: Customer
    success: boolean
}

export interface CustomerLoginResponseInterface {
    customer: Customer
    success: boolean
    message: string
}
