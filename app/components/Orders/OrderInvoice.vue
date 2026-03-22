<script setup lang="ts">
import type { OrderDTO } from "@medusajs/types"

import { ORDER_STATUS } from "@/enumerators/order"
import { formatPrice } from "@/utils/formatPrice"

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
const invoiceDownloadUrl = computed<string>(() => `/api/orders/${orderId}/invoice`)
</script>

<template>
    <div class="orderInvoiceContent">
        <VSkeletonLoader v-if="pending" type="card" />
        <VAlert v-else-if="error" type="error" variant="tonal">Failed to load order.</VAlert>
        <template v-else-if="order">
            <div class="orderInvoiceContent__grid">
                <div class="orderInvoiceContent__main">
                    <section class="orderInvoiceContent__panel orderInvoiceContent__panel--muted">
                        <div class="orderInvoiceContent__detailsGrid">
                            <div class="orderInvoiceContent__detailCard">
                                <span class="orderInvoiceContent__label">Order</span>
                                <strong class="orderInvoiceContent__value">#{{ order.display_id || order.id }}</strong>
                            </div>
                            <div class="orderInvoiceContent__detailCard">
                                <span class="orderInvoiceContent__label">Placed on</span>
                                <strong class="orderInvoiceContent__value">
                                    {{
                                        new Date(order.created_at ?? new Date()).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric"
                                        })
                                    }}
                                </strong>
                            </div>
                            <div class="orderInvoiceContent__detailCard">
                                <span class="orderInvoiceContent__label">Status</span>
                                <strong class="orderInvoiceContent__value">
                                    {{ ORDER_STATUS[order.fulfillment_status as keyof typeof ORDER_STATUS] || order.fulfillment_status }}
                                </strong>
                            </div>
                        </div>
                    </section>
                    <section class="orderInvoiceContent__panel">
                        <h2 class="orderInvoiceContent__title">Items in this order</h2>
                        <div class="orderInvoiceContent__itemsList">
                            <article v-for="item in order.items" :key="item.id" class="orderInvoiceContent__itemCard">
                                <NuxtImg
                                    :src="item.thumbnail || '/images/placeholder.png'"
                                    width="72"
                                    class="orderInvoiceContent__itemImage"
                                />
                                <div class="orderInvoiceContent__itemBody">
                                    <strong class="orderInvoiceContent__itemTitle">{{ item.product_title }}</strong>
                                    <p class="orderInvoiceContent__itemMeta">{{ item.variant_title }}</p>
                                    <p class="orderInvoiceContent__itemMeta">Qty {{ item.quantity }}</p>
                                </div>
                                <div class="orderInvoiceContent__itemPricing">
                                    <span>{{ formatPrice(Number(item.unit_price || 0), order.currency_code) }}</span>
                                    <strong>{{ formatPrice(Number(item.total || 0), order.currency_code) }}</strong>
                                </div>
                            </article>
                        </div>
                    </section>
                    <section class="orderInvoiceContent__panel">
                        <h2 class="orderInvoiceContent__title">Shipping and payment</h2>
                        <div class="orderInvoiceContent__detailsGrid">
                            <div class="orderInvoiceContent__detailCard">
                                <span class="orderInvoiceContent__label">Email</span>
                                <strong class="orderInvoiceContent__value">{{ order.email }}</strong>
                            </div>
                            <div class="orderInvoiceContent__detailCard">
                                <span class="orderInvoiceContent__label">Payment status</span>
                                <strong class="orderInvoiceContent__value">{{ order.payment_status }}</strong>
                            </div>
                            <div class="orderInvoiceContent__detailCard">
                                <span class="orderInvoiceContent__label">Shipping method</span>
                                <strong class="orderInvoiceContent__value">{{ order.shipping_methods?.[0]?.name || "Unavailable" }}</strong>
                            </div>
                        </div>
                    </section>
                </div>
                <aside class="orderInvoiceContent__summary">
                    <section class="orderInvoiceContent__panel orderInvoiceContent__panel--sticky">
                        <h2 class="orderInvoiceContent__title">Totals</h2>
                        <div class="orderInvoiceContent__totals">
                            <div class="orderInvoiceContent__totalRow">
                                <span>Subtotal</span>
                                <span>{{ formatPrice(Number(order.subtotal || 0), order.currency_code) }}</span>
                            </div>
                            <div class="orderInvoiceContent__totalRow">
                                <span>Shipping</span>
                                <span>{{ formatPrice(Number(order.shipping_total || 0), order.currency_code) }}</span>
                            </div>
                            <div class="orderInvoiceContent__totalRow">
                                <span>Tax</span>
                                <span>{{ formatPrice(Number(order.tax_total || 0), order.currency_code) }}</span>
                            </div>
                            <div class="orderInvoiceContent__totalRow orderInvoiceContent__totalRow--grand">
                                <span>Total</span>
                                <strong>{{ formatPrice(Number(order.total || 0), order.currency_code) }}</strong>
                            </div>
                        </div>
                        <VBtn color="primary" rounded="pill" class="text-none" block :href="invoiceDownloadUrl">Download invoice PDF</VBtn>
                    </section>
                </aside>
            </div>
        </template>
    </div>
</template>

<style scoped lang="scss">
.orderInvoiceContent__grid,
.orderInvoiceContent__detailsGrid {
    display: grid;
    gap: 1.25rem;
}

.orderInvoiceContent__grid {
    grid-template-columns: minmax(0, 1fr) minmax(18rem, 22rem);
}

.orderInvoiceContent__main,
.orderInvoiceContent__itemsList,
.orderInvoiceContent__totals {
    display: grid;
    gap: 1rem;
}

.orderInvoiceContent__panel,
.orderInvoiceContent__detailCard,
.orderInvoiceContent__itemCard {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.4rem;
    background: rgba(255, 255, 255, 0.88);
}

.orderInvoiceContent__panel {
    padding: 1.35rem;
}

.orderInvoiceContent__panel--muted,
.orderInvoiceContent__itemCard {
    background: rgba(247, 250, 255, 0.92);
}

.orderInvoiceContent__panel--sticky {
    position: sticky;
    top: 1.5rem;
}

.orderInvoiceContent__detailsGrid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}

.orderInvoiceContent__detailCard {
    display: grid;
    gap: 0.2rem;
    padding: 1rem;
}

.orderInvoiceContent__label,
.orderInvoiceContent__itemMeta {
    color: #4b5874;
}

.orderInvoiceContent__value,
.orderInvoiceContent__title,
.orderInvoiceContent__itemTitle {
    color: #08173f;
}

.orderInvoiceContent__title {
    margin: 0;
    font-size: 1.35rem;
}

.orderInvoiceContent__itemCard {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
}

.orderInvoiceContent__itemImage {
    border-radius: 1rem;
}

.orderInvoiceContent__itemBody {
    display: grid;
    flex: 1;
    gap: 0.2rem;
}

.orderInvoiceContent__itemMeta {
    margin: 0;
    line-height: 1.6;
}

.orderInvoiceContent__itemPricing {
    display: grid;
    gap: 0.2rem;
    justify-items: end;
    color: #08173f;
}

.orderInvoiceContent__totalRow {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    color: #4b5874;
}

.orderInvoiceContent__totalRow--grand {
    padding-top: 0.75rem;
    border-top: 1px solid rgba(8, 23, 63, 0.08);
}

.orderInvoiceContent__totalRow strong {
    color: #08173f;
}

@media screen and (max-width: 1100px) {
    .orderInvoiceContent__grid,
    .orderInvoiceContent__detailsGrid {
        grid-template-columns: 1fr;
    }

    .orderInvoiceContent__panel--sticky {
        position: static;
    }
}

@media screen and (max-width: 700px) {
    .orderInvoiceContent__itemCard,
    .orderInvoiceContent__totalRow {
        flex-direction: column;
        align-items: flex-start;
    }

    .orderInvoiceContent__itemPricing {
        justify-items: start;
    }
}

@media print {
    body {
        margin: 0;
    }

    .v-application--wrap {
        box-shadow: none !important;
    }
}
</style>
