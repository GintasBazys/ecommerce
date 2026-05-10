import type { CustomerDTO, OrderDTO } from "@medusajs/types"
import type { H3Event } from "h3"

import { fetchMedusaJson } from "#server/utils/medusa-proxy"

type CustomerResponse = {
    customer?: CustomerDTO | null
}

type VerifiableOrder = OrderDTO & {
    customer_id?: string | null
    email?: string | null
    shipping_address?: {
        postal_code?: string | null
    } | null
}

function normalizeVerificationValue(value: unknown): string | null {
    const source = Array.isArray(value) ? value[0] : value
    return typeof source === "string" && source.trim() ? source.trim().toLowerCase() : null
}

async function fetchCurrentCustomer(event: H3Event): Promise<CustomerDTO | null> {
    try {
        const response = await fetchMedusaJson<CustomerResponse>(event, "/store/customers/me", {
            method: "GET"
        })

        return response.customer ?? null
    } catch {
        return null
    }
}

function customerOwnsOrder(customer: CustomerDTO | null, order: VerifiableOrder): boolean {
    if (!customer) {
        return false
    }

    return Boolean(
        (order.customer_id && customer.id === order.customer_id) ||
            (order.email && customer.email && order.email.toLowerCase() === customer.email.toLowerCase())
    )
}

function verificationMatchesOrder(event: H3Event, order: VerifiableOrder): boolean {
    const query = getQuery(event)
    const email = normalizeVerificationValue(query.email)
    const postalCode = normalizeVerificationValue(query.postal_code)
    const orderEmail = normalizeVerificationValue(order.email)
    const orderPostalCode = normalizeVerificationValue(order.shipping_address?.postal_code)

    return Boolean((email && orderEmail && email === orderEmail) || (postalCode && orderPostalCode && postalCode === orderPostalCode))
}

export async function fetchStoreOrder(event: H3Event, id: string): Promise<OrderDTO> {
    const response = await fetchMedusaJson<{ order: OrderDTO }>(event, `/store/orders/${encodeURIComponent(id)}`, {
        method: "GET"
    })

    return response.order
}

export async function fetchAuthorizedStoreOrder(event: H3Event, id: string): Promise<OrderDTO> {
    if (!id) {
        throw createError({ statusCode: 400, statusMessage: "Missing order id" })
    }

    const order = (await fetchStoreOrder(event, id)) as VerifiableOrder
    const customer = await fetchCurrentCustomer(event)

    if (customerOwnsOrder(customer, order) || verificationMatchesOrder(event, order)) {
        return order
    }

    throw createError({ statusCode: 403, statusMessage: "Order access denied" })
}
