import type { CartDTO, CustomerDTO } from "@medusajs/types"

export default defineNuxtPlugin(async () => {
    const config = useRuntimeConfig()
    const regionStore = useRegionStore()
    const productStore = useProductStore()
    const customerStore = useCustomerStore()
    const cartStore = useCartStore()

    await regionStore.fetchRegion()

    productStore.categories = await $fetch("/api/categories/categories", {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY
        }
    })

    try {
        const { customer } = await $fetch<{ customer: CustomerDTO }>("/api/account/auth", {
            credentials: "include",
            headers: useRequestHeaders(["cookie"])
        })
        customerStore.customer = customer
    } catch {
        customerStore.customer = null
    }

    const { cart } = await $fetch<{ cart: CartDTO }>(`/api/cart/cart?regionId=${regionStore.regionStoreId}`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY
        }
    })
    cartStore.cart = cart

    if (customerStore.customer && !cartStore.cart?.customer_id) {
        await assignCustomerToCart(cartStore)
    }

    if (import.meta.client && cartStore.cart?.id) {
        useCookie("cart_id").value = cartStore.cart.id
    }
})
