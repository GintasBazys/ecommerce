export default defineNuxtRouteMiddleware(async (to) => {
    const customerStore = useCustomerStore()

    const isLoggedIn = !!customerStore.customer

    if (typeof to.name === "string" && to.name.startsWith("account") && !isLoggedIn) {
        return navigateTo("/signin")
    }
})
