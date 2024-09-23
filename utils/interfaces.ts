export interface CustomerInterface {
    id: string
    email: string
    first_name: string
    last_name: string
    billing_address_id: string
    phone: number
    has_account: boolean
    created_at: string
    updated_at: string
    deleted_at: string
    metadata: {
        [key: string]: string
    }
}
export interface CustomerResponseInterface {
    customer: CustomerInterface
}
