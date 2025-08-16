<script setup lang="ts">
import type { CustomerAddressDTO } from "@medusajs/types"

const model = defineModel<boolean>()

const props = defineProps<{
    address: Partial<CustomerAddressDTO>
    title: string
}>()

const emit = defineEmits<{
    (e: "save", payload: CustomerAddressDTO): void
}>()

const local = reactive<CustomerAddressDTO>({
    id: props.address.id || "",
    first_name: props.address.first_name || "",
    last_name: props.address.last_name || "",
    phone: props.address.phone || "",
    company: props.address.company || "",
    address_1: props.address.address_1 || "",
    address_2: props.address.address_2 || "",
    city: props.address.city || "",
    province: props.address.province || "",
    postal_code: props.address.postal_code || "",
    country_code: props.address.country_code || "",
    address_name: props.address.address_name || "",
    metadata: props.address.metadata || {},
    is_default_shipping: props.address.is_default_shipping ?? false,
    is_default_billing: props.address.is_default_billing ?? false,
    customer_id: "",
    created_at: "",
    updated_at: ""
})

watch(
    () => props.address,
    (newVal) => {
        Object.assign(local, {
            id: newVal.id || "",
            first_name: newVal.first_name || "",
            last_name: newVal.last_name || "",
            phone: newVal.phone || "",
            company: newVal.company || "",
            address_1: newVal.address_1 || "",
            address_2: newVal.address_2 || "",
            city: newVal.city || "",
            province: newVal.province || "",
            postal_code: newVal.postal_code || "",
            country_code: newVal.country_code || "",
            address_name: newVal.address_name || "",
            metadata: newVal.metadata || {}
        })
    }
)

function close(): void {
    model.value = false
}

function save(): void {
    emit("save", { ...local })
    model.value = false
}
</script>

<template>
  <VDialog v-model="model" max-width="600">
    <VCard>
      <VCardTitle>{{ props.title }}</VCardTitle>
      <VCardText>
        <VContainer>
          <VRow>
            <VCol cols="6"><VTextField v-model="local.first_name" label="First Name" /></VCol>
            <VCol cols="6"><VTextField v-model="local.last_name" label="Last Name" /></VCol>
            <VCol cols="6"><VTextField v-model="local.phone" label="Phone" /></VCol>
            <VCol cols="6"><VTextField v-model="local.company" label="Company" /></VCol>
            <VCol cols="12"><VTextField v-model="local.address_1" label="Address Line 1" /></VCol>
            <VCol cols="12"><VTextField v-model="local.address_2" label="Address Line 2" /></VCol>
            <VCol cols="6"><VTextField v-model="local.city" label="City" /></VCol>
            <VCol cols="6"><VTextField v-model="local.postal_code" label="Postal Code" /></VCol>
            <VCol cols="6"><VTextField v-model="local.country_code" label="Country Code" /></VCol>
            <VCol cols="6"><VTextField v-model="local.province" label="Province" /></VCol>
            <VCol cols="12"><VTextField v-model="local.address_name" label="Label (Home, Work, etc.)" /></VCol>
          </VRow>
        </VContainer>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn text @click="close">Cancel</VBtn>
        <VBtn color="primary" @click="save">Save</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
