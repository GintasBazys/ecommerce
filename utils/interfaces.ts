import type { CustomerDTO } from "@medusajs/types"
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
