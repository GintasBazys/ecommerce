export const createNewCart = async (cartStore: { $patch: (arg0: { cart: CartResponse | null }) => void }) => {
    try {
        cartStore.$patch({ cart: null })
        const response = await fetch(`/api/cart/cart?region_id=${useRegionStore().regionStoreId}&force_new=1`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        })

        if (!response.ok) {
            console.error("Error creating new cart:", await response.text())
            return null
        }

        const newCart = await response.json()
        const nextCart = newCart.cart ?? newCart
        cartStore.$patch({ cart: nextCart })

        return nextCart
    } catch (error) {
        console.error("Error initializing new cart:", error)
        return null
    }
}
