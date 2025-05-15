<script setup lang="ts">
import type { VForm } from "vuetify/components"
import type { CartDTO } from "@medusajs/types"

interface Address {
    first_name: string
    last_name: string
    address_1: string
    address_2?: string
    city: string
    province?: string
    postal_code: string
    country_code: string
    phone?: string
    company?: string
}

const { cart } = storeToRefs(useCartStore())
const { regionCountries } = storeToRefs(useRegionStore())

const form = ref<VForm | null>(null)
const billingAddress = reactive<Address>({
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
})
const shippingAddress = reactive<Address>({
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
})
const useSeparateShipping = ref(false)
const router = useRouter()

const onSubmit = async () => {
    const isValid = await form.value?.validate()
    if (!isValid || !cart.value) {
        return
    }

    const payload: { cartId: string; billing_address: Address; shipping_address?: Address } = {
        cartId: cart.value.id,
        billing_address: { ...billingAddress, country_code: billingAddress.country_code.toLowerCase() }
    }
    if (useSeparateShipping.value) {
        payload.shipping_address = { ...shippingAddress, country_code: shippingAddress.country_code.toLowerCase() }
    } else {
        payload.shipping_address = { ...billingAddress, country_code: billingAddress.country_code.toLowerCase() }
    }

    try {
        const updatedCart = await $fetch<{ cart: CartDTO }>("/api/cart/update", {
            method: "POST",
            body: payload
        })

        cart.value = updatedCart.cart
        await router.push("/checkout")
    } catch (error) {
        console.error("Failed to update cart addresses:", error)
    }
}

const rules = {
    required: (v: unknown): boolean | string => (v !== null && v !== undefined && v !== "") || "This field is required",
    phone: (v: string): boolean | string => /^[+]?[\d\s-]{7,}$/.test(v) || "Enter a valid phone number"
}
</script>

<template>
    <VContainer class="pt-12">
        <VForm ref="form" lazy-validation>
            <VRow>
                <VCol cols="12">
                    <h2>Billing Address</h2>
                </VCol>

                <VCol cols="12" md="6">
                    <VTextField v-model="billingAddress.first_name" label="First Name" :rules="[rules.required]" />
                </VCol>

                <VCol cols="12" md="6">
                    <VTextField v-model="billingAddress.last_name" label="Last Name" :rules="[rules.required]" />
                </VCol>

                <VCol cols="12">
                    <VTextField v-model="billingAddress.address_1" label="Address Line 1" :rules="[rules.required]" />
                </VCol>

                <VCol cols="12" md="6">
                    <VTextField v-model="billingAddress.company" label="Company" />
                </VCol>

                <VCol cols="6" md="3">
                    <VTextField v-model="billingAddress.postal_code" label="Postal Code" :rules="[rules.required]" />
                </VCol>

                <VCol cols="6" md="3">
                    <VTextField v-model="billingAddress.city" label="City" :rules="[rules.required]" />
                </VCol>
                <VCol cols="12" md="6">
                    <VSelect
                        v-model="billingAddress.country_code"
                        :items="regionCountries"
                        item-title="display_name"
                        item-value="iso_2"
                        label="Country"
                        :rules="[rules.required]"
                    />
                </VCol>
                <VCol cols="12" md="6">
                    <VTextField v-model="billingAddress.province" label="Province / State" :rules="[rules.required]" />
                </VCol>

                <VCol cols="12" md="6">
                    <VTextField v-model="billingAddress.phone" label="Phone Number" :rules="[rules.required, rules.phone]" />
                </VCol>
            </VRow>

            <VRow>
                <VCol cols="12">
                    <VCheckbox v-model="useSeparateShipping" label="Use a separate shipping address" />
                </VCol>
            </VRow>

            <VRow v-if="useSeparateShipping">
                <VCol cols="12">
                    <h2>Shipping Address</h2>
                </VCol>

                <VCol cols="12" md="6">
                    <VTextField v-model="shippingAddress.first_name" label="First Name" :rules="[rules.required]" />
                </VCol>

                <VCol cols="12" md="6">
                    <VTextField v-model="shippingAddress.last_name" label="Last Name" :rules="[rules.required]" />
                </VCol>

                <VCol cols="12">
                    <VTextField v-model="shippingAddress.address_1" label="Address Line 1" :rules="[rules.required]" />
                </VCol>

                <VCol cols="12" md="6">
                    <VTextField v-model="shippingAddress.company" label="Company" />
                </VCol>

                <VCol cols="6" md="3">
                    <VTextField v-model="shippingAddress.postal_code" label="Postal Code" :rules="[rules.required]" />
                </VCol>

                <VCol cols="6" md="3">
                    <VTextField v-model="shippingAddress.city" label="City" :rules="[rules.required]" />
                </VCol>

                <VCol v-if="useSeparateShipping" cols="12" md="6">
                    <VSelect
                        v-model="shippingAddress.country_code"
                        :items="regionCountries"
                        item-title="display_name"
                        item-value="iso_2"
                        label="Country"
                        :rules="[rules.required]"
                    />
                </VCol>

                <VCol cols="12" md="6">
                    <VTextField v-model="shippingAddress.province" label="Province / State" :rules="[rules.required]" />
                </VCol>

                <VCol cols="12" md="6">
                    <VTextField v-model="shippingAddress.phone" label="Phone Number" :rules="[rules.required, rules.phone]" />
                </VCol>
            </VRow>

            <VRow>
                <VCol cols="12" class="text-right">
                    <VBtn color="primary" @click="onSubmit"> Continue to Payment </VBtn>
                </VCol>
            </VRow>
        </VForm>
    </VContainer>
</template>
