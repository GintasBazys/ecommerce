import type { OrderDTO } from "@medusajs/types"
import type { H3Event } from "h3"

export async function fetchStoreOrder(event: H3Event, id: string): Promise<OrderDTO> {
    const config = useRuntimeConfig(event)
    const response = await $fetch<{ order: OrderDTO }>(`${config.public.MEDUSA_URL}/store/orders/${encodeURIComponent(id)}`, {
        method: "GET",
        headers: {
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
            "Content-Type": "application/json",
            cookie: getHeader(event, "cookie") ?? ""
        }
    })

    return response.order
}
