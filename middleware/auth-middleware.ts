// middleware/auth.ts
import { useCustomerStore } from "~/stores/customer"
import { useCartStore } from "~/stores/cartStore"
import type { Cart } from "@medusajs/medusa"

export default defineNuxtRouteMiddleware(async (to) => {
    const customerStore = useCustomerStore()
    const cartStore = useCartStore()

    if (!customerStore.customer) {
        const { data: customerData } = await useFetch<CustomerInterface>("/api/auth")

        if (customerData.value) {
            customerStore.customer = customerData.value
            const { data: cartData } = await useFetch<Cart>("/api/cart")
            if (cartData.value) {
                cartStore.cart = cartData.value
            }
        }
    }

    const isLoggedIn = !!customerStore.customer

    if (to.name === "login" && isLoggedIn) {
        return navigateTo("/account")
    }
    if (to.name === "account" && !isLoggedIn) {
        return navigateTo("/signin")
    }
})
