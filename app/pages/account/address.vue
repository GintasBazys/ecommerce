<script setup lang="ts">
import type { CustomerAddressDTO } from "@medusajs/types"

import AddressCard from "@/components/Adress/AddressCard.vue"
import AddressForm from "@/components/Adress/AddressForm.vue"

definePageMeta({
    layout: "account",
    middleware: ["auth"]
})

useHead({ title: "Addresses | Medusa Commerce" })

const LIMIT = 3
const page = ref<number>(1)
const limit = ref<number>(LIMIT)
const offset = computed(() => (page.value - 1) * limit.value)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / limit.value)))
const skeletonCards = Array.from({ length: LIMIT }, (_, index) => index)

const loading = ref<boolean>(false)
const addresses = ref<CustomerAddressDTO[]>([])
const totalCount = ref<number>(0)
const error = ref<string | null>(null)
const showAdd = ref<boolean>(false)
const showEdit = ref<boolean>(false)
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

        if (addresses.value.length === 1 && page.value > 1) {
            page.value -= 1
            return
        }

        await fetchPage()
    } catch {
        error.value = "Could not delete address."
    }
}

function onEdit(address: CustomerAddressDTO): void {
    editAddr.value = { ...address }
    showEdit.value = true
}

function changePage(nextPage: number): void {
    if (nextPage < 1 || nextPage > totalPages.value || nextPage === page.value) {
        return
    }

    page.value = nextPage
}
</script>

<template>
    <div class="grid gap-5">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="rounded-[1.6rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.08)] sm:min-w-52">
                <span class="text-label-sm tracking-label block font-semibold text-slate-500 uppercase">Saved entries</span>
                <strong class="mt-2 block text-4xl leading-none font-bold tracking-[-0.04em] text-slate-950">{{ totalCount }}</strong>
            </div>

            <button type="button" class="ui-btn-accent min-h-13 px-7 text-base motion-reduce:transition-none" @click="showAdd = true">
                Add new address
            </button>
        </div>

        <section class="rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-6 lg:p-8">
            <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
                <div v-for="item in skeletonCards" :key="item" class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div class="animate-pulse space-y-4">
                        <div class="flex items-start justify-between gap-3">
                            <div class="space-y-3">
                                <div class="h-3 w-24 rounded-full bg-slate-200"></div>
                                <div class="h-5 w-36 rounded-full bg-slate-200"></div>
                            </div>
                            <div class="flex gap-2">
                                <div class="h-9 w-9 rounded-full bg-slate-200"></div>
                                <div class="h-9 w-9 rounded-full bg-slate-200"></div>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <div class="h-4 w-full rounded-full bg-slate-200"></div>
                            <div class="h-4 w-5/6 rounded-full bg-slate-200"></div>
                            <div class="h-4 w-2/3 rounded-full bg-slate-200"></div>
                            <div class="h-4 w-1/2 rounded-full bg-slate-200"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="addresses.length" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <AddressCard v-for="address in addresses" :key="address.id" :address="address" @edit="onEdit" @delete="deleteAddress" />
            </div>

            <div v-else class="grid gap-4 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5 sm:p-6">
                <div
                    class="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-900"
                >
                    <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                        <path
                            d="M12 21s-5.5-5.7-5.5-10a5.5 5.5 0 1 1 11 0c0 4.3-5.5 10-5.5 10Z"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <path d="M12 13.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
                <div>
                    <h2 class="text-[1.35rem] font-semibold text-slate-950">No addresses saved yet</h2>
                    <p class="mt-2 max-w-xl text-sm leading-7 text-slate-600 sm:text-[0.95rem]">
                        Add your first address to make future checkout steps faster.
                    </p>
                </div>
            </div>

            <div v-if="totalCount > limit" class="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button
                    type="button"
                    class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-amber-200 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
                    :disabled="page <= 1"
                    aria-label="Go to previous address page"
                    @click="changePage(page - 1)"
                >
                    ‹
                </button>

                <button
                    v-for="pageNumber in totalPages"
                    :key="pageNumber"
                    type="button"
                    class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-semibold transition motion-reduce:transition-none"
                    :class="
                        pageNumber === page
                            ? 'border-amber-300 bg-amber-50 text-slate-950 ring-1 ring-amber-100'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-amber-200 hover:text-slate-950'
                    "
                    :aria-current="pageNumber === page ? 'page' : undefined"
                    @click="changePage(pageNumber)"
                >
                    {{ pageNumber }}
                </button>

                <button
                    type="button"
                    class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-amber-200 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
                    :disabled="page >= totalPages"
                    aria-label="Go to next address page"
                    @click="changePage(page + 1)"
                >
                    ›
                </button>
            </div>

            <div
                v-if="error"
                class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
                role="alert"
            >
                {{ error }}
            </div>
        </section>

        <AddressForm v-model="showAdd" title="Add address" :address="{}" @save="createAddress" />
        <AddressForm v-model="showEdit" title="Edit address" :address="editAddr" @save="updateAddress" />
    </div>
</template>
