import type { Customer } from "@medusajs/medusa"

export const useCustomerStore = defineStore("customer", () => {
    const customer = ref<Customer | null>(null)
    const config = useRuntimeConfig()

    const fetchCustomer = async () => {
        try {
            const data = await $fetch<CustomerAuthResponseInterface>("/api/auth", {
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "x-publishable-api-key": config.public.PUBLISHABLE_KEY
                }
            })
            customer.value = data.customer
        } catch (error) {
            console.error("Error fetching customer data:", error)
            customer.value = null
        }
    }
    return {
        fetchCustomer,
        customer
    }
})
