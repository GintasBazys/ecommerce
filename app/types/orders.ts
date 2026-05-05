import type { OrderDTO } from "@medusajs/types"

export type OrderAddress = OrderDTO["shipping_address"] | OrderDTO["billing_address"]

export type OrderSupportFact = {
    label: string
    value: string
}

export type OrdersListItem = OrderDTO & {
    fulfillment_status?: string | null
}

export type ProfileOrdersResponse = {
    orders: OrderDTO[]
    total: number
}

export type InvoiceOrderDTO = OrderDTO & {
    payment_status?: string | null
    fulfillment_status?: string | null
}

export type TrackingStep = {
    key: string
    label: string
    description: string
    icon: "receipt" | "card" | "box" | "truck" | "home"
}
