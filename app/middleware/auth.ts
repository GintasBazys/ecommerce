import { getCanonicalRouteName, localizePath } from "~/utils/locale"

export default defineNuxtRouteMiddleware(async (to) => {
    const customerStore = useCustomerStore()
    const localeStore = useLocaleStore()
    const routeName = getCanonicalRouteName(to.name)
    const isAccountRoute = routeName.startsWith("account")

    if (!isAccountRoute || customerStore.isAuthenticated) {
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
        return navigateTo(localizePath("/signin", localeStore.currentLocale))
    }
})
