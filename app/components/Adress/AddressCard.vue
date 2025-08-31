<script setup lang="ts">
import type { CustomerDTO } from "@medusajs/types"

type CustomerAddress = CustomerDTO["addresses"][number]

const props = defineProps<{ address: CustomerAddress }>()
const emit = defineEmits<{
    (e: "edit", addr: CustomerAddress): void
    (e: "delete", id: string): void
}>()

function onEdit(): void {
    emit("edit", props.address)
}
function onDelete(): void {
    if (confirm("Are you sure you want to delete this address?")) {
        emit("delete", props.address.id)
    }
}
</script>

<template>
    <VCard elevation="1" class="pa-4 d-flex flex-column justify-space-between h-100">
        <div>
            <div class="d-flex justify-space-between align-center mb-2">
                <div class="text-subtitle-1 font-weight-medium">
                    <b>Label:</b> {{ props.address.address_name?.toUpperCase() || "Unnamed Address" }}
                </div>
                <div>
                    <VBtn icon size="small" @click="onEdit">
                        <VIcon>mdi-pencil</VIcon>
                    </VBtn>
                    <VBtn icon size="small" color="error" @click="onDelete">
                        <VIcon>mdi-delete</VIcon>
                    </VBtn>
                </div>
            </div>
            <div class="text-body-2">
                <div><strong>Name:</strong> {{ props.address.first_name }} {{ props.address.last_name }}</div>
                <div><strong>Address:</strong> {{ props.address.address_1 }}</div>
                <div v-if="props.address.address_2"><strong>Address 2:</strong> {{ props.address.address_2 }}</div>
                <div><strong>City:</strong> {{ props.address.city }}</div>
                <div><strong>Province:</strong> {{ props.address.province }}</div>
                <div><strong>Postal Code:</strong> {{ props.address.postal_code }}</div>
                <div><strong>Country:</strong> {{ props.address.country_code?.toUpperCase() }}</div>
                <div v-if="props.address.phone"><strong>Phone:</strong> {{ props.address.phone }}</div>
                <div v-if="props.address.company"><strong>Company:</strong> {{ props.address.company }}</div>
            </div>
        </div>
    </VCard>
</template>
