import type { StoreFulfillmentStatus, StoreOrderStatus, StorePaymentStatus } from "@/enumerators/order"

export type PublicOrderStatus = {
    id: string
    display_id: number | string
    created_at: string | Date
    status: StoreOrderStatus | string | null
    payment_status: StorePaymentStatus | string | null
    fulfillment_status: StoreFulfillmentStatus | string | null
    shipping_method: string | null
}
