import type { ProductDTO } from "@medusajs/types"
import type { WishlistItem, WishlistMutationResponse, WishlistResponse } from "~/types/wishlist"

export const useWishlistStore = defineStore("wishlist", () => {
    const items = ref<WishlistItem[]>([])
    const loading = ref<boolean>(false)
    const mutatingProductIds = ref<Set<string>>(new Set())

    const itemCount = computed<number>(() => items.value.length)
    const productIds = computed<Set<string>>(() => new Set(items.value.map((item) => item.product_id)))

    function isProductSaved(productId: string | null | undefined): boolean {
        return Boolean(productId && productIds.value.has(productId))
    }

    function isProductMutating(productId: string | null | undefined): boolean {
        return Boolean(productId && mutatingProductIds.value.has(productId))
    }

    function setProductMutating(productId: string, value: boolean): void {
        const next = new Set(mutatingProductIds.value)

        if (value) {
            next.add(productId)
        } else {
            next.delete(productId)
        }

        mutatingProductIds.value = next
    }

    function findItemByProductId(productId: string): WishlistItem | undefined {
        return items.value.find((item) => item.product_id === productId)
    }

    async function loadWishlist(): Promise<void> {
        const customerStore = useCustomerStore()
        const regionStore = useRegionStore()

        if (!customerStore.isAuthenticated || !regionStore.regionStoreId || !regionStore.selectedCountryCode) {
            items.value = []
            return
        }

        loading.value = true

        try {
            const params = new URLSearchParams({
                region_id: regionStore.regionStoreId,
                country_code: regionStore.selectedCountryCode
            })
            const response = await $fetch<WishlistResponse>(`/api/wishlist?${params.toString()}`, {
                credentials: "include"
            })

            items.value = response.wishlist.items ?? []
        } catch (error) {
            console.error("Failed to load wishlist", error)
            items.value = []
        } finally {
            loading.value = false
        }
    }

    async function addProduct(product: ProductDTO): Promise<void> {
        if (!product.id || isProductSaved(product.id) || isProductMutating(product.id)) {
            return
        }

        setProductMutating(product.id, true)

        try {
            const response = await $fetch<WishlistMutationResponse>("/api/wishlist", {
                method: "POST",
                credentials: "include",
                body: {
                    product_id: product.id
                }
            })

            if (response.wishlist_item) {
                items.value = [{ ...response.wishlist_item, product }, ...items.value]
            }
        } finally {
            setProductMutating(product.id, false)
        }
    }

    async function removeItem(wishlistItemId: string): Promise<void> {
        const wishlistItem = items.value.find((item) => item.id === wishlistItemId)
        const productId = wishlistItem?.product_id

        if (productId) {
            setProductMutating(productId, true)
        }

        try {
            await $fetch<WishlistMutationResponse>(`/api/wishlist/${wishlistItemId}`, {
                method: "DELETE",
                credentials: "include"
            })

            items.value = items.value.filter((item) => item.id !== wishlistItemId)
        } finally {
            if (productId) {
                setProductMutating(productId, false)
            }
        }
    }

    async function toggleProduct(product: ProductDTO): Promise<"added" | "removed" | "noop"> {
        if (!product.id) {
            return "noop"
        }

        const existingItem = findItemByProductId(product.id)

        if (existingItem) {
            await removeItem(existingItem.id)
            return "removed"
        }

        await addProduct(product)
        return "added"
    }

    function clearWishlist(): void {
        items.value = []
        mutatingProductIds.value = new Set()
    }

    return {
        items,
        loading,
        itemCount,
        productIds,
        isProductSaved,
        isProductMutating,
        loadWishlist,
        addProduct,
        removeItem,
        toggleProduct,
        clearWishlist
    }
})
