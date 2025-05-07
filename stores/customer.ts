import type { CustomerDTO } from "@medusajs/types"
import type { CustomerAuthResponseInterface } from "@/types/interfaces"

export const useCustomerStore = defineStore(
    "customer",
    () => {
        const customer = ref<CustomerDTO | null>(null)
        const config = useRuntimeConfig()

        async function fetchCustomer() {
            try {
                const data = await $fetch<CustomerAuthResponseInterface>("/api/account/auth", {
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
    },
    {
        persist: true
    }
)
