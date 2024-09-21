import type { Cart } from "@medusajs/medusa"

export const useCartStore = defineStore("cart", () => {
    const cart = ref<Cart>()

    const fetchCart = async () => {
        try {
            cart.value = await $fetch("/api/cart", {
                credentials: "include"
            })
        } catch (error) {
            console.error("Failed to fetch data:", error)
        }
    }
    return {
        fetchCart,
        cart
    }
})
