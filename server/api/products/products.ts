import { LIMIT } from "@/utils/consts"
import { assertMedusaResponse, fetchMedusaResponse, safeJson, toUpstreamError } from "#server/utils/medusa-proxy"

type ProductsResponse = {
    products?: unknown[]
    count?: number
}

const DEFAULT_LIMIT = Number(LIMIT) || 12
const MAX_LIMIT = 48
const MAX_HANDLE_LOOKUP = 8

function parseBoundedInteger(value: unknown, fallbackValue: number, maximumValue: number): number {
    const source = Array.isArray(value) ? value[0] : value
    const parsedValue = Number.parseInt(String(source ?? ""), 10)

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
        return fallbackValue
    }

    return Math.min(parsedValue, maximumValue)
}

function parseHandles(value: unknown): string[] {
    const values = Array.isArray(value) ? value : [value]

    return values
        .flatMap((item) => String(item ?? "").split(","))
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item, index, items) => items.indexOf(item) === index)
        .slice(0, MAX_HANDLE_LOOKUP)
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const limit = parseBoundedInteger(query.limit, DEFAULT_LIMIT, MAX_LIMIT)
    const offset = parseBoundedInteger(query.offset, 0, Number.MAX_SAFE_INTEGER)
    const categoryId = query.category_id != null ? String(query.category_id) : null
    const handle = query.handle ? String(query.handle) : null
    const handles = parseHandles(query.handles)
    const order = query.order ? String(query.order) : "-created_at"
    const view = query.view ? String(query.view) : "default"

    const regionId = query.region_id ? String(query.region_id) : null
    const countryCode = query.country_code ? String(query.country_code) : ""
    if (!regionId) {
        throw createError({ statusCode: 400, statusMessage: "region_id is required" })
    }

    const fields =
        view === "card"
            ? "id,title,handle,thumbnail,subtitle,description,*images,+metadata,*collection,*type,*categories,*variants,*variants.calculated_price,+variants.inventory_quantity"
            : "*variants.calculated_price,+variants.inventory_quantity,*categories,+metadata"

    const queryParams = new URLSearchParams({
        fields,
        region_id: regionId,
        country_code: countryCode,
        order
    })

    if (handle) queryParams.set("handle", handle)
    if (categoryId) queryParams.set("category_id", categoryId)
    if (countryCode) queryParams.set("country_code", countryCode)

    if (!countryCode) {
        throw createError({ statusCode: 400, statusMessage: "country_code is required for tax pricing" })
    }

    if (handles.length) {
        try {
            const responses = await Promise.all(
                handles.map(async (productHandle) => {
                    const handleParams = new URLSearchParams(queryParams)
                    handleParams.set("handle", productHandle)
                    handleParams.set("limit", "1")
                    handleParams.set("offset", "0")

                    const response = await fetchMedusaResponse(event, `/store/products?${handleParams.toString()}`, {
                        method: "GET"
                    })

                    await assertMedusaResponse(response, "Failed to fetch products")

                    return await safeJson<ProductsResponse>(response)
                })
            )

            setHeader(event, "Cache-Control", "no-store")

            return {
                products: responses.flatMap((response) => response?.products?.[0] ?? []),
                count: responses.length
            }
        } catch (error: unknown) {
            setHeader(event, "Cache-Control", "no-store")
            throw toUpstreamError(error, "Failed to fetch products")
        }
    }

    queryParams.set("limit", String(limit))
    queryParams.set("offset", String(offset))

    const endpoint = categoryId ? "/store/category-products" : "/store/products"
    const path = `${endpoint}?${queryParams.toString()}`

    try {
        const response = await fetchMedusaResponse(event, path, {
            method: "GET"
        })

        await assertMedusaResponse(response, "Failed to fetch products")

        setHeader(event, "Cache-Control", "no-store")
        const payload = await safeJson<ProductsResponse>(response)

        if (payload === null) {
            throw createError({ statusCode: 502, statusMessage: "Invalid Medusa response" })
        }

        return payload
    } catch (error: unknown) {
        setHeader(event, "Cache-Control", "no-store")
        throw toUpstreamError(error, "Failed to fetch products")
    }
})
