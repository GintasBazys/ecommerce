export const assignCustomerToCart = async (cartStore: { cart: { id: string } | null }) => {
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
