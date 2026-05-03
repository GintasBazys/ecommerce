export default defineNuxtRouteMiddleware(async (to) => {
    const customerStore = useCustomerStore()

    if (typeof to.name === "string" && to.name.startsWith("account") && !customerStore.isAuthenticated) {
        return navigateTo("/signin")
    }
})
