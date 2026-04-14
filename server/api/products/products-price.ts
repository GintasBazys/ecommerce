import type { ProductDTO } from "@medusajs/types"

import { LIMIT } from "@/utils/consts"
import { fetchAllStoreProducts, getAggregatedProductPrice } from "#server/utils/products"
import { toUpstreamError } from "#server/utils/medusa-proxy"

type VariantPriceField = "calculated_amount" | "original_amount"

function parsePriceField(order: string): VariantPriceField {
    const normalizedOrder = order.replace(/^-/, "")
    const segments = normalizedOrder.split(".")
    const candidateField = segments[segments.length - 1]

    return candidateField === "original_amount" ? "original_amount" : "calculated_amount"
}

function parsePositiveInteger(value: unknown, fallbackValue: number) {
    const parsedValue = Number(value)

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
        return fallbackValue
    }

    return Math.floor(parsedValue)
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const limit = parsePositiveInteger(query.limit, Number(LIMIT))
    const offset = parsePositiveInteger(query.offset, 0)
    const categoryId = query.category_id != null ? String(query.category_id) : null
    const regionId = query.region_id ? String(query.region_id) : null
    const handle = query.handle ? String(query.handle) : null
    const order = query.order ? String(query.order) : "variants.calculated_price.calculated_amount"

    if (!regionId) {
        throw createError({ statusCode: 400, statusMessage: "region_id is required" })
    }

    const isDescending = order.startsWith("-")
    const priceField = parsePriceField(order)
    const aggregateMode = query.agg === "max" ? "max" : "min"

    const searchParams = new URLSearchParams({
        fields: "+metadata,*variants.calculated_price,*variants.inventory_quantity",
        region_id: regionId
    })

    if (handle) {
        searchParams.set("handle", handle)
    }

    if (categoryId) {
        searchParams.set("category_id", categoryId)
    }

    try {
        const { products, count } = await fetchAllStoreProducts<ProductDTO>(event, searchParams)
        const missingPriceSentinel = isDescending ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY

        const sortedProducts = products
            .map((product) => ({
                product,
                sortValue: getAggregatedProductPrice(product, aggregateMode, priceField) ?? missingPriceSentinel
            }))
            .sort((left, right) => (isDescending ? right.sortValue - left.sortValue : left.sortValue - right.sortValue))
            .map(({ product }) => product)

        setHeader(event, "Cache-Control", "no-store")

        return {
            products: sortedProducts.slice(offset, offset + limit),
            count
        }
    } catch (error: unknown) {
        setHeader(event, "Cache-Control", "no-store")
        throw toUpstreamError(error, "Failed to fetch price-sorted products")
    }
})
