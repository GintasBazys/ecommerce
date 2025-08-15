import type { CartDTO, CustomerDTO } from "@medusajs/types"

export default defineNuxtPlugin(async () => {
    const config = useRuntimeConfig()
    const regionStore = useRegionStore()
    const productStore = useProductStore()
    const customerStore = useCustomerStore()
    const cartStore = useCartStore()

    await regionStore.fetchRegion()

    const categories = await $fetch("/api/categories/categories", {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY
        }
    }).catch(() => null)
    if (categories) {
        productStore.categories = categories
    }

    const { customer } = await $fetch<{ customer: CustomerDTO }>("/api/account/auth", {
        credentials: "include",
        headers: useRequestHeaders(["cookie"])
    }).catch(() => ({ customer: null }))
    customerStore.customer = customer

    if (!regionStore.$state.regionStoreId) {
        return
    }

    const { cart } = await $fetch<{ cart: CartDTO }>(`/api/cart/cart?region_id=${regionStore.regionStoreId}`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY
        }
    }).catch(() => ({ cart: null }))
    if (cart) {
        cartStore.cart = cart
    }

    if (customerStore.customer && !cartStore.cart?.customer_id) {
        await assignCustomerToCart(cartStore)
    }

    if (import.meta.client && cartStore.cart?.id) {
        useCookie("cart_id").value = cartStore.cart.id
    }
})
