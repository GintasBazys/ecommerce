import type { CartDTO, CustomerDTO } from "@medusajs/types"

export default defineNuxtPlugin(async () => {
    const config = useRuntimeConfig()
    const regionStore = useRegionStore()
    const productStore = useProductStore()
    const customerStore = useCustomerStore()
    const cartStore = useCartStore()

    const regionsRes = await fetch(`${config.public.MEDUSA_URL}/store/regions`, {
        method: "GET",
        headers: {
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
            "Content-Type": "application/json"
        }
    })
    if (!regionsRes.ok) {
        console.error("Failed to fetch regions:", regionsRes.statusText)
        throw new Error(`Failed to fetch regions: ${regionsRes.statusText}`)
    }
    const { regions } = await regionsRes.json()
    if (!regions?.length) {
        throw new Error("No regions returned from Medusa")
    }
    regionStore.regionStoreId = regions[0].id

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

    const { cart } = await $fetch<{ cart: CartDTO }>(`/api/cart/cart?regionId=${regionStore.regionStoreId}`, {
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
