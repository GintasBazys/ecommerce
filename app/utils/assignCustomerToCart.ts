type CartStore = ReturnType<typeof useCartStore>

function getErrorStatus(error: unknown): number | null {
    if (!error || typeof error !== "object") {
        return null
    }

    const maybeError = error as {
        statusCode?: unknown
        response?: {
            status?: unknown
        }
    }

    const statusCode = maybeError.statusCode
    if (typeof statusCode === "number") {
        return statusCode
    }

    const responseStatus = maybeError.response?.status
    if (typeof responseStatus === "number") {
        return responseStatus
    }

    return null
}

export async function assignCustomerToCart(cartStore: CartStore): Promise<void> {
    if (!cartStore.cart?.id) {
        return
    }

    let response: { cart: CartStore["cart"] }

    try {
        response = await $fetch<{ cart: CartStore["cart"] }>("/api/account/assign-customer", {
            method: "POST",
            credentials: "include",
            body: {
                cartId: cartStore.cart.id
            }
        })
    } catch (error: unknown) {
        if (getErrorStatus(error) === 401) {
            return
        }

        throw error
    }

    if (response.cart) {
        cartStore.cart = response.cart
    }
}
