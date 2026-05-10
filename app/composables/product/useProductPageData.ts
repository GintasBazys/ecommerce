import type { ProductDTO, ProductVariantDTO } from "@medusajs/types"
import type { ComputedRef, Ref } from "vue"
import type { ProductCategorySummary, ProductListResponse, ProductTag } from "~/types/product"

import { PRODUCT_URL_HANDLE } from "~/utils/consts"

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0
}

function normalizeProductText(value: unknown, fallbackValue: string): string {
    return isNonEmptyString(value) ? value.trim() : fallbackValue
}

export function useProductPageData(options: {
    handle: ComputedRef<string>
    routePath: ComputedRef<string> | Ref<string>
    regionStoreId: Ref<string | null | undefined>
    selectedCountryCode: Ref<string | null | undefined>
    absoluteUrl: (_path: string) => string
}) {
    const productParams = computed(() => ({
        handle: options.handle.value,
        ...(options.regionStoreId.value ? { region_id: options.regionStoreId.value } : {}),
        ...(options.selectedCountryCode.value ? { country_code: options.selectedCountryCode.value } : {})
    }))

    const { data, pending: productPending, error: productError, refresh: refreshProduct } = useFetch<ProductListResponse>("/api/products/products", {
        params: productParams
    })

    const product = computed<ProductDTO | null>(() => data.value?.products?.[0] ?? null)
    const productNotFound = computed<boolean>(() => !productPending.value && !productError.value && !product.value)
    const productTitle = computed<string>(() => normalizeProductText(product.value?.title, "Product"))
    const productSubtitle = computed<string | undefined>(() => (isNonEmptyString(product.value?.subtitle) ? product.value.subtitle.trim() : undefined))
    const productDescription = computed<string>(() =>
        normalizeProductText(
            product.value?.description || product.value?.subtitle,
            "Explore this product with clear pricing, availability, and checkout details."
        )
    )
    const productVariants = computed<ProductVariantDTO[]>(() => (Array.isArray(product.value?.variants) ? product.value.variants : []))
    const productTags = computed<ProductTag[]>(() => (Array.isArray(product.value?.tags) ? product.value.tags : []))
    const productMetadata = computed<Record<string, unknown>>(() => {
        const metadata = product.value?.metadata

        return metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>) : {}
    })

    const primaryCategory = computed<ProductCategorySummary | null>(() => {
        const category = product.value?.categories?.[0]

        if (!category?.id) {
            return null
        }

        return {
            id: category.id,
            name: "name" in category && typeof category.name === "string" ? category.name : null
        }
    })

    const productPath = computed<string>(() => {
        if (product.value?.handle) {
            return `${PRODUCT_URL_HANDLE}/${product.value.handle}`
        }

        return options.routePath.value
    })

    const productUrl = computed<string>(() => options.absoluteUrl(productPath.value))

    const relatedData = ref<ProductListResponse>({ products: [] })
    const relatedPending = ref<boolean>(false)
    const relatedError = ref<unknown | null>(null)
    let relatedRequestId = 0

    async function refreshRelatedProducts(): Promise<void> {
        const currentProductId = product.value?.id

        if (!currentProductId || !options.regionStoreId.value || !options.selectedCountryCode.value) {
            relatedData.value = { products: [] }
            return
        }

        const requestId = ++relatedRequestId
        relatedPending.value = true
        relatedError.value = null

        try {
            const response = await $fetch<ProductListResponse>("/api/products/products", {
                query: {
                    ...(primaryCategory.value?.id ? { category_id: primaryCategory.value.id } : {}),
                    region_id: options.regionStoreId.value,
                    country_code: options.selectedCountryCode.value,
                    limit: 8
                }
            })

            if (requestId === relatedRequestId) {
                relatedData.value = response
            }
        } catch (error) {
            if (requestId === relatedRequestId) {
                relatedError.value = error
                relatedData.value = { products: [] }
            }
        } finally {
            if (requestId === relatedRequestId) {
                relatedPending.value = false
            }
        }
    }

    watch(
        () => [product.value?.id, primaryCategory.value?.id, options.regionStoreId.value, options.selectedCountryCode.value],
        () => {
            void refreshRelatedProducts()
        },
        { immediate: true }
    )

    const relatedProducts = computed<ProductDTO[]>(() => {
        const currentProductId = product.value?.id

        return (relatedData.value?.products ?? []).filter((item) => item.id !== currentProductId).slice(0, 4)
    })

    return {
        product,
        productPending,
        productError,
        productNotFound,
        refreshProduct,
        productTitle,
        productSubtitle,
        productDescription,
        productVariants,
        productTags,
        productMetadata,
        primaryCategory,
        productPath,
        productUrl,
        relatedProducts,
        relatedPending,
        relatedError,
        refreshRelatedProducts
    }
}
