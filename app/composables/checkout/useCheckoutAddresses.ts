import type { ComputedRef } from "vue"
import type { Address } from "@/types/interfaces"
import type { CustomerAddressDTO } from "@medusajs/types"
import type { AddressErrors, CheckoutCart, EditableAddressField } from "~/types/checkout"
import { checkoutAddressRules, clearValidationErrors, runValidationRules } from "~/utils/checkoutValidation"

const addressFields = ["first_name", "last_name", "address_1", "city", "province", "postal_code", "country_code", "phone"] as const
type CheckoutAddressSource = Partial<Record<(typeof addressFields)[number] | "address_2" | "company", string | null>>

function createAddress(): Address {
    return {
        first_name: "",
        last_name: "",
        address_1: "",
        address_2: "",
        city: "",
        province: "",
        postal_code: "",
        country_code: "",
        phone: "",
        company: ""
    }
}

function createAddressErrors(): AddressErrors {
    return {
        first_name: "",
        last_name: "",
        address_1: "",
        city: "",
        province: "",
        postal_code: "",
        country_code: "",
        phone: ""
    }
}

export function useCheckoutAddresses(options: { hasAuthenticatedIdentity: ComputedRef<boolean> }) {
    const billingAddress = reactive<Address>(createAddress())
    const shippingAddress = reactive<Address>(createAddress())
    const billingErrors = reactive<AddressErrors>(createAddressErrors())
    const shippingErrors = reactive<AddressErrors>(createAddressErrors())
    const useSeparateShipping = shallowRef<boolean>(false)
    const savedAddresses = shallowRef<CustomerAddressDTO[]>([])
    const isSavedAddressesLoading = shallowRef<boolean>(false)
    const savedAddressesError = shallowRef<string | null>(null)
    const selectedBillingSavedAddressId = shallowRef<string>("")
    const selectedShippingSavedAddressId = shallowRef<string>("")

    function validateAddressFields(address: Address, errors: AddressErrors): boolean {
        clearValidationErrors(errors)

        for (const field of addressFields) {
            errors[field] = runValidationRules(address[field], [checkoutAddressRules.required])
        }

        errors.phone = runValidationRules(address.phone, [checkoutAddressRules.required, checkoutAddressRules.phone])

        return !Object.values(errors).some(Boolean)
    }

    function validateAddressForm(): boolean {
        const billingValid = validateAddressFields(billingAddress, billingErrors)
        const shippingValid = useSeparateShipping.value ? validateAddressFields(shippingAddress, shippingErrors) : true

        if (!useSeparateShipping.value) {
            clearValidationErrors(shippingErrors)
        }

        return billingValid && shippingValid
    }

    function resetAddress(address: Address): void {
        applyAddress(address, null)
    }

    function applyAddress(target: Address, source?: CheckoutAddressSource | null): void {
        target.first_name = source?.first_name ?? ""
        target.last_name = source?.last_name ?? ""
        target.address_1 = source?.address_1 ?? ""
        target.address_2 = source?.address_2 ?? ""
        target.city = source?.city ?? ""
        target.province = source?.province ?? ""
        target.postal_code = source?.postal_code ?? ""
        target.country_code = source?.country_code?.toLowerCase() ?? ""
        target.phone = source?.phone ?? ""
        target.company = source?.company ?? ""
    }

    function hasAddressDetails(address?: CheckoutAddressSource | null): boolean {
        return Boolean(address?.address_1 || address?.city || address?.postal_code || address?.country_code)
    }

    function getAddressComparisonSignature(address?: CheckoutAddressSource | null): string {
        return JSON.stringify({
            first_name: address?.first_name ?? "",
            last_name: address?.last_name ?? "",
            address_1: address?.address_1 ?? "",
            address_2: address?.address_2 ?? "",
            city: address?.city ?? "",
            province: address?.province ?? "",
            postal_code: address?.postal_code ?? "",
            country_code: address?.country_code?.toLowerCase() ?? "",
            phone: address?.phone ?? "",
            company: address?.company ?? ""
        })
    }

    function getMatchingSavedAddressId(address: Address): string {
        if (!hasAddressDetails(address)) {
            return ""
        }

        const signature = getAddressComparisonSignature(address)
        return savedAddresses.value.find((savedAddress) => getAddressComparisonSignature(savedAddress) === signature)?.id ?? ""
    }

    function syncSelectedSavedAddressIds(): void {
        selectedBillingSavedAddressId.value = getMatchingSavedAddressId(billingAddress)
        selectedShippingSavedAddressId.value = useSeparateShipping.value ? getMatchingSavedAddressId(shippingAddress) : ""
    }

    function applyDefaultSavedAddresses(): void {
        syncSelectedSavedAddressIds()

        const defaultBillingAddress = savedAddresses.value.find((address) => address.is_default_billing)
        const defaultShippingAddress = savedAddresses.value.find((address) => address.is_default_shipping)

        if (defaultBillingAddress?.id && !selectedBillingSavedAddressId.value && !hasAddressDetails(billingAddress)) {
            updateSelectedBillingSavedAddress(defaultBillingAddress.id)
        }

        if (!defaultShippingAddress?.id || selectedShippingSavedAddressId.value || hasAddressDetails(shippingAddress)) {
            return
        }

        if (defaultShippingAddress.id === selectedBillingSavedAddressId.value) {
            return
        }

        useSeparateShipping.value = true
        updateSelectedShippingSavedAddress(defaultShippingAddress.id)
    }

    async function loadSavedAddresses(): Promise<void> {
        if (!options.hasAuthenticatedIdentity.value) {
            savedAddresses.value = []
            selectedBillingSavedAddressId.value = ""
            selectedShippingSavedAddressId.value = ""
            return
        }

        isSavedAddressesLoading.value = true
        savedAddressesError.value = null

        try {
            const response = await $fetch<{ addresses: CustomerAddressDTO[]; count: number }>("/api/account/get-addresses", {
                credentials: "include",
                query: { limit: 12, offset: 0 }
            })

            savedAddresses.value = response.addresses.filter((address) => Boolean(address.id && address.address_1))
            applyDefaultSavedAddresses()
        } catch (error) {
            console.error("Failed to load saved checkout addresses:", error)
            savedAddressesError.value = "Could not load saved addresses. You can still enter a new address."
        } finally {
            isSavedAddressesLoading.value = false
        }
    }

    function applySavedAddress(addressId: string, target: "billing" | "shipping"): void {
        const savedAddress = savedAddresses.value.find((address) => address.id === addressId)

        if (!savedAddress) {
            return
        }

        applyAddress(target === "billing" ? billingAddress : shippingAddress, savedAddress)
        clearValidationErrors(target === "billing" ? billingErrors : shippingErrors)
    }

    function updateSelectedBillingSavedAddress(addressId: string): void {
        selectedBillingSavedAddressId.value = addressId
        applySavedAddress(addressId, "billing")
    }

    function updateSelectedShippingSavedAddress(addressId: string): void {
        selectedShippingSavedAddressId.value = addressId
        applySavedAddress(addressId, "shipping")
    }

    function updateBillingAddressField(payload: { field: EditableAddressField; value: string }): void {
        selectedBillingSavedAddressId.value = ""
        billingAddress[payload.field] = payload.value
    }

    function updateShippingAddressField(payload: { field: EditableAddressField; value: string }): void {
        selectedShippingSavedAddressId.value = ""
        shippingAddress[payload.field] = payload.value
    }

    function syncAddressesFromCart(currentCart: CheckoutCart | null): void {
        applyAddress(billingAddress, currentCart?.billing_address as CheckoutAddressSource | null)

        const currentShipping = currentCart?.shipping_address as CheckoutAddressSource | null
        const currentBilling = currentCart?.billing_address as CheckoutAddressSource | null

        if (currentShipping?.address_1) {
            applyAddress(shippingAddress, currentShipping)
            useSeparateShipping.value = getAddressComparisonSignature(currentShipping) !== getAddressComparisonSignature(currentBilling)
            return
        }

        resetAddress(shippingAddress)
        useSeparateShipping.value = false
    }

    return {
        billingAddress,
        shippingAddress,
        billingErrors,
        shippingErrors,
        useSeparateShipping,
        savedAddresses,
        isSavedAddressesLoading,
        savedAddressesError,
        selectedBillingSavedAddressId,
        selectedShippingSavedAddressId,
        validateAddressForm,
        loadSavedAddresses,
        updateSelectedBillingSavedAddress,
        updateSelectedShippingSavedAddress,
        updateBillingAddressField,
        updateShippingAddressField,
        syncAddressesFromCart
    }
}
