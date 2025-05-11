export const createNewCart = async (cartStore: { $patch: (arg0: { cart: CartResponse | null }) => void }) => {
    const runtimeConfig = useRuntimeConfig()
    try {
        const cartCookieToDelete = useCookie("cart_id")
        cartCookieToDelete.value = null
        cartStore.$patch({ cart: null })
        const response = await fetch(`/api/cart/cart?region_id=${useRegionStore().regionStoreId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": runtimeConfig.public.PUBLISHABLE_KEY
            },
            credentials: "omit"
        })

        if (!response.ok) {
            console.error("Error creating new cart:", await response.text())
            return null
        }

        const newCart = await response.json()
        cartStore.$patch({ cart: newCart.cart })
        const cartCookie = useCookie("cart_id")
        cartCookie.value = newCart.id
    } catch (error) {
        console.error("Error initializing new cart:", error)
        return null
    }
}
