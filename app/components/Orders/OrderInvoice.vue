<script setup lang="ts">
import type { OrderDTO } from "@medusajs/types"

import { ORDER_STATUS } from "@/enumerators/order"
import { formatDate } from "@/utils/formatDate"
import { formatPrice } from "@/utils/formatPrice"
import NuxtImage from "~/components/Shared/NuxtImage.vue"

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
    <div class="order-invoice-content">
        <VSkeletonLoader v-if="pending" type="card" />
        <VAlert v-else-if="error" type="error" variant="tonal">Failed to load order.</VAlert>
        <template v-else-if="order">
            <div class="order-invoice-content__grid">
                <div class="order-invoice-content__main">
                    <section class="order-invoice-content__panel order-invoice-content__panel--muted">
                        <div class="order-invoice-content__details-grid">
                            <div class="order-invoice-content__detail-card">
                                <span class="order-invoice-content__label">Order</span>
                                <strong class="order-invoice-content__value">#{{ order.display_id || order.id }}</strong>
                            </div>
                            <div class="order-invoice-content__detail-card">
                                <span class="order-invoice-content__label">Placed on</span>
                                <strong class="order-invoice-content__value">
                                    {{ formatDate(order.created_at) || "Unavailable" }}
                                </strong>
                            </div>
                            <div class="order-invoice-content__detail-card">
                                <span class="order-invoice-content__label">Status</span>
                                <strong class="order-invoice-content__value">
                                    {{ ORDER_STATUS[order.fulfillment_status as keyof typeof ORDER_STATUS] || order.fulfillment_status }}
                                </strong>
                            </div>
                        </div>
                    </section>
                    <section class="order-invoice-content__panel">
                        <h2 class="order-invoice-content__title">Items in this order</h2>
                        <div class="order-invoice-content__items-list">
                            <article v-for="item in order.items" :key="item.id" class="order-invoice-content__item-card">
                                <NuxtImage
                                    :src="item.thumbnail || '/images/placeholder.png'"
                                    width="72"
                                    class="order-invoice-content__item-image"
                                />
                                <div class="order-invoice-content__item-body">
                                    <strong class="order-invoice-content__item-title">{{ item.product_title }}</strong>
                                    <p class="order-invoice-content__item-meta">{{ item.variant_title }}</p>
                                    <p class="order-invoice-content__item-meta">Qty {{ item.quantity }}</p>
                                </div>
                                <div class="order-invoice-content__item-pricing">
                                    <span>{{ formatPrice(Number(item.unit_price || 0), order.currency_code) }}</span>
                                    <strong>{{ formatPrice(Number(item.total || 0), order.currency_code) }}</strong>
                                </div>
                            </article>
                        </div>
                    </section>
                    <section class="order-invoice-content__panel">
                        <h2 class="order-invoice-content__title">Shipping and payment</h2>
                        <div class="order-invoice-content__details-grid">
                            <div class="order-invoice-content__detail-card">
                                <span class="order-invoice-content__label">Email</span>
                                <strong class="order-invoice-content__value">{{ order.email }}</strong>
                            </div>
                            <div class="order-invoice-content__detail-card">
                                <span class="order-invoice-content__label">Payment status</span>
                                <strong class="order-invoice-content__value">{{ order.payment_status }}</strong>
                            </div>
                            <div class="order-invoice-content__detail-card">
                                <span class="order-invoice-content__label">Shipping method</span>
                                <strong class="order-invoice-content__value">{{
                                    order.shipping_methods?.[0]?.name || "Unavailable"
                                }}</strong>
                            </div>
                        </div>
                    </section>
                </div>
                <aside class="order-invoice-content__summary">
                    <section class="order-invoice-content__panel order-invoice-content__panel--sticky">
                        <h2 class="order-invoice-content__title">Totals</h2>
                        <div class="order-invoice-content__totals">
                            <div class="order-invoice-content__total-row">
                                <span>Subtotal</span>
                                <span>{{ formatPrice(Number(order.subtotal || 0), order.currency_code) }}</span>
                            </div>
                            <div class="order-invoice-content__total-row">
                                <span>Shipping</span>
                                <span>{{ formatPrice(Number(order.shipping_total || 0), order.currency_code) }}</span>
                            </div>
                            <div class="order-invoice-content__total-row">
                                <span>Tax</span>
                                <span>{{ formatPrice(Number(order.tax_total || 0), order.currency_code) }}</span>
                            </div>
                            <div class="order-invoice-content__total-row order-invoice-content__total-row--grand">
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
.order-invoice-content__grid,
.order-invoice-content__details-grid {
    display: grid;
    gap: 1.25rem;
}

.order-invoice-content__grid {
    grid-template-columns: minmax(0, 1fr) minmax(18rem, 22rem);
}

.order-invoice-content__main,
.order-invoice-content__items-list,
.order-invoice-content__totals {
    display: grid;
    gap: 1rem;
}

.order-invoice-content__panel,
.order-invoice-content__detail-card,
.order-invoice-content__item-card {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.4rem;
    background: rgba(255, 255, 255, 0.88);
}

.order-invoice-content__panel {
    padding: 1.35rem;
}

.order-invoice-content__panel--muted,
.order-invoice-content__item-card {
    background: rgba(247, 250, 255, 0.92);
}

.order-invoice-content__panel--sticky {
    position: sticky;
    top: 1.5rem;
}

.order-invoice-content__details-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}

.order-invoice-content__detail-card {
    display: grid;
    gap: 0.2rem;
    padding: 1rem;
}

.order-invoice-content__label,
.order-invoice-content__item-meta {
    color: #4b5874;
}

.order-invoice-content__value,
.order-invoice-content__title,
.order-invoice-content__item-title {
    color: #08173f;
}

.order-invoice-content__title {
    margin: 0;
    font-size: 1.35rem;
}

.order-invoice-content__item-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
}

.order-invoice-content__item-image {
    border-radius: 1rem;
}

.order-invoice-content__item-body {
    display: grid;
    flex: 1;
    gap: 0.2rem;
}

.order-invoice-content__item-meta {
    margin: 0;
    line-height: 1.6;
}

.order-invoice-content__item-pricing {
    display: grid;
    gap: 0.2rem;
    justify-items: end;
    color: #08173f;
}

.order-invoice-content__total-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    color: #4b5874;
}

.order-invoice-content__total-row--grand {
    padding-top: 0.75rem;
    border-top: 1px solid rgba(8, 23, 63, 0.08);
}

.order-invoice-content__total-row strong {
    color: #08173f;
}

@media screen and (max-width: 1100px) {
    .order-invoice-content__grid,
    .order-invoice-content__details-grid {
        grid-template-columns: 1fr;
    }

    .order-invoice-content__panel--sticky {
        position: static;
    }
}

@media screen and (max-width: 700px) {
    .order-invoice-content__item-card,
    .order-invoice-content__total-row {
        flex-direction: column;
        align-items: flex-start;
    }

    .order-invoice-content__item-pricing {
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
