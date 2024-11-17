import { useCustomerStore } from "~/stores/customer"
export default defineNuxtRouteMiddleware(async (to) => {
    const customerStore = useCustomerStore()

    const isLoggedIn = !!customerStore.customer

    if (to.name === "account" && !isLoggedIn) {
        return navigateTo("/signin")
    }
})
