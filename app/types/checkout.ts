import type { CartDTO, CartLineItemDTO, CustomerDTO } from "@medusajs/types"

export type CheckoutStep = "account" | "address" | "payment"
export type EditableAddressField =
    | "first_name"
    | "last_name"
    | "address_1"
    | "address_2"
    | "city"
    | "province"
    | "postal_code"
    | "country_code"
    | "phone"

export type RequiredAddressField = Exclude<EditableAddressField, "address_2">

export type CountryOption = {
    iso_2: string
    display_name?: string
}

export type CustomerAddress = CustomerDTO["addresses"][number]

export type CheckoutCartShippingMethod = {
    shipping_option_id?: string | null
}

export type CheckoutCart = CartDTO & {
    email?: string | null
    shipping_methods?: CheckoutCartShippingMethod[] | null
}

export type PricedCartLineItem = CartLineItemDTO & {
    subtotal?: number | null
    total?: number | null
    tax_total?: number | null
    unit_price?: number | null
}

export type PromotionSummary = {
    id: string
    code?: string | null
    application_method?: {
        value?: number | string | null
    } | null
}

export type LoginErrors = {
    email: string
    password: string
    verification: string
}

export type RegisterErrors = {
    first_name: string
    last_name: string
    email: string
    password: string
    verification: string
}

export type GuestErrors = {
    email: string
}

export type AuthTab = "login" | "register" | "guest"

export type AddressErrors = {
    first_name: string
    last_name: string
    address_1: string
    city: string
    province: string
    postal_code: string
    country_code: string
    phone: string
}

export type CreatePaymentIntentPayload = {
    clientSecret?: string
    client_secret?: string
}

export type CompleteCartPayload = { order?: { id?: string; email?: string | null; shipping_address?: { postal_code?: string | null } | null } }

export type CheckoutAccountStepInstance = {
    executeLoginTurnstile: () => Promise<string>
    executeRegisterTurnstile: () => Promise<string>
}
