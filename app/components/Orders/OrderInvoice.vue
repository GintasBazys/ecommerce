<script setup lang="ts">
import type { OrderDTO } from "@medusajs/types"

import { ORDER_STATUS } from "@/enumerators/order"

const route = useRoute()
const orderId = route.params.id
const runtimeConfig = useRuntimeConfig()

const {
    data: orderRes,
    pending,
    error
} = await useFetch<{ order: OrderDTO }>(() => `/api/orders/${orderId}`, {
    credentials: "include",
    headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": runtimeConfig.public.PUBLISHABLE_KEY
    }
})

const order = computed<OrderDTO | undefined>(() => orderRes.value?.order)

const invoiceRef = ref<HTMLElement | null>(null)

const pdfOptions = {
    margin: [10, 10],
    filename: `Invoice-${order.value?.display_id}-${new Date(order.value?.created_at ?? Date.now()).toLocaleDateString()}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
}

async function downloadPdf(): Promise<void> {
    if (!invoiceRef.value) return
    if (import.meta.client) {
        const html2pdf = (await import("html2pdf.js")).default
        await html2pdf().set(pdfOptions as any).from(invoiceRef.value).save()
    }
}
</script>

<template>
    <VContainer class="py-6">
        <VBtn text to="/account/orders">
            <VIcon left>mdi-arrow-left</VIcon>
            Back to Orders
        </VBtn>

        <VSkeletonLoader v-if="pending" type="card" />
        <VAlert v-else-if="error" type="error">Failed to load order.</VAlert>
        <div v-else ref="invoiceRef">
            <VCard class="mt-4 px-6 print:shadow-none" elevation="2" style="background: white">
                <VToolbar flat class="justify-center py-4 px-4">
                    <img src="/images/logo.svg" alt="Your Logo" style="max-height: 60px" />
                </VToolbar>

                <VCardTitle class="text-h5"> Invoice #{{ order?.display_id || order?.id }} </VCardTitle>
                <VCardSubtitle class="mb-4">
                    {{
                        new Date(order?.created_at ?? new Date()).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                        })
                    }}
                </VCardSubtitle>
                <VRow class="mb-6">
                    <VCol cols="12" md="6">
                        <div><strong>Email:</strong> {{ order?.email }}</div>
                    </VCol>
                    <VCol cols="12" md="6">
                        <div><strong>Payment:</strong> {{ order?.payment_status }}</div>
                        <div>
                            <strong>Fulfillment:</strong>
                            {{ ORDER_STATUS[order?.fulfillment_status as keyof typeof ORDER_STATUS] || order?.fulfillment_status }}
                        </div>
                    </VCol>
                </VRow>
                <VDataTable
                    :headers="[
                        { title: 'Product', value: 'product', align: 'start' },
                        { title: 'Variant', value: 'variant' },
                        { title: 'Qty', value: 'quantity', align: 'center' },
                        { title: 'Unit Price', value: 'unit_price', align: 'end' },
                        { title: 'Line Total', value: 'total', align: 'end' }
                    ]"
                    :items="
                        order?.items?.map((item) => ({
                            product: item.product_title,
                            variant: item.variant_title,
                            quantity: item.quantity,
                            unit_price: Number(item.unit_price),
                            total: Number(item.total),
                            thumbnail: item.thumbnail
                        }))
                    "
                    class="mb-6"
                >
                    <template #[`item.product`]="{ item }">
                        <NuxtImg :src="item.thumbnail ?? ''" width="40" class="mr-2" />
                        {{ item.product }}
                    </template>
                    <template #[`item.unit_price`]="{ item }">
                        {{
                            item.unit_price.toLocaleString(undefined, {
                                style: "currency",
                                currency: order?.currency_code
                            })
                        }}
                    </template>
                    <template #[`item.total`]="{ item }">
                        {{
                            item.total.toLocaleString(undefined, {
                                style: "currency",
                                currency: order?.currency_code
                            })
                        }}
                    </template>
                </VDataTable>
                <VRow class="mb-6">
                    <VCol cols="12" md="6">
                        <strong>Shipping Method</strong>
                        <div v-for="m in order?.shipping_methods" :key="m.id">
                            {{ m.name }} —
                            {{
                                m.total.toLocaleString(undefined, {
                                    style: "currency",
                                    currency: order?.currency_code
                                })
                            }}
                        </div>
                    </VCol>
                    <VCol cols="12" md="6">
                        <strong>Summary</strong>
                        <div>
                            Subtotal:
                            {{
                                order?.subtotal.toLocaleString(undefined, {
                                    style: "currency",
                                    currency: order.currency_code
                                })
                            }}
                        </div>
                        <div>
                            Shipping:
                            {{
                                order?.shipping_total.toLocaleString(undefined, {
                                    style: "currency",
                                    currency: order.currency_code
                                })
                            }}
                        </div>
                        <div>
                            Tax:
                            {{
                                order?.tax_total.toLocaleString(undefined, {
                                    style: "currency",
                                    currency: order.currency_code
                                })
                            }}
                        </div>
                        <div class="mt-2 text-h6">
                            Total:
                            {{
                                order?.total.toLocaleString(undefined, {
                                    style: "currency",
                                    currency: order.currency_code
                                })
                            }}
                        </div>
                    </VCol>
                </VRow>
            </VCard>
        </div>
        <VCardActions class="justify-end">
            <VBtn outlined to="/account/orders">Back</VBtn>
            <VBtn color="primary" @click="downloadPdf"> Download Invoice </VBtn>
        </VCardActions>
    </VContainer>
</template>

<style scoped lang="scss">
@media print {
    body {
        margin: 0;
    }
    .v-application--wrap {
        box-shadow: none !important;
    }
}
</style>
