import type { CustomerDTO } from "@medusajs/types"

type SocialProvider = "google" | "facebook"

function normalizeError(e: any): string {
    return e?.data?.message || e?.data?.statusMessage || e?.statusMessage || e?.message || "Something went wrong"
}

export function useCustomerAuth() {
    const customerStore = useCustomerStore()
    const cartStore = useCartStore()

    const loading = ref(false)
    const error = ref<string | null>(null)

    function clearError() {
        error.value = null
    }

    async function fetchMe() {
        loading.value = true
        error.value = null
        try {
            const res = await $fetch<{ success: boolean; customer: CustomerDTO | null }>("/api/account/me", {
                credentials: "include"
            })
            customerStore.customer = res.customer
            return res.customer
        } catch (e) {
            error.value = normalizeError(e)
            return null
        } finally {
            loading.value = false
        }
    }

    async function login(email: string, password: string, opts?: { loadCart?: boolean }) {
        loading.value = true
        error.value = null
        try {
            const res = await $fetch<{ success: boolean; customer: CustomerDTO | null }>("/api/account/login", {
                method: "POST",
                credentials: "include",
                body: { email, password }
            })

            if (!res.customer) {
                error.value = "Authentication failed"
                return null
            }

            customerStore.customer = res.customer

            if (opts?.loadCart) {
                await cartStore.loadCart()
            }

            return res.customer
        } catch (e) {
            error.value = normalizeError(e)
            return null
        } finally {
            loading.value = false
        }
    }

    async function register(
        payload: {
            email: string
            password: string
            first_name: string
            last_name: string
        },
        opts?: { loadCart?: boolean }
    ) {
        loading.value = true
        error.value = null
        try {
            const res = await $fetch<{ success: boolean; customer: CustomerDTO | null }>("/api/account/register", {
                method: "POST",
                credentials: "include",
                body: payload
            })

            if (!res.customer) {
                error.value = "Registration failed"
                return null
            }

            customerStore.customer = res.customer

            if (opts?.loadCart) {
                await cartStore.loadCart()
            }

            return res.customer
        } catch (e) {
            error.value = normalizeError(e)
            return null
        } finally {
            loading.value = false
        }
    }

    async function startSocialLogin(provider: SocialProvider, callbackPath: string) {
        error.value = null

        if (import.meta.server) {
            return
        }

        try {

            const res = await $fetch<{ success: boolean; location: string | null }>(`/api/social/${provider}`, {
                method: "POST",
                credentials: "include",
            })

            if (res.location) {
                window.location.href = res.location
            } else {
                error.value = "Social login failed"
            }
        } catch (e) {
            error.value = normalizeError(e)
        }
    }

    return {
        loading,
        error,
        clearError,
        fetchMe,
        login,
        register,
        startSocialLogin
    }
}
