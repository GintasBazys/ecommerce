type CartStore = ReturnType<typeof useCartStore>

export async function assignCustomerToCart(cartStore: CartStore): Promise<void> {
    if (!cartStore.cart?.id) {
        return
    }

    const response = await $fetch<{ cart: CartStore["cart"] }>("/api/cart/assign-customer", {
        method: "POST",
        body: {
            cart_id: cartStore.cart.id
        }
    })

    if (response.cart) {
        cartStore.cart = response.cart
    }
}