export enum ORDER_STATUS {
    pending = "pending",
    completed = "completed",
    canceled = "canceled",
    requires_action = "requires_action"
}

export enum PAYMENT_STATUS {
    not_paid = "not_paid",
    awaiting = "awaiting",
    authorized = "authorized",
    partially_authorized = "partially_authorized",
    captured = "captured",
    partially_captured = "partially_captured",
    partially_refunded = "partially_refunded",
    refunded = "refunded",
    requires_action = "requires_action",
    canceled = "canceled"
}

export enum FULFILLMENT_STATUS {
    not_fulfilled = "not_fulfilled",
    partially_fulfilled = "partially_fulfilled",
    fulfilled = "fulfilled",
    partially_shipped = "partially_shipped",
    shipped = "shipped",
    partially_delivered = "partially_delivered",
    delivered = "delivered",
    canceled = "canceled"
}

export type StoreOrderStatus = `${ORDER_STATUS}`
export type StorePaymentStatus = `${PAYMENT_STATUS}`
export type StoreFulfillmentStatus = `${FULFILLMENT_STATUS}`

type StorefrontOrderStatusSource = {
    status?: string | null
    payment_status?: string | null
    fulfillment_status?: string | null
}

const paymentStatusLabels: Record<PAYMENT_STATUS, string> = {
    [PAYMENT_STATUS.not_paid]: "Not paid",
    [PAYMENT_STATUS.awaiting]: "Awaiting payment",
    [PAYMENT_STATUS.authorized]: "Authorized",
    [PAYMENT_STATUS.partially_authorized]: "Partially authorized",
    [PAYMENT_STATUS.captured]: "Paid",
    [PAYMENT_STATUS.partially_captured]: "Partially paid",
    [PAYMENT_STATUS.partially_refunded]: "Partially refunded",
    [PAYMENT_STATUS.refunded]: "Refunded",
    [PAYMENT_STATUS.requires_action]: "Requires action",
    [PAYMENT_STATUS.canceled]: "Canceled"
}

const fulfillmentStatusLabels: Record<FULFILLMENT_STATUS, string> = {
    [FULFILLMENT_STATUS.not_fulfilled]: "Not fulfilled",
    [FULFILLMENT_STATUS.partially_fulfilled]: "Partially fulfilled",
    [FULFILLMENT_STATUS.fulfilled]: "Fulfilled",
    [FULFILLMENT_STATUS.partially_shipped]: "Partially shipped",
    [FULFILLMENT_STATUS.shipped]: "Shipped",
    [FULFILLMENT_STATUS.partially_delivered]: "Partially delivered",
    [FULFILLMENT_STATUS.delivered]: "Delivered",
    [FULFILLMENT_STATUS.canceled]: "Canceled"
}

function formatUnknownStatus(status: string | null | undefined, fallback: string): string {
    if (!status) {
        return fallback
    }

    return status
        .split("_")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
}

export function formatStorefrontOrderStatus(order: StorefrontOrderStatusSource | null | undefined): string {
    if (!order) {
        return "Processing"
    }

    if (order.status === ORDER_STATUS.canceled || order.fulfillment_status === FULFILLMENT_STATUS.canceled) {
        return "Canceled"
    }

    if (order.status === ORDER_STATUS.requires_action || order.payment_status === PAYMENT_STATUS.requires_action) {
        return "Requires action"
    }

    if (order.fulfillment_status === FULFILLMENT_STATUS.delivered) {
        return "Delivered"
    }

    if (order.fulfillment_status === FULFILLMENT_STATUS.partially_delivered) {
        return "Partially delivered"
    }

    if (order.fulfillment_status === FULFILLMENT_STATUS.shipped) {
        return "Shipped"
    }

    if (order.fulfillment_status === FULFILLMENT_STATUS.partially_shipped) {
        return "Partially shipped"
    }

    if (order.fulfillment_status === FULFILLMENT_STATUS.fulfilled) {
        return "Fulfilled"
    }

    if (order.fulfillment_status === FULFILLMENT_STATUS.partially_fulfilled) {
        return "Partially fulfilled"
    }

    if (order.status === ORDER_STATUS.completed) {
        return "Completed"
    }

    if (order.payment_status === PAYMENT_STATUS.not_paid || order.payment_status === PAYMENT_STATUS.awaiting) {
        return "Awaiting payment"
    }

    return "Processing"
}

export function formatPaymentStatus(status: string | null | undefined): string {
    return paymentStatusLabels[status as PAYMENT_STATUS] ?? formatUnknownStatus(status, "Awaiting payment")
}

export function formatFulfillmentStatus(status: string | null | undefined): string {
    return fulfillmentStatusLabels[status as FULFILLMENT_STATUS] ?? formatUnknownStatus(status, "Not fulfilled")
}
