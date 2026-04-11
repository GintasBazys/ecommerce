import type { OrderDTO } from "@medusajs/types"
import type { H3Event } from "h3"

import { fetchMedusaJson } from "#server/utils/medusa-proxy"

export async function fetchStoreOrder(event: H3Event, id: string): Promise<OrderDTO> {
    const response = await fetchMedusaJson<{ order: OrderDTO }>(event, `/store/orders/${encodeURIComponent(id)}`, {
        method: "GET"
    })

    return response.order
}
