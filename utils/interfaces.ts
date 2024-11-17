import type { Customer } from "@medusajs/medusa"
import type { JwtPayload } from "jwt-decode"
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

export interface CustomJwtPayload extends JwtPayload {
    auth_identity_id: string
    actor_id?: string
}
