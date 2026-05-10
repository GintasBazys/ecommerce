export default defineNuxtRouteMiddleware(async (to) => {
    const customerStore = useCustomerStore()

    if (typeof to.name !== "string" || !to.name.startsWith("account") || customerStore.isAuthenticated) {
        return
    }

    try {
        const fetchCustomer = import.meta.server ? useRequestFetch() : $fetch
        const { customer } = await fetchCustomer<{ customer: typeof customerStore.customer }>("/api/account/me", {
            credentials: "include"
        })

        customerStore.setCustomer(customer ?? null)
    } catch {
        customerStore.clearCustomer()
    }

    if (!customerStore.isAuthenticated) {
        return navigateTo("/signin")
    }
})
