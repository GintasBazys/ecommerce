import { ref, computed } from "vue"
import type { CartDTO as MedusaCart, CartLineItemDTO } from "@medusajs/types"

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

type ExtendedCartItem = CartLineItemDTO & CartItemExtension

type ExtendedCart = Omit<MedusaCart, "items"> & {
    readonly object: "cart"
    items: ExtendedCartItem[]
    total: number
    subtotal: number
}

interface CartResponseInterface {
    cart: ExtendedCart
    success?: boolean
    error?: string
}

export const useCartStore = defineStore("cart", () => {
    const cart = ref<ExtendedCart | null>(null)

    const updateLineItem = async (
        selectedVariant: {
            inventory_quantity: number
            id: string | null
            title: string
            calculated_price: { calculated_amount: number }
        },
        quantityToAdd = 1
    ) => {
        if (!cart.value) {
            console.warn("Cart is not initialized")
            return
        }

        if (selectedVariant.inventory_quantity <= 0) {
            console.warn("Selected variant is out of stock")
            return
        }

        try {
            const existingItem = cart.value.items.find((item) => item.variant_id === selectedVariant.id && !item.id.startsWith("temp-"))

            if (existingItem) {
                const newQuantity = existingItem.quantity + quantityToAdd

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
                } else {
                    throw new Error(response.error || "Unknown error")
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
                } else {
                    throw new Error(response.error || "Unknown error")
                }
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

        const previousCart = JSON.parse(JSON.stringify(cart.value))

        try {
            const itemIndex = cart.value.items.findIndex((item) => item.id === lineItemId)
            if (itemIndex === -1) {
                console.warn("Item not found in cart")
                return
            }

            const itemToRemove = cart.value.items[itemIndex]

            const itemTotal = itemToRemove.unit_price * itemToRemove.quantity || 0
            cart.value.total = (cart.value.total ?? 0) - itemTotal
            cart.value.subtotal = (cart.value.subtotal ?? 0) - itemTotal
            cart.value.items.splice(itemIndex, 1)

            const response = await $fetch<CartResponseInterface>(`/api/cart/line-items/delete/${cart.value.id}/${lineItemId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (response && response.success) {
                cart.value.total = response.cart.total
                cart.value.subtotal = response.cart.subtotal
                cart.value.updated_at = response.cart.updated_at
            } else {
                throw new Error(response.error || "Unknown error")
            }
        } catch (error) {
            console.error("Failed to remove item:", error)
            cart.value = previousCart
        }
    }

    const itemCount = computed(() => {
        return cart.value?.items.reduce((total, item) => total + item.quantity, 0) || 0
    })

    return {
        updateLineItem,
        removeLineItem,
        itemCount,
        cart
    }
})
