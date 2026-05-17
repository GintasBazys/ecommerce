import type { ProductDTO } from "@medusajs/types"
import type { ComputedRef, Ref } from "vue"
import type { ProductListResponse } from "~/types/product"

const RECENTLY_VIEWED_PRODUCTS_KEY = "recently-viewed-products"
const MAX_STORED_HANDLES = 8
const MAX_VISIBLE_PRODUCTS = 4

function normalizeHandle(value: unknown): string | null {
    if (typeof value !== "string") {
        return null
    }

    const handle = value.trim()

    return handle.length ? handle : null
}

function readStoredHandles(): string[] {
    if (!import.meta.client) {
        return []
    }

    try {
        const storedValue = window.localStorage.getItem(RECENTLY_VIEWED_PRODUCTS_KEY)
        const parsedValue: unknown = storedValue ? JSON.parse(storedValue) : []

        if (!Array.isArray(parsedValue)) {
            return []
        }

        return parsedValue.map(normalizeHandle).filter((handle): handle is string => Boolean(handle)).slice(0, MAX_STORED_HANDLES)
    } catch (error) {
        console.error("Recently viewed products could not be read", error)
        return []
    }
}

function writeStoredHandles(handles: string[]): void {
    if (!import.meta.client) {
        return
    }

    try {
        window.localStorage.setItem(RECENTLY_VIEWED_PRODUCTS_KEY, JSON.stringify(handles.slice(0, MAX_STORED_HANDLES)))
    } catch (error) {
        console.error("Recently viewed products could not be saved", error)
    }
}

function rememberHandle(handle: string): void {
    const handles = readStoredHandles()
    writeStoredHandles([handle, ...handles.filter((item) => item !== handle)])
}

export function useRecentlyViewedProducts(options: {
    product: ComputedRef<ProductDTO | null>
    regionStoreId: Ref<string | null | undefined>
    selectedCountryCode: Ref<string | null | undefined>
}) {
    const products = ref<ProductDTO[]>([])
    const pending = ref<boolean>(false)
    const error = ref<unknown | null>(null)
    let requestId = 0

    async function fetchProductsByHandles(handles: string[]): Promise<ProductDTO[]> {
        const response = await $fetch<ProductListResponse>("/api/products/products", {
            query: {
                handles: handles.join(","),
                region_id: options.regionStoreId.value,
                country_code: options.selectedCountryCode.value,
                view: "card",
                limit: handles.length
            }
        })

        return response.products ?? []
    }

    async function refreshRecentlyViewedProducts(): Promise<void> {
        const currentRequestId = ++requestId
        const currentHandle = normalizeHandle(options.product.value?.handle)

        if (!import.meta.client || !currentHandle || !options.regionStoreId.value || !options.selectedCountryCode.value) {
            products.value = []
            pending.value = false
            return
        }

        const handles = readStoredHandles().filter((handle) => handle !== currentHandle).slice(0, MAX_VISIBLE_PRODUCTS)

        if (!handles.length) {
            products.value = []
            pending.value = false
            error.value = null
            return
        }

        pending.value = true
        error.value = null

        try {
            const fetchedProducts = await fetchProductsByHandles(handles)

            if (currentRequestId === requestId) {
                products.value = fetchedProducts.filter((product) => Boolean(product.id))
            }
        } catch (fetchError) {
            if (currentRequestId === requestId) {
                error.value = fetchError
                products.value = []
            }
        } finally {
            if (currentRequestId === requestId) {
                pending.value = false
            }
        }
    }

    watch(
        () => [options.product.value?.id, options.product.value?.handle, options.regionStoreId.value, options.selectedCountryCode.value],
        async () => {
            const currentHandle = normalizeHandle(options.product.value?.handle)

            await refreshRecentlyViewedProducts()

            if (currentHandle) {
                rememberHandle(currentHandle)
            }
        },
        { immediate: true }
    )

    return {
        recentlyViewedProducts: products,
        recentlyViewedPending: pending,
        recentlyViewedError: error,
        refreshRecentlyViewedProducts
    }
}
