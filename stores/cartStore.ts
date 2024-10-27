import { ref, computed } from "vue"
import type { Cart } from "@medusajs/medusa"

export const useCartStore = defineStore("cart", () => {
    const cart = ref<Cart | null>(null)

    const fetchCart = async () => {
        try {
            cart.value = await $fetch("/api/cart", { credentials: "include" })
        } catch (error) {
            console.error("Failed to fetch cart:", error)
        }
    }

    const updateLineItem = async (cartId: string, variant_id: string, quantity: number) => {
        try {
            const response = await $fetch<CartResponse>("/api/cart/line-items", {
                method: "POST",
                body: { cartId, variant_id, quantity }
            })
            if (response) {
                cart.value = response.cart
            }
        } catch (error) {
            console.error("Failed to update line item:", error)
        }
    }

    const removeLineItem = async (cartId: string, lineItemId: string) => {
        try {
            const response = await $fetch<CartResponse>("/api/cart/delete-line-item", {
                method: "DELETE",
                body: { cartId, lineItemId }
            })
            if (response) {
                cart.value = response.cart
            }
        } catch (error) {
            console.error("Failed to remove line item:", error)
        }
    }

    const itemCount = computed(() => {
        return cart.value?.items.reduce((total, item) => total + item.quantity, 0) || 0
    })

    return {
        fetchCart,
        updateLineItem,
        removeLineItem,
        itemCount,
        cart
    }
})
