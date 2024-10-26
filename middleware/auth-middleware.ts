import { useCustomerStore } from "~/stores/customer"
import type { Customer } from "@medusajs/medusa"

export default defineNuxtRouteMiddleware(async (to) => {
    const customerStore = useCustomerStore()

    if (!customerStore.customer) {
        const { data: customerData } = await useFetch<Customer>("/api/auth")

        if (customerData.value) {
            customerStore.customer = customerData.value
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
