<script setup lang="ts">
import type { CustomerAddressDTO } from "@medusajs/types"

import AddressCard from "@/components/Adress/AddressCard.vue"
import AddressForm from "@/components/Adress/AddressForm.vue"

definePageMeta({
    layout: "account",
    middleware: ["auth"]
})

useHead({ title: "Addresses | Ecommerce" })

const LIMIT = 3
const page = ref(1)
const limit = ref(LIMIT)
const offset = computed(() => (page.value - 1) * limit.value)

const loading = ref(false)
const addresses = ref<CustomerAddressDTO[]>([])
const totalCount = ref(0)
const error = ref<string | null>(null)
const showAdd = ref(false)
const showEdit = ref(false)
const editAddr = ref<Partial<CustomerAddressDTO>>({})

async function fetchPage(): Promise<void> {
    loading.value = true
    error.value = null

    try {
        const response = await $fetch<{ addresses: CustomerAddressDTO[]; count: number }>("/api/account/get-addresses", {
            credentials: "include",
            query: {
                limit: limit.value,
                offset: offset.value
            }
        })

        addresses.value = response.addresses
        totalCount.value = response.count
    } catch (fetchError) {
        console.error(fetchError)
        error.value = "Could not load addresses."
    } finally {
        loading.value = false
    }
}

onMounted(fetchPage)
watch(page, fetchPage)

async function createAddress(payload: Partial<CustomerAddressDTO>): Promise<void> {
    try {
        const { id: _id, customer_id: _customerId, created_at: _createdAt, updated_at: _updatedAt, ...body } = payload
        await $fetch("/api/account/create-address", { method: "POST", credentials: "include", body })
        await fetchPage()
    } catch {
        error.value = "Could not create address."
    }
}

async function updateAddress(payload: CustomerAddressDTO): Promise<void> {
    const { id, customer_id: _customerId, created_at: _createdAt, updated_at: _updatedAt, ...body } = payload

    try {
        await $fetch(`/api/account/update-address/${id}`, { method: "POST", credentials: "include", body })
        await fetchPage()
    } catch {
        error.value = "Could not update address."
    }
}

async function deleteAddress(id: string): Promise<void> {
    try {
        await $fetch(`/api/account/delete-address/${id}`, { method: "DELETE", credentials: "include" })
        await fetchPage()
    } catch {
        error.value = "Could not delete address."
    }
}

function onEdit(address: CustomerAddressDTO): void {
    editAddr.value = { ...address }
    showEdit.value = true
}
</script>

<template>
    <div class="account-addresses-content">
        <div class="account-addresses-content__toolbar">
            <div class="account-addresses-content__stat-card">
                <span class="account-addresses-content__stat-label">Saved entries</span>
                <strong class="account-addresses-content__stat-value">{{ totalCount }}</strong>
            </div>

            <VBtn color="primary" rounded="pill" class="text-none px-7" @click="showAdd = true">Add new address</VBtn>
        </div>
        <section class="account-addresses-content__panel">
            <VRow v-if="loading" justify="center" class="my-6">
                <VProgressCircular indeterminate color="primary" size="48" />
            </VRow>
            <template v-else>
                <VRow v-if="addresses.length" align="stretch">
                    <VCol v-for="address in addresses" :key="address.id" cols="12" sm="6" xl="4">
                        <AddressCard :address="address" @edit="onEdit" @delete="deleteAddress" />
                    </VCol>
                </VRow>
                <div v-else class="account-addresses-content__empty-state">
                    <div class="account-addresses-content__empty-icon">
                        <VIcon size="26">mdi-map-marker-outline</VIcon>
                    </div>
                    <h2 class="account-addresses-content__empty-title">No addresses saved yet</h2>
                    <p class="account-addresses-content__empty-text">Add your first address to make future checkout steps faster.</p>
                </div>
            </template>
            <VRow v-if="totalCount > limit" class="mt-6" justify="center">
                <VPagination v-model="page" :length="Math.ceil(totalCount / limit)" circle rounded />
            </VRow>
            <VAlert v-if="error" type="error" variant="tonal" class="mt-4">
                {{ error }}
            </VAlert>
        </section>
        <AddressForm v-model="showAdd" title="Add address" :address="{}" @save="createAddress" />
        <AddressForm v-model="showEdit" title="Edit address" :address="editAddr" @save="updateAddress" />
    </div>
</template>

<style scoped lang="scss">
.account-addresses-content {
    display: grid;
    gap: 1.25rem;
}

.account-addresses-content__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.account-addresses-content__stat-card,
.account-addresses-content__panel,
.account-addresses-content__empty-state {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.4rem;
    background: rgba(247, 250, 255, 0.92);
}

.account-addresses-content__stat-card {
    display: grid;
    gap: 0.2rem;
    padding: 1rem 1.1rem;
}

.account-addresses-content__stat-label,
.account-addresses-content__empty-text {
    color: #4b5874;
}

.account-addresses-content__stat-label {
    font-size: 0.88rem;
}

.account-addresses-content__stat-value,
.account-addresses-content__empty-title {
    color: #08173f;
}

.account-addresses-content__panel,
.account-addresses-content__empty-state {
    padding: 1.35rem;
}

.account-addresses-content__empty-state {
    display: grid;
    justify-items: start;
    gap: 0.85rem;
}

.account-addresses-content__empty-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3.15rem;
    height: 3.15rem;
    border-radius: 1rem;
    background: linear-gradient(145deg, rgba(1, 12, 128, 0.1), rgba(0, 128, 255, 0.08));
    color: #010c80;
}

.account-addresses-content__empty-title {
    margin: 0;
}

.account-addresses-content__empty-text {
    margin: 0;
    line-height: 1.7;
}

@media screen and (max-width: 700px) {
    .account-addresses-content__toolbar {
        flex-direction: column;
        align-items: stretch;
    }
}
</style>
