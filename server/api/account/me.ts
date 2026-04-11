import type { CustomerDTO } from "@medusajs/types"

import { fetchMedusaResponse, safeJson, toUpstreamError } from "#server/utils/medusa-proxy"

type CustomerResponse = {
    customer?: CustomerDTO | null
}

export default defineEventHandler(async (event) => {
    try {
        const response = await fetchMedusaResponse(event, "/store/customers/me", {
            method: "GET"
        })

        if (response.status === 401) {
            return { success: true, customer: null }
        }

        if (!response.ok) {
            throw createError({
                statusCode: response.status,
                statusMessage: "Failed to fetch customer"
            })
        }

        const data = await safeJson<CustomerResponse>(response)
        return { success: true, customer: data?.customer ?? null }
    } catch (error: unknown) {
        throw toUpstreamError(error, "Failed to fetch customer")
    }
})
