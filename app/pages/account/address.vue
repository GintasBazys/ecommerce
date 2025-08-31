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
const page = ref<number>(1)
const limit = ref<number>(LIMIT)
const offset = computed<number>(() => (page.value - 1) * limit.value)

const loading = ref<boolean>(false)

const addresses = ref<CustomerAddressDTO[]>([])
const totalCount = ref<number>(0)
const error = ref<string | null>(null)

async function fetchPage(): Promise<void> {
    loading.value = true
    error.value = null
    try {
        await nextTick()
        const res = await $fetch<{
            addresses: CustomerAddressDTO[]
            count: number
        }>("/api/account/get-addresses", {
            credentials: "include",
            params: {
                limit: limit.value,
                offset: offset.value
            }
        })

        addresses.value = res.addresses
        totalCount.value = res.count
    } catch (e) {
        console.error(e)
        error.value = "Could not load addresses."
    } finally {
        loading.value = false
    }
}
onMounted(() => {
    fetchPage()
})

watch(page, fetchPage, { immediate: false })

const showAdd = ref<boolean>(false)
const showEdit = ref<boolean>(false)
const editAddr = ref<Partial<CustomerAddressDTO>>({})

async function createAddress(payload: Partial<CustomerAddressDTO>): Promise<void> {
    try {
        const { id, customer_id, created_at, updated_at, ...body } = payload
        await $fetch("/api/account/create-address", {
            method: "POST",
            credentials: "include",
            body
        })
        await fetchPage()
    } catch {
        error.value = "Could not create address."
    }
}

async function updateAddress(payload: CustomerAddressDTO): Promise<void> {
    const { id, customer_id, created_at, updated_at, ...body } = payload
    try {
        await $fetch(`/api/account/update-address/${id}`, {
            method: "POST",
            credentials: "include",
            body
        })
        await fetchPage()
    } catch {
        error.value = "Could not update address."
    }
}

async function deleteAddress(id: string): Promise<void> {
    try {
        await $fetch(`/api/account/delete-address/${id}`, {
            method: "DELETE",
            credentials: "include"
        })
        await fetchPage()
    } catch {
        error.value = "Could not delete address."
    }
}

function onEdit(addr: CustomerAddressDTO): void {
    editAddr.value = { ...addr }
    showEdit.value = true
}

function onDelete(id: string): void {
    deleteAddress(id)
}
</script>

<template>
    <VContainer class="py-10">
        <VBtn text to="/account" class="my-8">
            <VIcon left>mdi-arrow-left</VIcon>
            Back to Account Dashboard
        </VBtn>
        <VCard elevation="2" class="pa-6 mb-6">
            <VCardTitle class="text-h5 mb-2">Your Addresses</VCardTitle>
            <VRow v-if="loading" justify="center" class="my-6">
                <VProgressCircular indeterminate color="primary" size="48" />
            </VRow>
            <VRow v-if="!loading">
                <VCol v-for="addr in addresses" :key="addr.id" cols="12" sm="6" md="4">
                    <AddressCard :address="addr" @edit="onEdit" @delete="onDelete" />
                </VCol>
            </VRow>

            <VRow class="mt-6" justify="center">
                <VPagination v-model="page" :length="Math.ceil(totalCount / limit)" circle rounded />
            </VRow>

            <VRow class="mt-4">
                <VCol cols="12" sm="6" md="4">
                    <VCard outlined class="d-flex align-center justify-center pa-6" style="cursor: pointer" @click="showAdd = true">
                        <VIcon size="32">mdi-plus</VIcon>
                        <span class="ml-2 font-weight-medium"> Add New Address </span>
                    </VCard>
                </VCol>
            </VRow>

            <VAlert v-if="error" type="error" class="mt-4">
                {{ error }}
            </VAlert>
        </VCard>

        <AddressForm v-model="showAdd" title="Add Address" :address="{}" @save="createAddress" />
        <AddressForm v-model="showEdit" title="Edit Address" :address="editAddr" @save="updateAddress" />
    </VContainer>
</template>
