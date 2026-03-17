import type { CartDTO } from "@medusajs/types"

export const assignCustomerToCart = async (cartStore: { cart: CartDTO | null }) => {
    const cartId = cartStore.cart?.id
    if (!cartId) return

    const headers = import.meta.server ? useRequestHeaders(["cookie"]) : {}

    const { cart } = await $fetch<{ cart: CartDTO }>("/api/account/assign-customer", {
        method: "POST",
        headers,
        body: { cartId }
    })

    cartStore.cart = cart
}
