import type { Customer } from "@medusajs/medusa"

export const useCustomerStore = defineStore("customer", () => {
    const customer = ref<Customer | null>(null)

    const fetchCustomer = async () => {
        try {
            customer.value = await $fetch<Customer>("/api/auth", {
                credentials: "include"
            })
        } catch (error) {
            console.error("Failed to fetch data:", error)
        }
    }
    return {
        fetchCustomer,
        customer
    }
})
