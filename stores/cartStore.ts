import { ref, computed } from "vue"
import type { Cart as MedusaCart, LineItem } from "@medusajs/medusa"

interface CartItemExtension {
    product_description?: string | null
    product_title?: string | null
    product_handle?: string | null
    thumbnail?: string | null
    variant_title?: string | null
    variant_sku?: string | null
    unit_price?: number | null
    quantity?: number | null
    variant_id?: string | null
}

type ExtendedCartItem = LineItem & CartItemExtension

type ExtendedCart = Omit<MedusaCart, "items"> & {
    readonly object: "cart"
    items: ExtendedCartItem[]
}

interface CartResponseInterface {
    cart: ExtendedCart
    success?: boolean
    error?: string
}

export const useCartStore = defineStore("cart", () => {
    const cart = ref<ExtendedCart | null>(null)

    const fetchCart = async () => {
        try {
            cart.value = await $fetch("/api/cart", {
                credentials: "include"
            })
        } catch (error) {
            console.error("Failed to fetch cart:", error)
        }
    }

    const updateLineItem = async (cartId: string, variant_id: string, quantity: number) => {
        try {
            const response = await $fetch<CartResponseInterface>("/api/cart/line-items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: { cartId, variant_id, quantity }
            })

            if (response && response.success) {
                cart.value = response.cart
            } else {
                throw new Error("Unknown error")
            }
        } catch (error) {
            console.error("Failed to update line item:", error)
        }
    }

    const removeLineItem = async (lineItemId: string) => {
        if (!cart.value) {
            console.warn("No cart ID found")
            return
        }

        try {
            const cartId = cart.value?.id

            cart.value.items = cart.value.items.filter((item) => item.id !== lineItemId)

            const response = await fetch(`/api/cart/line-items/${cartId}/${lineItemId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            const data = await response.json()
            if (data.success && data.cart) {
                cart.value = data.cart
                return data.cart
            } else {
                throw new Error("Failed to remove item")
            }
        } catch (error) {
            console.error("Failed to remove item:", error)
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
