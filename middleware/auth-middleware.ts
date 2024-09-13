// middleware/auth.ts
import { useCustomerStore } from "~/stores/customer"

export default defineNuxtRouteMiddleware(async (to, from) => {
    const customerStore = useCustomerStore()

    if (!customerStore.customer) {
        const { data: customerData } = await useFetch("/api/auth")

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
