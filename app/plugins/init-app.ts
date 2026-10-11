import type { CartDTO, CustomerDTO } from "@medusajs/types"

type NavigationCategory = {
    id: string
    handle: string
    name: string
    imageUrl?: string | null
}

type RegionalReadiness = {
    status: "idle" | "loading" | "ready" | "error"
    regionStoreId: string | null
}

export function hasReadyRegionalContext(region: RegionalReadiness): region is RegionalReadiness & { status: "ready", regionStoreId: string } {
    return region.status === "ready" && typeof region.regionStoreId === "string" && region.regionStoreId.length > 0
}

const NON_AUTH_COOKIE_KEYS = new Set([
    "cart_id",
    "cookie_consent",
    "country_code",
    "locale",
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
    const wishlistStore = useWishlistStore()
    const customerStore = useCustomerStore()

    if (!import.meta.server) {
        if (import.meta.client && hasReadyRegionalContext(regionStore)) {
            window.setTimeout(() => {
                if (!cartStore.cart) {
                    void cartStore.loadCart()
                }

                if (customerStore.isAuthenticated) {
                    void wishlistStore.loadWishlist()
                }
            }, 1)
        }

        return
    }

    const config = useRuntimeConfig()
    const productStore = useProductStore()

    const requestFetch = useRequestFetch()
    const requestHeaders = useRequestHeaders(["cookie", "x-forwarded-proto"])
    const cookieHeader = requestHeaders.cookie || ""

    const regionPromise = hasReadyRegionalContext(regionStore)
        ? Promise.resolve({ success: true } as const)
        : regionStore.fetchRegion()

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

    const regionResult = await regionPromise

    if (regionResult.success && hasReadyRegionalContext(regionStore)) {
        const forwardedProto = requestHeaders["x-forwarded-proto"]?.split(",")[0]?.trim().toLowerCase()
        const requestProtocol = forwardedProto || useRequestURL().protocol.replace(":", "")
        const cartIdCookie = useCookie<string | null>("cart_id", {
            sameSite: "lax",
            path: "/",
            secure: requestProtocol === "https",
            maxAge: 60 * 60 * 24 * 30
        })

        const cartKey = `cart:${regionStore.regionStoreId}:${cartIdCookie.value ?? ""}`

        const cartState = useState<CartDTO | null | undefined>(cartKey, () => null)
        const cartPromise = (async () => {
            if (!cartIdCookie.value || cartState.value !== null) {
                return
            }

            try {
                const query = new URLSearchParams({ region_id: regionStore.regionStoreId })
                const { cart } = await $fetch<{ cart: CartDTO | null | undefined }>(
                    `/api/cart/cart?${query.toString()}`,
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

        if (customerStore.isAuthenticated) {
            await wishlistStore.loadWishlist()
        } else {
            wishlistStore.clearWishlist()
        }

        return
    }

    await Promise.all([categoriesPromise, customerPromise])

    if (!productStore.categories?.length) {
        productStore.categories = categoriesState.value
    }
    customerStore.setCustomer(customerState.value ?? null)

    wishlistStore.clearWishlist()
})
