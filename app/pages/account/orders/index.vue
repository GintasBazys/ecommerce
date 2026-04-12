<script setup lang="ts">
import type { DataTableHeader, DataTableSortItem, OrdersResponse } from "@/types/interfaces"

import { ORDER_STATUS } from "@/enumerators/order"

definePageMeta({
    layout: "account",
    middleware: ["auth"]
})

useHead({ title: "Orders | Ecommerce" })

const runtimeConfig = useRuntimeConfig()
const page = ref(1)
const perPage = ref(10)

const { data: ordersData, pending } = await useFetch<OrdersResponse>(
    () => {
        const params = new URLSearchParams({
            page: String(page.value),
            limit: String(perPage.value)
        })

        return `/api/orders/orders?${params.toString()}`
    },
    {
        watch: [page, perPage],
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": runtimeConfig.public.PUBLISHABLE_KEY
        }
    }
)

watch(perPage, () => {
    page.value = 1
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
    <div class="account-orders-content">
        <section class="account-orders-content__panel">
            <VDataTableServer
                v-model:page="page"
                v-model:items-per-page="perPage"
                v-model:sort-by="sortBy"
                :headers="headers"
                :items="ordersData?.orders || []"
                :items-length="ordersData?.total || 0"
                :loading="pending"
                item-key="id"
                class="account-orders-content__table"
                :items-per-page-options="[5, 10, 20, 50]"
            >
                <template #loading>
                    <VSkeletonLoader type="table" :loading="pending" />
                </template>
                <template #[`item.created_at`]="{ item }">
                    {{ new Date(item.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) }}
                </template>
                <template #[`item.currency_code`]="{ item }">
                    {{ item.currency_code.toUpperCase() }}
                </template>
                <template #[`item.total`]="{ item }">
                    {{ Number(item.total).toLocaleString(undefined, { style: "currency", currency: item.currency_code }) }}
                </template>
                <template #[`item.fulfillment_status`]="{ item }">
                    <VChip size="small" class="account-orders-content__status-chip">
                        {{ ORDER_STATUS[item.fulfillment_status as keyof typeof ORDER_STATUS] || item.fulfillment_status }}
                    </VChip>
                </template>
                <template #[`item.actions`]="{ item }">
                    <VBtn icon variant="text" :to="`/account/orders/${item.id}`" aria-label="View order">
                        <VIcon>mdi-arrow-top-right</VIcon>
                    </VBtn>
                </template>
            </VDataTableServer>
        </section>
    </div>
</template>

<style scoped lang="scss">
.account-orders-content__panel {
    padding: 1.35rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.4rem;
    background: rgba(247, 250, 255, 0.92);
}

.account-orders-content__status-chip {
    background: rgba(1, 12, 128, 0.08);
    color: #08173f;
    font-weight: 700;
}
</style>
