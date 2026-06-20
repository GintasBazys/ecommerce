import type { ProductDTO, ProductVariantDTO } from "@medusajs/types"
import type { MaybeRefOrGetter } from "vue"

import { usePostHog } from "~/composables/analytics/usePostHog"

type AddToCartSource = "product_page" | "product_card"

type UseAddToCartOptions = {
    product?: MaybeRefOrGetter<ProductDTO | null | undefined>
    source?: AddToCartSource
}

const DEFAULT_ADD_TO_CART_ERROR = "Could not add this product to your cart. Please try again."

export function useAddToCart(options: UseAddToCartOptions = {}) {
    const cartStore = useCartStore()
    const posthog = usePostHog()
    const adding = ref<boolean>(false)
    const errorMessage = ref<string | null>(null)

    function clearError(): void {
        errorMessage.value = null
    }

    async function addToCart(variant: ProductVariantDTO | null | undefined, quantity = 1): Promise<void> {
        if (!variant || adding.value) {
            return
        }

        adding.value = true
        clearError()

        try {
            await cartStore.updateLineItem(variant, quantity)

            const product = options.product ? toValue(options.product) : null

            posthog?.capture("product_added_to_cart", {
                source: options.source,
                product_id: product?.id,
                product_name: product?.title,
                variant_id: variant.id,
                variant_name: variant.title,
                quantity,
                price: variant.calculated_price?.calculated_amount
            })
        } catch (error) {
            console.error("Product add to cart failed", error)
            errorMessage.value = DEFAULT_ADD_TO_CART_ERROR
        } finally {
            adding.value = false
        }
    }

    return {
        adding: readonly(adding),
        errorMessage: readonly(errorMessage),
        addToCart,
        clearError
    }
}
