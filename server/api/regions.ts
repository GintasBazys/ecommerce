import type { RegionDTO } from "@medusajs/types"
import { randomUUID } from "node:crypto"

import { assertMedusaResponse, fetchMedusaResponse, safeJson, toUpstreamError } from "#server/utils/medusa-proxy"
import { normalizeRegionsPayload } from "#server/utils/region"

const PUBLIC_ERROR_MESSAGE = "Regional pricing is temporarily unavailable"

type FailureCategory = "configuration" | "invalid_response" | "network" | "timeout" | "upstream_client" | "upstream_server"

function getFailureCategory(error: unknown): FailureCategory {
    const typedError = error as { statusCode?: number; dependencyFailure?: "network" | "timeout" }

    if (typedError.dependencyFailure) return typedError.dependencyFailure
    if (typedError.statusCode === 503) return "network"
    if (typedError.statusCode === 500) return "configuration"
    if (typedError.statusCode === 502) return "upstream_server"
    return "upstream_client"
}

export default defineEventHandler(async (event) => {
    setHeader(event, "Cache-Control", "no-store")
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000)
    const correlationId = randomUUID()
    let logged = false

    function logFailure(category: FailureCategory, mappedStatus: number, upstreamStatus?: number, malformedEntryCount?: number) {
        console.error("Regional dependency request failed", {
            operation: "list_regions",
            failureCategory: category,
            mappedStatus,
            ...(upstreamStatus === undefined ? {} : { upstreamStatus }),
            ...(malformedEntryCount === undefined ? {} : { malformedEntryCount }),
            correlationId
        })
        logged = true
    }

    try {
        const response = await fetchMedusaResponse(event, "/store/regions", {
            signal: controller.signal
        })

        if (!response.ok) {
            const mappedStatus = response.status >= 500 ? 502 : response.status
            logFailure(response.status >= 500 ? "upstream_server" : "upstream_client", mappedStatus, response.status)
            await assertMedusaResponse(response, PUBLIC_ERROR_MESSAGE)
        }

        const payload = await safeJson<unknown>(response)
        if (payload === null) {
            logFailure("invalid_response", 502, response.status)
            throw createError({ statusCode: 502, statusMessage: PUBLIC_ERROR_MESSAGE })
        }

        const normalized = normalizeRegionsPayload(payload)
        if (!normalized.regions.length) {
            const malformedEntryCount = Object.values(normalized.malformed).reduce((total, count) => total + count, 0)
            logFailure("invalid_response", 502, response.status, malformedEntryCount)
            throw createError({ statusCode: 502, statusMessage: PUBLIC_ERROR_MESSAGE })
        }

        return { regions: normalized.regions as unknown as RegionDTO[] }
    } catch (error: unknown) {
        const mappedError = toUpstreamError(error, PUBLIC_ERROR_MESSAGE) as { statusCode?: number }
        if (!logged) {
            logFailure(getFailureCategory(mappedError), mappedError.statusCode ?? 500)
        }
        throw createError({ statusCode: mappedError.statusCode ?? 500, statusMessage: PUBLIC_ERROR_MESSAGE })
    } finally {
        clearTimeout(timer)
    }
})
