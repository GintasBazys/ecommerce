<script setup lang="ts">
import type { CustomerDTO } from "@medusajs/types"

type CustomerAddress = CustomerDTO["addresses"][number]

const props = defineProps<{ address: CustomerAddress }>()
const emit = defineEmits<{
    (_: "edit", __: CustomerAddress): void
    (_: "delete", __: string): void
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
    <article class="addressCard">
        <div>
            <div class="addressCard__top">
                <div>
                    <span class="addressCard__label">{{ props.address.address_name?.toUpperCase() || "UNNAMED ADDRESS" }}</span>
                    <h3 class="addressCard__name">{{ props.address.first_name }} {{ props.address.last_name }}</h3>
                </div>

                <div class="addressCard__actions">
                    <VBtn icon size="small" variant="text" @click="onEdit">
                        <VIcon>mdi-pencil</VIcon>
                    </VBtn>
                    <VBtn icon size="small" variant="text" color="error" @click="onDelete">
                        <VIcon>mdi-delete-outline</VIcon>
                    </VBtn>
                </div>
            </div>

            <div class="addressCard__body">
                <p class="addressCard__line">{{ props.address.address_1 }}</p>
                <p v-if="props.address.address_2" class="addressCard__line">{{ props.address.address_2 }}</p>
                <p class="addressCard__line">{{ props.address.city }}, {{ props.address.province }}</p>
                <p class="addressCard__line">{{ props.address.postal_code }} - {{ props.address.country_code?.toUpperCase() }}</p>
                <p v-if="props.address.phone" class="addressCard__line">{{ props.address.phone }}</p>
                <p v-if="props.address.company" class="addressCard__line">{{ props.address.company }}</p>
            </div>
        </div>
    </article>
</template>

<style scoped lang="scss">
.addressCard {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    padding: 1.2rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.25rem;
    background: rgba(247, 250, 255, 0.92);
}

.addressCard__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.9rem;
}

.addressCard__label {
    color: #010c80;
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.addressCard__name {
    margin: 0.45rem 0 0;
    color: #08173f;
    font-size: 1rem;
}

.addressCard__actions {
    display: inline-flex;
    gap: 0.1rem;
}

.addressCard__body {
    display: grid;
    gap: 0.3rem;
}

.addressCard__line {
    margin: 0;
    color: #4b5874;
    line-height: 1.6;
}
</style>
