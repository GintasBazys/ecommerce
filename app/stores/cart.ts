import type { CartDTO as MedusaCart } from "@medusajs/types"

interface CartResponseInterface {
    cart: MedusaCart
    success?: boolean
    error?: string
    recovered?: boolean
    recoveryMessage?: string
}

export const useCartStore = defineStore("cart", () => {
    const cart = ref<MedusaCart>()
    const openCartDrawer = ref<boolean>(false)
    const recoveryMessage = ref<string | null>(null)

    const isUpdatingCart = ref<boolean>(false)

    let mutationChain: Promise<void> = Promise.resolve()
    let activeMutations = 0

    const queueCartMutation = (fn: () => Promise<void>): Promise<void> => {
        const run = async () => {
            activeMutations++
            isUpdatingCart.value = true
            try {
                await fn()
            } finally {
                activeMutations--
                if (activeMutations === 0) {
                    isUpdatingCart.value = false
                }
            }
        }

        mutationChain = mutationChain.then(run, run)
        return mutationChain
    }

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

    const clearRecoveryMessage = () => {
        recoveryMessage.value = null
    }

    const updateLineItem = (
        selectedVariant: {
            inventory_quantity: number
            id: string | null
            title: string
            calculated_price: { calculated_amount: number }
        },
        quantityToAdd = 1,
        updateItem = false
    ): Promise<void> => {
        return queueCartMutation(async () => {
            if (!cart.value || !cart.value.items) {
                console.warn("Cart or cart items are not initialized")
                return
            }

            if (!selectedVariant.id) {
                console.warn("Variant id is missing")
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
                            variant_id: selectedVariant.id,
                            quantity: newQuantity
                        }
                    })

                    if (response && response.success) {
                        clearRecoveryMessage()
                        cart.value = response.cart
                        openCartDrawer.value = true
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
                        clearRecoveryMessage()
                        cart.value = response.cart
                        openCartDrawer.value = true
                    }
                }
            } catch (error) {
                console.error("Failed to update line item:", error)
            }
        })
    }

    const removeLineItem = (lineItemId: string): Promise<void> => {
        if (!cart.value?.id) return Promise.resolve()

        return queueCartMutation(async () => {
            try {
                const response = await $fetch<CartResponseInterface>(`/api/cart/line-items/delete/${cart.value!.id}/${lineItemId}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" }
                })

                if (response?.success) {
                    recoveryMessage.value = response.recovered ? (response.recoveryMessage ?? null) : null
                    cart.value = response.cart.parent ?? response.cart
                }
            } catch (err) {
                console.error("Failed to remove item:", err)
            }
        })
    }

    const itemCount = computed<number>(() => cart.value?.items?.reduce((total, item) => total + Number(item.quantity), 0) || 0)

    return {
        updateLineItem,
        removeLineItem,
        itemCount,
        cart,
        recoveryMessage,
        clearRecoveryMessage,
        loadCart,
        openCartDrawer,
        isUpdatingCart
    }
})
