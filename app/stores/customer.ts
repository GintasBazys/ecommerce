import type { CustomerDTO } from "@medusajs/types"

type CustomerProfileUpdate = Pick<CustomerDTO, "first_name" | "last_name" | "phone" | "company_name">

export const useCustomerStore = defineStore("customer", () => {
    const customer = ref<CustomerDTO | null>(null)

    const isAuthenticated = computed<boolean>(() => Boolean(customer.value?.id))
    const customerId = computed<string | null>(() => customer.value?.id ?? null)
    const customerEmail = computed<string | null>(() => customer.value?.email ?? null)
    const customerFullName = computed<string>(() => {
        const firstName = customer.value?.first_name?.trim() ?? ""
        const lastName = customer.value?.last_name?.trim() ?? ""

        return `${firstName} ${lastName}`.trim() || "Account member"
    })

    function setCustomer(nextCustomer: CustomerDTO | null): void {
        customer.value = nextCustomer
    }

    function clearCustomer(): void {
        customer.value = null
    }

    function updateCustomerProfile(profile: CustomerProfileUpdate): void {
        if (!customer.value) {
            return
        }

        customer.value = {
            ...customer.value,
            ...profile
        }
    }

    return {
        customer,
        isAuthenticated,
        customerId,
        customerEmail,
        customerFullName,
        setCustomer,
        clearCustomer,
        updateCustomerProfile
    }
})
