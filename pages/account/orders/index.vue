<script setup lang="ts">
import type { DataTableHeader, DataTableSortItem } from "vuetify"
import type { OrderDTO } from "@medusajs/types"
import { ORDER_STATUS } from "@/enumerators/order"

definePageMeta({
    layout: "account",
    middleware: ["auth"]
})

useHead({ title: "Orders | Ecommerce" })

const runtimeConfig = useRuntimeConfig()

interface OrdersResponse {
    orders: OrderDTO[]
    total: number
}

const page = ref(1)
const perPage = ref(10)
const {
    data: ordersData,
    refresh,
    pending
} = await useFetch<OrdersResponse>(
    () => {
        const params = new URLSearchParams({
            page: page.value.toString(),
            limit: perPage.value.toString()
        })
        return `/api/orders/orders?${params.toString()}`
    },
    {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": runtimeConfig.public.PUBLISHABLE_KEY
        }
    }
)

watch([page, perPage], () => {
    page.value = 1
    refresh()
})

const headers: DataTableHeader[] = [
    { title: "Order #", value: "display_id", align: "start" },
    { title: "Date", value: "created_at" },
    { title: "Total", value: "total", align: "end" },
    { title: "Currency", value: "currency_code", align: "center" },
    { title: "Status", value: "fulfillment_status", align: "center" },
    { title: "Actions", value: "actions", sortable: false, align: "center" }
]

const sortBy = ref<DataTableSortItem[]>([{ key: "created_at", order: "desc" }])
</script>

<template>
    <VContainer class="py-6">
        <VBtn text to="/account" class="my-8">
            <VIcon left>mdi-arrow-left</VIcon>
            Back to Account Dashboard
        </VBtn>
        <VRow justify="center">
            <VCol cols="12" md="10" lg="8">
                <VCard elevation="2">
                    <VToolbar flat>
                        <VToolbarTitle>Orders</VToolbarTitle>
                    </VToolbar>

                    <VDataTable
                        v-model:page="page"
                        v-model:items-per-page="perPage"
                        v-model:sort-by="sortBy"
                        :headers="headers"
                        :items="ordersData?.orders || []"
                        :server-items-length="ordersData?.total || 0"
                        :loading="pending"
                        item-key="id"
                        class="elevation-1"
                        :footer-props="{
                            'items-per-page-options': [5, 10, 20, 50]
                        }"
                    >
                        <template #loading>
                            <VSkeletonLoader type="table" :loading="pending" />
                        </template>

                        <template #[`item.created_at`]="{ item }">
                            {{
                                new Date(item.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric"
                                })
                            }}
                        </template>

                        <template #[`item.currency_code`]="{ item }">
                            {{ item.currency_code.toUpperCase() }}
                        </template>

                        <template #[`item.total`]="{ item }">
                            {{
                                Number(item.total).toLocaleString(undefined, {
                                    style: "currency",
                                    currency: item.currency_code
                                })
                            }}
                        </template>

                        <template #[`item.fulfillment_status`]="{ item }">
                            <VChip small text-color="white">
                                {{ ORDER_STATUS[item.fulfillment_status as keyof typeof ORDER_STATUS] || item.fulfillment_status }}
                            </VChip>
                        </template>
                        <template #[`item.actions`]="{ item }">
                            <VBtn icon :to="`/account/orders/${item.id}`" aria-label="View order">
                                <VIcon>mdi-eye</VIcon>
                            </VBtn>
                        </template>
                    </VDataTable>
                </VCard>
            </VCol>
        </VRow>
    </VContainer>
</template>
