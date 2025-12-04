import type { CartDTO as MedusaCart } from "@medusajs/types"

interface CartResponseInterface {
    cart: MedusaCart
    success?: boolean
    error?: string
}

export const useCartStore = defineStore("cart", () => {
    const cart = ref<MedusaCart>()
    const openCartDrawer = ref(false)

    const loadCart = async () => {
        try {
            const regionId = useRegionStore().regionStoreId
            const res = await fetch(`/api/cart/cart?region_id=${regionId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            const response: CartResponseInterface = await res.json()
            if (response.cart) {
                cart.value = response.cart
            }
        } catch (error) {
            console.error("Error loading cart:", error)
        }
    }

    const updateLineItem = async (
        selectedVariant: {
            inventory_quantity: number
            id: string | null
            title: string
            calculated_price: { calculated_amount: number }
        },
        quantityToAdd = 1,
        updateItem = false
    ) => {
        if (!cart.value || !cart.value.items) {
            console.warn("Cart or cart items are not initialized")
            return
        }

        if (selectedVariant.inventory_quantity <= 0) {
            console.warn("Selected variant is out of stock")
            return
        }

        try {
            const existingItem = cart.value.items.find((item) => item.variant_id === selectedVariant.id && !item.id.startsWith("temp-"))

            if (existingItem) {
                const newQuantity = Number(!updateItem ? existingItem.quantity : 0) + quantityToAdd

                const response = await $fetch<CartResponseInterface>(`/api/cart/line-items/${cart.value.id}/${existingItem.id}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: {
                        quantity: newQuantity
                    }
                })

                if (response && response.success) {
                    cart.value = response.cart
                }
            } else {
                const response = await $fetch<CartResponseInterface>("/api/cart/line-items", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: {
                        cartId: cart.value.id,
                        variant_id: selectedVariant.id,
                        quantity: quantityToAdd
                    }
                })

                if (response && response.success) {
                    cart.value = response.cart
                    openCartDrawer.value = true
                }
            }
        } catch (error) {
            console.error("Failed to update line item:", error)
        }
    }

    const removeLineItem = async (lineItemId: string) => {
        if (!cart.value?.id) return

        try {
            const response = await $fetch<CartResponseInterface>(`/api/cart/line-items/delete/${cart.value.id}/${lineItemId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            })

            if (response?.success) {
                cart.value = response.cart.parent
            }
        } catch (err) {
            console.error("Failed to remove item:", err)
        }
    }

    const itemCount = computed<number>(() => cart.value?.items?.reduce((total, item) => total + Number(item.quantity), 0) || 0)

    return {
        updateLineItem,
        removeLineItem,
        itemCount,
        cart,
        loadCart,
        openCartDrawer
    }
})
