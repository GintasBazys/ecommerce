import { getQuery, setHeader, createError } from "h3"

import type { ProductDTO } from "@medusajs/types"

import { LIMIT } from "@/utils/consts"

const PAGE_SIZE = 200
const MAX_FETCH = 3000

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const q = getQuery(event)

    const limit = q.limit != null ? Number(q.limit) : Number(LIMIT)
    const offset = q.offset != null ? Number(q.offset) : 0
    const categoryId = q.category_id != null ? String(q.category_id) : null
    const regionId = q.region_id ? String(q.region_id) : null
    const handle = q.handle ? String(q.handle) : null
    const order = q.order ? String(q.order) : "variants.calculated_price.calculated_amount"

    if (!regionId) {
        throw createError({ statusCode: 400, statusMessage: "region_id is required" })
    }

    const isDesc = order.startsWith("-")

    const orderNoSign = order.replace(/^-/, "")
    const parts = orderNoSign.split(".")
    const candidate = parts[parts.length - 1] || "calculated_amount"
    const allowed = new Set(["calculated_amount", "original_amount"])
    const priceField = allowed.has(candidate) ? candidate : "calculated_amount"

    const agg = (q.agg === "max" ? "max" : "min") as "min" | "max"

    const baseParams = new URLSearchParams({
        fields: "+metadata,*variants.calculated_price,*variants.inventory_quantity",
        region_id: regionId
    })
    if (handle) baseParams.set("handle", handle)
    if (categoryId) baseParams.set("category_id", categoryId)

    const all = []
    let internalOffset = 0
    let total = 0

    try {
        const firstRes = await fetch(`${config.public.MEDUSA_URL}/store/products?${baseParams.toString()}&limit=${PAGE_SIZE}&offset=0`, {
            method: "GET",
            headers: {
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                "Content-Type": "application/json"
            }
        })

        const firstJson = await firstRes.json()
        const firstProducts = Array.isArray(firstJson?.products) ? firstJson.products : []
        total = Number(firstJson?.count ?? firstProducts.length)
        all.push(...firstProducts)
        internalOffset = firstProducts.length

        const target = Math.min(total, MAX_FETCH)
        while (internalOffset < target) {
            const take = Math.min(PAGE_SIZE, target - internalOffset)
            const res = await fetch(
                `${config.public.MEDUSA_URL}/store/products?${baseParams.toString()}&limit=${take}&offset=${internalOffset}`,
                {
                    method: "GET",
                    headers: {
                        "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                        "Content-Type": "application/json"
                    }
                }
            )

            const json = await res.json()
            const prods = Array.isArray(json?.products) ? json.products : []
            all.push(...prods)
            internalOffset += prods.length
            total = Number(json?.count ?? total)
        }

        const missingSentinel = isDesc ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY

        const perProductValue = (p: ProductDTO) => {
            const nums = (p.variants ?? []).map((v) => v?.calculated_price?.[priceField]).filter((n) => typeof n === "number") as number[]
            if (!nums.length) return missingSentinel
            return agg === "max" ? Math.max(...nums) : Math.min(...nums)
        }

        const sorted = all
            .map((p) => ({ p, _val: perProductValue(p) }))
            .sort((a, b) => (isDesc ? b._val - a._val : a._val - b._val))
            .map(({ p }) => p)

        const sliced = sorted.slice(offset, offset + limit)

        setHeader(event, "Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=86400")
        return { products: sliced, count: total }
    } catch (err) {
        console.error("Error fetching price-sorted products:", err)
        setHeader(event, "Cache-Control", "no-store")
        throw err
    }
})
