import type { H3Event } from "h3"

import { fetchMedusaJson } from "#server/utils/medusa-proxy"

const DEFAULT_PAGE_SIZE = 200
const DEFAULT_MAX_FETCH = 3000

type StoreProductsResponse<Product> = {
    products?: Product[]
    count?: number
    limit?: number
    offset?: number
}

type ProductPrice = {
    calculated_amount?: number | null
    calculated_amount_with_tax?: number | null
    calculated_amount_without_tax?: number | null
    original_amount?: number | null
    original_amount_with_tax?: number | null
    original_amount_without_tax?: number | null
    currency_code?: string | null
    is_calculated_price_tax_inclusive?: boolean | null
    is_original_price_tax_inclusive?: boolean | null
}

type ProductVariantPricing = {
    calculated_price?: ProductPrice | null
    inventory_quantity?: number | null
}

type ProductFetchOptions = {
    pageSize?: number
    maxFetch?: number
}

type ProductPriceField = keyof Pick<ProductPrice, "calculated_amount" | "original_amount">
type ProductWithUnknownVariants = {
    variants?: unknown[] | null
}

function getResolvedVariantPrice(price: ProductPrice | null | undefined, field: ProductPriceField): number | null {
    if (!price) {
        return null
    }

    const baseAmount = price[field]

    if (field === "original_amount") {
        if (price.is_original_price_tax_inclusive && typeof baseAmount === "number") {
            return baseAmount
        }

        if (typeof price.original_amount_with_tax === "number") {
            return price.original_amount_with_tax
        }

        return typeof baseAmount === "number" ? baseAmount : null
    }

    if (price.is_calculated_price_tax_inclusive && typeof baseAmount === "number") {
        return baseAmount
    }

    if (typeof price.calculated_amount_with_tax === "number") {
        return price.calculated_amount_with_tax
    }

    return typeof baseAmount === "number" ? baseAmount : null
}

export async function fetchAllStoreProducts<Product>(event: H3Event, searchParams: URLSearchParams, options: ProductFetchOptions = {}) {
    const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
    const maxFetch = options.maxFetch ?? DEFAULT_MAX_FETCH

    const firstPage = await fetchStoreProductsPage<Product>(event, searchParams, pageSize, 0)
    const firstProducts = firstPage.products
    const reportedCount = Number(firstPage.count ?? firstProducts.length)
    const totalCount = Number.isFinite(reportedCount) ? Math.max(reportedCount, firstProducts.length) : firstProducts.length
    const targetCount = Math.min(totalCount, maxFetch)

    if (firstProducts.length >= targetCount) {
        return {
            products: firstProducts.slice(0, targetCount),
            count: totalCount
        }
    }

    if (reportedCount < firstProducts.length) {
        const products = [...firstProducts]
        let nextOffset = firstProducts.length

        while (products.length < maxFetch) {
            const remainingCount = maxFetch - products.length
            const nextPage = await fetchStoreProductsPage<Product>(event, searchParams, Math.min(pageSize, remainingCount), nextOffset)

            if (!nextPage.products.length) {
                break
            }

            products.push(...nextPage.products)
            nextOffset += nextPage.products.length

            if (nextPage.products.length < pageSize) {
                break
            }
        }

        return {
            products,
            count: Math.max(totalCount, products.length)
        }
    }

    const offsets: number[] = []
    for (let offset = firstProducts.length; offset < targetCount; offset += pageSize) {
        offsets.push(offset)
    }

    const remainingPages = await Promise.all(
        offsets.map((offset) => fetchStoreProductsPage<Product>(event, searchParams, Math.min(pageSize, targetCount - offset), offset))
    )

    const products = [...firstProducts]
    for (const page of remainingPages) {
        products.push(...page.products)
    }

    return {
        products: products.slice(0, targetCount),
        count: totalCount
    }
}

export async function fetchStoreProducts<Product>(event: H3Event, searchParams: URLSearchParams) {
    return await fetchMedusaJson<StoreProductsResponse<Product>>(event, `/store/products?${searchParams.toString()}`)
}

async function fetchStoreProductsPage<Product>(event: H3Event, searchParams: URLSearchParams, limit: number, offset: number) {
    const pageSearchParams = new URLSearchParams(searchParams)
    pageSearchParams.set("limit", String(limit))
    pageSearchParams.set("offset", String(offset))

    const response = await fetchStoreProducts<Product>(event, pageSearchParams)

    return {
        products: Array.isArray(response.products) ? response.products : [],
        count: response.count
    }
}

export function getProductPrices(product: ProductWithUnknownVariants, field: ProductPriceField = "calculated_amount") {
    return (product.variants ?? [])
        .map((variant) => getResolvedVariantPrice((variant as ProductVariantPricing).calculated_price, field))
        .filter((value): value is number => typeof value === "number")
}

export function getAggregatedProductPrice(product: ProductWithUnknownVariants, mode: "min" | "max" = "min", field: ProductPriceField = "calculated_amount") {
    const prices = getProductPrices(product, field)

    if (!prices.length) {
        return null
    }

    return mode === "max" ? Math.max(...prices) : Math.min(...prices)
}

export function getProductCurrencyCode(product: ProductWithUnknownVariants) {
    const variantWithCurrency = product.variants?.find(
        (variant) => (variant as ProductVariantPricing).calculated_price?.currency_code
    ) as ProductVariantPricing | undefined

    return variantWithCurrency?.calculated_price?.currency_code ?? null
}

export function isProductInStock(product: ProductWithUnknownVariants) {
    return (product.variants ?? []).some((variant) => Number((variant as ProductVariantPricing).inventory_quantity ?? 0) > 0)
}
