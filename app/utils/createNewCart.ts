export const createNewCart = async (cartStore: { $patch: (arg0: { cart: CartResponse | null }) => void }) => {
    const regionStore = useRegionStore()
    if (regionStore.status !== "ready" || !regionStore.regionStoreId) {
        return null
    }

    try {
        cartStore.$patch({ cart: null })
        const query = new URLSearchParams({ region_id: regionStore.regionStoreId, force_new: "1" })
        const response = await fetch(`/api/cart/cart?${query.toString()}`, {
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
