import type { OrderDTO } from "@medusajs/types"

import { fetchStoreOrder } from "#server/utils/orders"

type StoreOrderWithStatuses = OrderDTO & {
    payment_status?: string | null
    fulfillment_status?: string | null
}

type PublicOrderStatus = {
    id: string
    display_id: number | string
    created_at: string | Date
    status: string | null
    payment_status: string | null
    fulfillment_status: string | null
    shipping_method: string | null
}

function getOrderIdParam(param: string | string[] | undefined): string {
    if (typeof param !== "string" || !/^order_[a-zA-Z0-9]+$/.test(param)) {
        throw createError({ statusCode: 400, statusMessage: "Invalid order ID" })
    }

    return param
}

function toPublicOrderStatus(order: StoreOrderWithStatuses): PublicOrderStatus {
    return {
        id: order.id,
        display_id: order.display_id,
        created_at: order.created_at,
        status: order.status ?? null,
        payment_status: order.payment_status ?? null,
        fulfillment_status: order.fulfillment_status ?? null,
        shipping_method: order.shipping_methods?.[0]?.name ?? null
    }
}

export default defineEventHandler(async (event) => {
    const orderId = getOrderIdParam(event.context.params?.id)

    try {
        const order = (await fetchStoreOrder(event, orderId)) as StoreOrderWithStatuses

        return { order: toPublicOrderStatus(order) }
    } catch {
        throw createError({ statusCode: 404, statusMessage: "Order status not found" })
    }
})
