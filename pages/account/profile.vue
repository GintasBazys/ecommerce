<script setup lang="ts">
import type { VForm } from "vuetify/components"

definePageMeta({
    layout: "account",
    middleware: ["auth"]
})

useHead({ title: "Profile | Ecommerce" })

interface Customer {
    company_name: string
    first_name: string
    last_name: string
    phone: string
}

interface APIError {
    data?: {
        message?: string
    }
}

const { customer } = storeToRefs(useCustomerStore())

const customerData = reactive<Customer>({
    first_name: customer.value?.first_name ?? "",
    last_name: customer.value?.last_name ?? "",
    phone: customer.value?.phone ?? "",
    company_name: customer.value?.company_name ?? ""
})

const rules = {
    required: (v: unknown) => !!v || "This field is required"
}

const formRef: Ref<InstanceType<typeof VForm> | null> = ref(null)

const snackbar = ref(false)
const snackbarText = ref("")

async function onSubmit() {
    if (!formRef.value?.validate()) {
        return
    }

    try {
        await $fetch("/api/account/update-customer", {
            method: "POST",
            body: customerData,
            credentials: "include"
        })
        snackbarText.value = "Profile updated!"
        snackbar.value = true
        useCustomerStore().$patch({
            customer: { ...customerData }
        })
    } catch (err: unknown) {
        const error = err as APIError
        snackbarText.value = error.data?.message || "Update failed"
        snackbar.value = true
    }
}
</script>

<template>
    <VContainer class="py-10">
        <VBtn text to="/account" class="my-8">
            <VIcon left>mdi-arrow-left</VIcon>
            Back to Account Dashboard
        </VBtn>
        <VCard elevation="2" class="pa-6">
            <VCardTitle class="text-h5 mb-2">Profile Information</VCardTitle>
            <VCardSubtitle class="mb-6"> Update your personal and company details. Make sure everything is accurate. </VCardSubtitle>

            <VForm ref="formRef" @submit.prevent="onSubmit">
                <VRow dense>
                    <VCol cols="12" sm="6">
                        <VTextField
                            v-model="customerData.first_name"
                            label="First Name"
                            :rules="[rules.required]"
                            prepend-icon="mdi-account"
                        />
                    </VCol>
                    <VCol cols="12" sm="6">
                        <VTextField
                            v-model="customerData.last_name"
                            label="Last Name"
                            :rules="[rules.required]"
                            prepend-icon="mdi-account-outline"
                        />
                    </VCol>
                    <VCol cols="12" sm="6">
                        <VTextField v-model="customerData.phone" label="Phone" prepend-icon="mdi-phone" />
                    </VCol>
                    <VCol cols="12" sm="6">
                        <VTextField v-model="customerData.company_name" label="Company Name" prepend-icon="mdi-domain" />
                    </VCol>
                </VRow>

                <VRow class="mt-6">
                    <VCol>
                        <VBtn type="submit" color="primary" elevation="2">Save Changes</VBtn>
                    </VCol>
                </VRow>
            </VForm>
        </VCard>
        <VSnackbar v-model="snackbar" timeout="3000" color="success" top right>
            {{ snackbarText }}
        </VSnackbar>
    </VContainer>
</template>
