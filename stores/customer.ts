export const useCustomerStore = defineStore("customer", () => {
    const customer = ref<CustomerInterface | null>(null)

    const fetchCustomer = async () => {
        try {
            customer.value = await $fetch<CustomerInterface>("/api/auth", {
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
