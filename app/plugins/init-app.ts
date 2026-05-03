import type { CartDTO, CustomerDTO } from "@medusajs/types"

type NavigationCategory = {
    id: string
    handle: string
    name: string
    imageUrl?: string | null
}

const NON_AUTH_COOKIE_KEYS = new Set([
    "announcement_bar_dismissed",
    "cart_id",
    "cookie_consent",
    "country_code",
    "region_id"
])

function hasCustomerSessionHint(cookieHeader: string): boolean {
    return cookieHeader
        .split(";")
        .map((entry) => entry.trim().split("=")[0]?.trim() || "")
        .filter((cookieName) => cookieName.length > 0)
        .some((cookieName) => !NON_AUTH_COOKIE_KEYS.has(cookieName))
}

export default defineNuxtPlugin(async () => {
    const cartStore = useCartStore()
    const regionStore = useRegionStore()

    if (!import.meta.server) {
        if (import.meta.client && regionStore.regionStoreId && !cartStore.cart) {
            window.setTimeout(() => {
                if (!cartStore.cart) {
                    void cartStore.loadCart()
                }
            }, 1)
        }

        return
    }

    const config = useRuntimeConfig()
    const productStore = useProductStore()
    const customerStore = useCustomerStore()

    const requestFetch = useRequestFetch()
    const requestHeaders = useRequestHeaders(["cookie"])
    const cookieHeader = requestHeaders.cookie || ""

    const regionPromise = regionStore.regions?.length ? Promise.resolve() : regionStore.fetchRegion()

    const categoriesState = useState<NavigationCategory[]>("categories", () => [])
    const categoriesPromise = (async () => {
        if (categoriesState.value.length) {
            return
        }

        try {
            categoriesState.value = await requestFetch("/api/categories/navigation", {
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "x-publishable-api-key": config.public.PUBLISHABLE_KEY
                }
            })
        } catch {
            categoriesState.value = []
        }
    })()

    const customerState = useState<CustomerDTO | null>("customer", () => null)
    const customerPromise = (async () => {
        if (customerState.value !== null || !hasCustomerSessionHint(cookieHeader)) {
            return
        }

        try {
            const { customer } = await requestFetch<{ customer: CustomerDTO | null }>("/api/account/me", {
                credentials: "include"
            })
            customerState.value = customer ?? null
        } catch {
            customerState.value = null
        }
    })()

    await regionPromise

    if (regionStore.regionStoreId) {
        const cartIdCookie = useCookie<string | null>("cart_id", {
            sameSite: "lax",
            path: "/",
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 30
        })

        const cartKey = `cart:${regionStore.regionStoreId}:${cartIdCookie.value ?? ""}`

        const cartState = useState<CartDTO | null | undefined>(cartKey, () => null)
        const cartPromise = (async () => {
            if (!cartIdCookie.value || cartState.value !== null) {
                return
            }

            try {
                const { cart } = await $fetch<{ cart: CartDTO | null | undefined }>(
                    `/api/cart/cart?region_id=${regionStore.regionStoreId}`,
                    {
                        headers: {
                            ...requestHeaders,
                            "Content-Type": "application/json",
                            "x-publishable-api-key": config.public.PUBLISHABLE_KEY
                        }
                    }
                )
                cartState.value = cart ?? null
            } catch {
                cartState.value = null
            }
        })()

        await Promise.all([categoriesPromise, customerPromise, cartPromise])

        if (!productStore.categories?.length) {
            productStore.categories = categoriesState.value
        }
        customerStore.setCustomer(customerState.value ?? null)

        if (cartState.value) {
            cartStore.cart = cartState.value
        }

        if (customerStore.isAuthenticated && !cartStore.cart?.customer_id) {
            await assignCustomerToCart(cartStore)
        }

        if (cartStore.cart?.id) {
            cartIdCookie.value = cartStore.cart.id
        }

        return
    }

    await Promise.all([categoriesPromise, customerPromise])

    if (!productStore.categories?.length) {
        productStore.categories = categoriesState.value
    }
    customerStore.setCustomer(customerState.value ?? null)
})
