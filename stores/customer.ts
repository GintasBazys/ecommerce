export const useCustomerStore = defineStore("customer", () => {
    const customer = ref(null)

    const fetchCustomer = async () => {
        try {
            const customerResponse = await $fetch("/api/auth", {
                credentials: "include"
            })
            customer.value = customerResponse
        } catch (error) {
            console.error("Failed to fetch data:", error)
        }
    }
    return {
        fetchCustomer,
        customer
    }
})
