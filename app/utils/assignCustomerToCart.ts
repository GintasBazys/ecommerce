import type { CartDTO } from "@medusajs/types"

export const assignCustomerToCart = async (cartStore: { cart: CartDTO | undefined }) => {
    if (!cartStore.cart) {
        console.warn("Cart is null, cannot assign customer.")
        return
    }

    const runtimeConfig = useRuntimeConfig()
    fetch(`${runtimeConfig.public.MEDUSA_URL}/store/carts/${cartStore.cart.id}/customer`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": runtimeConfig.public.PUBLISHABLE_KEY
        }
    })
        .then((res) => res.json())
        .then(({ cart }) => {
            cartStore.cart = cart ?? null
        })
}
