import type { CartDTO, CustomerDTO } from "@medusajs/types"

export default defineNuxtPlugin(async () => {
    if (!import.meta.server) {
        return
    }

    const config = useRuntimeConfig()
    const regionStore = useRegionStore()
    const productStore = useProductStore()
    const customerStore = useCustomerStore()
    const cartStore = useCartStore()

    const requestFetch = useRequestFetch()

    if (!regionStore.regions?.length) {
        await regionStore.fetchRegion()
    }

    const categoriesState = useState("categories", () => [])
    if (!categoriesState.value.length) {
        try {
            categoriesState.value = await requestFetch("/api/categories/categories", {
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "x-publishable-api-key": config.public.PUBLISHABLE_KEY
                }
            })
        } catch {
            categoriesState.value = []
        }
    }
    if (!productStore.categories?.length) {
        productStore.categories = categoriesState.value
    }

    const customerState = useState<CustomerDTO | null>("customer", () => null)
    if (customerState.value === null) {
        try {
            const { customer } = await requestFetch<{ customer: CustomerDTO | null }>("/api/account/me", {
                credentials: "include"
            })
            customerState.value = customer ?? null
        } catch {
            customerState.value = null
        }
    }
    customerStore.customer = customerState.value ?? null

    if (regionStore.regionStoreId) {
        const cartIdCookie = useCookie<string | null>("cart_id", {
            sameSite: "lax",
            path: "/",
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 30
        })

        const cartKey = `cart:${regionStore.regionStoreId}:${cartIdCookie.value ?? ""}`

        const cartState = useState<CartDTO | null | undefined>(cartKey, () => null)
        if (cartState.value === null) {
            try {
                const { cart } = await $fetch<{ cart: CartDTO | null | undefined }>(
                    `/api/cart/cart?region_id=${regionStore.regionStoreId}`,
                    {
                        headers: {
                            ...useRequestHeaders(["cookie"]),
                            "Content-Type": "application/json",
                            "x-publishable-api-key": config.public.PUBLISHABLE_KEY
                        }
                    }
                )
                cartState.value = cart ?? null
            } catch {
                cartState.value = null
            }
        }

        if (cartState.value) {
            cartStore.cart = cartState.value
        }

        if (customerStore.customer && !cartStore.cart?.customer_id) {
            await assignCustomerToCart(cartStore)
        }

        if (cartStore.cart?.id) {
            cartIdCookie.value = cartStore.cart.id
        }
    }
})
