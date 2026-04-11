import type { OrderDTO } from "@medusajs/types"

import { fetchMedusaJson } from "#server/utils/medusa-proxy"

type OrdersResponse = {
    orders?: OrderDTO[]
    count?: number
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const pageParam = Array.isArray(query.page) ? query.page[0] : (query.page ?? "1")
    const limitParam = Array.isArray(query.limit) ? query.limit[0] : (query.limit ?? "10")

    const page = Math.max(1, parseInt(String(pageParam), 10) || 1)
    const limit = Math.max(1, parseInt(String(limitParam), 10) || 10)
    const offset = (page - 1) * limit

    const data = await fetchMedusaJson<OrdersResponse>(event, `/store/orders?offset=${offset}&limit=${limit}`, {
        method: "GET"
    })

    return { orders: data.orders ?? [], total: data.count ?? 0 }
})
