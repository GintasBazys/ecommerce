<script setup lang="ts">
import type { CustomerAddressDTO } from "@medusajs/types"

const model = defineModel<boolean>()

const props = defineProps<{
    address: Partial<CustomerAddressDTO>
    title: string
}>()

const emit = defineEmits<{
    (_: "save", __: CustomerAddressDTO): void
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
    (newValue) => {
        Object.assign(local, {
            id: newValue.id || "",
            first_name: newValue.first_name || "",
            last_name: newValue.last_name || "",
            phone: newValue.phone || "",
            company: newValue.company || "",
            address_1: newValue.address_1 || "",
            address_2: newValue.address_2 || "",
            city: newValue.city || "",
            province: newValue.province || "",
            postal_code: newValue.postal_code || "",
            country_code: newValue.country_code || "",
            address_name: newValue.address_name || "",
            metadata: newValue.metadata || {}
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
    <VDialog v-model="model" max-width="720">
        <VCard class="addressForm">
            <VCardTitle class="addressForm__title">{{ props.title }}</VCardTitle>
            <VCardText>
                <div class="addressForm__grid">
                    <div class="addressForm__double">
                        <VTextField v-model="local.first_name" label="First name" variant="outlined" />
                        <VTextField v-model="local.last_name" label="Last name" variant="outlined" />
                    </div>
                    <div class="addressForm__double">
                        <VTextField v-model="local.phone" label="Phone" variant="outlined" />
                        <VTextField v-model="local.company" label="Company" variant="outlined" />
                    </div>
                    <VTextField v-model="local.address_1" label="Address line 1" variant="outlined" />
                    <VTextField v-model="local.address_2" label="Address line 2" variant="outlined" />
                    <div class="addressForm__double">
                        <VTextField v-model="local.city" label="City" variant="outlined" />
                        <VTextField v-model="local.postal_code" label="Postal code" variant="outlined" />
                    </div>
                    <div class="addressForm__double">
                        <VTextField v-model="local.country_code" label="Country code" variant="outlined" />
                        <VTextField v-model="local.province" label="Province" variant="outlined" />
                    </div>
                    <VTextField v-model="local.address_name" label="Label (Home, Work, etc.)" variant="outlined" />
                </div>
            </VCardText>
            <VCardActions class="addressForm__actions">
                <VBtn variant="text" class="text-none" @click="close">Cancel</VBtn>
                <VBtn color="primary" rounded="pill" class="text-none px-6" @click="save">Save</VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<style scoped lang="scss">
.addressForm {
    border-radius: 1.4rem;
}

.addressForm__title {
    padding: 1.35rem 1.35rem 0.5rem;
    color: #08173f;
    font-size: 1.25rem;
    font-weight: 700;
}

.addressForm__grid {
    display: grid;
    gap: 0.9rem;
}

.addressForm__double {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.9rem;
}

.addressForm__actions {
    justify-content: flex-end;
    padding: 0.5rem 1.35rem 1.35rem;
}

@media screen and (max-width: 700px) {
    .addressForm__double {
        grid-template-columns: 1fr;
    }
}
</style>
