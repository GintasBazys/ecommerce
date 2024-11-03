export default defineNuxtRouteMiddleware(async (to) => {
    const customerStore = useCustomerStore()

    const isLoggedIn = !!customerStore.customer

    if (to.name === "login" && isLoggedIn) {
        return navigateTo("/account")
    }
    if (to.name === "account" && !isLoggedIn) {
        return navigateTo("/signin")
    }
})
