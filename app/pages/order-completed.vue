<script setup lang="ts">
import type { OrderDTO } from "@medusajs/types"

import { formatPrice } from "@/utils/formatPrice"
import { DEFAULT_CURENCY } from "~/utils/consts"

definePageMeta({ layout: "checkout" })

useHead({ title: "Order Completed | Ecommerce" })

const route = useRoute()
const orderId = route.query.orderId

const { customer } = storeToRefs(useCustomerStore())

if (!orderId) {
    throw new Error("Missing orderId")
}

const {
    data: orderRes,
    pending,
    error
} = await useFetch<{ order: OrderDTO }>(`/api/orders/${orderId}`, {
    method: "GET",
    credentials: "include"
})

const order = computed<OrderDTO | null>(() => orderRes.value?.order ?? null)
const currencyCode = computed<string>(() => order.value?.currency_code ?? DEFAULT_CURENCY)
const orderDate = computed<string>(() => new Date(order.value?.created_at ?? new Date()).toLocaleDateString())
const shippingMethod = computed(() => order.value?.shipping_methods?.[0] ?? null)
const statusItems = computed(() => [
    {
        label: "Order status",
        value: order.value?.status ?? "Pending"
    },
    {
        label: "Payment",
        value: order.value?.payment_status ?? "Awaiting confirmation"
    },
    {
        label: "Date placed",
        value: orderDate.value
    }
])
</script>

<template>
    <section class="order-complete-page">
        <div class="order-complete-page__hero">
            <VContainer class="order-complete-page__container">
                <div v-if="pending" class="order-complete-page__loading-state">
                    <VProgressCircular indeterminate color="primary" size="40" />
                    <p class="order-complete-page__loading-text">Loading your order details...</p>
                </div>
                <VAlert v-else-if="error" type="error" variant="tonal"> Error loading order: {{ error.message }} </VAlert>
                <template v-else-if="order">
                    <div class="order-complete-page__hero-grid">
                        <div class="order-complete-page__copy">
                            <span class="order-complete-page__eyebrow">Order confirmed</span>
                            <h1 class="order-complete-page__title">Thank you. Your order is in and the next steps are already underway.</h1>
                            <p class="order-complete-page__description">
                                We have received your order and sent the details to {{ order.email || customer?.email || "your email" }}.
                                You can review everything below.
                            </p>
                            <div class="order-complete-page__hero-actions">
                                <VBtn color="primary" rounded="pill" class="text-none px-7" to="/">Continue shopping</VBtn>
                                <div class="order-complete-page__order-chip">Order #{{ order.display_id }}</div>
                            </div>
                        </div>
                        <div class="order-complete-page__progress-card">
                            <div v-for="item in statusItems" :key="item.label" class="order-complete-page__status-item">
                                <span class="order-complete-page__status-label">{{ item.label }}</span>
                                <strong class="order-complete-page__status-value">{{ item.value }}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="order-complete-page__content-grid">
                        <div class="order-complete-page__main">
                            <section class="order-complete-page__section-card">
                                <div class="order-complete-page__section-intro">
                                    <span class="order-complete-page__section-eyebrow">Customer details</span>
                                    <h2 class="order-complete-page__section-title">Who and where this order is going.</h2>
                                </div>
                                <div class="order-complete-page__details-grid">
                                    <article class="order-complete-page__detail-panel">
                                        <h3 class="order-complete-page__panel-title">Shipping address</h3>
                                        <p class="order-complete-page__address-text">
                                            {{ order.shipping_address?.first_name }} {{ order.shipping_address?.last_name }}<br />
                                            {{ order.shipping_address?.address_1 }}<br />
                                            {{ order.shipping_address?.city }}, {{ order.shipping_address?.province }}<br />
                                            {{ order.shipping_address?.postal_code }}<br />
                                            {{ order.shipping_address?.country?.display_name }}
                                        </p>
                                    </article>
                                    <article class="order-complete-page__detail-panel">
                                        <h3 class="order-complete-page__panel-title">Billing address</h3>
                                        <p class="order-complete-page__address-text">
                                            {{ order.billing_address?.first_name }} {{ order.billing_address?.last_name }}<br />
                                            {{ order.billing_address?.address_1 }}<br />
                                            {{ order.billing_address?.city }}, {{ order.billing_address?.province }}<br />
                                            {{ order.billing_address?.postal_code }}<br />
                                            {{ order.billing_address?.country?.display_name }}
                                        </p>
                                    </article>
                                </div>
                                <div class="order-complete-page__meta-row">
                                    <div class="order-complete-page__meta-item">
                                        <span class="order-complete-page__meta-label">Contact email</span>
                                        <strong class="order-complete-page__meta-value">{{
                                            order.email || customer?.email || "Not provided"
                                        }}</strong>
                                    </div>
                                    <div class="order-complete-page__meta-item">
                                        <span class="order-complete-page__meta-label">Shipping method</span>
                                        <strong class="order-complete-page__meta-value">{{
                                            shippingMethod?.name || "Shipping method unavailable"
                                        }}</strong>
                                    </div>
                                </div>
                            </section>
                            <section class="order-complete-page__section-card">
                                <div class="order-complete-page__section-intro">
                                    <span class="order-complete-page__section-eyebrow">Order items</span>
                                    <h2 class="order-complete-page__section-title">Everything included in this order.</h2>
                                </div>
                                <div class="order-complete-page__items-list">
                                    <article v-for="item in order.items" :key="item.id" class="order-complete-page__item-card">
                                        <VImg
                                            :src="item.thumbnail || '/images/placeholder.png'"
                                            :alt="item.product_title || 'Product image'"
                                            width="88"
                                            height="108"
                                            class="order-complete-page__item-image"
                                            cover
                                        />
                                        <div class="order-complete-page__item-body">
                                            <strong class="order-complete-page__item-title">{{ item.product_title }}</strong>
                                            <p class="order-complete-page__item-meta">
                                                Variant: {{ item.variant_title || "Standard option" }}
                                            </p>
                                            <p class="order-complete-page__item-meta">Quantity: {{ item.quantity }}</p>
                                            <p class="order-complete-page__item-meta">
                                                Unit price: {{ formatPrice(Number(item.unit_price || 0), currencyCode) }}
                                            </p>
                                        </div>
                                        <strong class="order-complete-page__item-price">
                                            {{ formatPrice(Number(item.total ?? item.unit_price ?? 0), currencyCode) }}
                                        </strong>
                                    </article>
                                </div>
                            </section>
                        </div>
                        <aside class="order-complete-page__summary-column">
                            <div class="order-complete-page__summary-card">
                                <span class="order-complete-page__section-eyebrow">Order summary</span>
                                <h2 class="order-complete-page__summary-title">A clear breakdown of what was charged.</h2>
                                <div class="order-complete-page__totals">
                                    <div class="order-complete-page__total-row">
                                        <span>Subtotal</span>
                                        <span>{{ formatPrice(Number(order.subtotal || 0), currencyCode) }}</span>
                                    </div>
                                    <div class="order-complete-page__total-row">
                                        <span>Shipping</span>
                                        <span>{{ formatPrice(Number(order.shipping_total || 0), currencyCode) }}</span>
                                    </div>
                                    <div class="order-complete-page__total-row">
                                        <span>Tax</span>
                                        <span>{{ formatPrice(Number(order.tax_total || 0), currencyCode) }}</span>
                                    </div>
                                    <div class="order-complete-page__total-row">
                                        <span>Discount</span>
                                        <span>-{{ formatPrice(Number(order.discount_total || 0), currencyCode) }}</span>
                                    </div>
                                    <div class="order-complete-page__total-row order-complete-page__total-row--grand">
                                        <span>Total</span>
                                        <strong>{{ formatPrice(Number(order.total || 0), currencyCode) }}</strong>
                                    </div>
                                    <div class="order-complete-page__total-row">
                                        <span>Paid</span>
                                        <strong>{{ formatPrice(Number(order.summary?.paid_total || 0), currencyCode) }}</strong>
                                    </div>
                                </div>
                                <div class="order-complete-page__cta-block">
                                    <VBtn color="primary" rounded="pill" class="text-none" block to="/">Back to home</VBtn>
                                    <VBtn variant="outlined" rounded="pill" class="text-none" block to="/account/orders">
                                        View your orders
                                    </VBtn>
                                </div>
                            </div>
                        </aside>
                    </div>
                </template>
            </VContainer>
        </div>
    </section>
</template>

<style scoped lang="scss">
.order-complete-page {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.order-complete-page__hero {
    padding: 5.5rem 0 5rem;
}

.order-complete-page__container {
    position: relative;
    z-index: 1;
}

.order-complete-page__hero-grid,
.order-complete-page__content-grid,
.order-complete-page__details-grid {
    display: grid;
    gap: 2rem;
}

.order-complete-page__hero-grid {
    grid-template-columns: minmax(0, 1.15fr) minmax(18rem, 0.85fr);
    align-items: end;
    margin-bottom: 3rem;
}

.order-complete-page__content-grid {
    grid-template-columns: minmax(0, 1.12fr) minmax(19rem, 0.88fr);
    align-items: start;
}

.order-complete-page__copy,
.order-complete-page__progress-card,
.order-complete-page__main,
.order-complete-page__summary-column {
    animation: order-rise 0.8s ease both;
}

.order-complete-page__progress-card,
.order-complete-page__summary-column {
    animation-delay: 0.12s;
}

.order-complete-page__eyebrow,
.order-complete-page__section-eyebrow {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    background: rgba(1, 12, 128, 0.07);
    color: #010c80;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.order-complete-page__title,
.order-complete-page__section-title,
.order-complete-page__summary-title {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.order-complete-page__title {
    max-width: 12ch;
    margin: 1rem 0;
    font-size: 4.5rem;
    line-height: 0.95;
}

.order-complete-page__description,
.order-complete-page__loading-text,
.order-complete-page__address-text,
.order-complete-page__item-meta,
.order-complete-page__status-label,
.order-complete-page__meta-label {
    margin: 0;
    color: #4b5874;
    line-height: 1.75;
}

.order-complete-page__hero-actions,
.order-complete-page__meta-row,
.order-complete-page__item-card,
.order-complete-page__total-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}

.order-complete-page__hero-actions,
.order-complete-page__total-row {
    align-items: center;
}

.order-complete-page__progress-card,
.order-complete-page__section-card,
.order-complete-page__summary-card,
.order-complete-page__detail-panel {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.order-complete-page__progress-card,
.order-complete-page__section-card,
.order-complete-page__summary-card,
.order-complete-page__detail-panel {
    padding: 1.8rem;
}

.order-complete-page__order-chip {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: 0.45rem 0.95rem;
    border-radius: 999px;
    background: rgba(247, 250, 255, 0.95);
    color: #08173f;
    font-weight: 700;
}

.order-complete-page__status-item + .order-complete-page__status-item {
    margin-top: 0.95rem;
}

.order-complete-page__status-value,
.order-complete-page__panel-title,
.order-complete-page__meta-value,
.order-complete-page__item-title,
.order-complete-page__item-price {
    color: #08173f;
}

.order-complete-page__section-title,
.order-complete-page__summary-title {
    margin: 1rem 0 0.75rem;
    font-size: 2.15rem;
    line-height: 1.08;
}

.order-complete-page__main {
    display: grid;
    gap: 1.25rem;
}

.order-complete-page__details-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 1rem;
}

.order-complete-page__meta-row {
    margin-top: 1rem;
}

.order-complete-page__meta-item {
    display: grid;
    gap: 0.25rem;
}

.order-complete-page__items-list,
.order-complete-page__totals,
.order-complete-page__cta-block {
    display: grid;
    gap: 0.9rem;
}

.order-complete-page__items-list {
    margin-top: 1rem;
}

.order-complete-page__item-card {
    align-items: flex-start;
    padding: 1rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.2rem;
    background: rgba(247, 250, 255, 0.92);
}

.order-complete-page__item-image {
    border-radius: 1rem;
    background: #edf2ff;
}

.order-complete-page__item-body {
    display: grid;
    flex: 1;
    gap: 0.2rem;
}

.order-complete-page__summary-column {
    position: sticky;
    top: 1.5rem;
}

.order-complete-page__total-row {
    color: #4b5874;
}

.order-complete-page__total-row--grand {
    padding-top: 0.75rem;
    border-top: 1px solid rgba(8, 23, 63, 0.08);
}

.order-complete-page__total-row strong {
    color: #08173f;
}

.order-complete-page__loading-state {
    display: grid;
    justify-items: center;
    gap: 0.9rem;
    padding: 4rem 0;
}

@keyframes order-rise {
    from {
        opacity: 0;
        transform: translateY(26px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (max-width: 1100px) {
    .order-complete-page__hero-grid,
    .order-complete-page__content-grid,
    .order-complete-page__details-grid {
        grid-template-columns: 1fr;
    }

    .order-complete-page__title {
        max-width: 100%;
        font-size: 3.2rem;
    }

    .order-complete-page__hero-grid,
    .order-complete-page__content-grid,
    .order-complete-page__details-grid {
        gap: 1.5rem;
    }

    .order-complete-page__hero-grid {
        margin-bottom: 2rem;
    }

    .order-complete-page__progress-card,
    .order-complete-page__section-card,
    .order-complete-page__summary-card,
    .order-complete-page__detail-panel {
        padding: 1.4rem;
    }

    .order-complete-page__section-title,
    .order-complete-page__summary-title {
        font-size: 1.8rem;
    }

    .order-complete-page__summary-column {
        position: static;
    }
}

@media screen and (max-width: 700px) {
    .order-complete-page__hero {
        padding: 3.75rem 0 3.5rem;
    }

    .order-complete-page__title {
        font-size: 2.4rem;
        line-height: 1;
    }

    .order-complete-page__progress-card,
    .order-complete-page__section-card,
    .order-complete-page__summary-card,
    .order-complete-page__detail-panel,
    .order-complete-page__item-card {
        border-radius: 1.2rem;
    }

    .order-complete-page__section-title,
    .order-complete-page__summary-title {
        font-size: 1.6rem;
    }

    .order-complete-page__hero-actions,
    .order-complete-page__meta-row,
    .order-complete-page__item-card,
    .order-complete-page__total-row {
        flex-direction: column;
        align-items: flex-start;
    }
}

@media (prefers-reduced-motion: reduce) {
    .order-complete-page__copy,
    .order-complete-page__progress-card,
    .order-complete-page__main,
    .order-complete-page__summary-column {
        animation: none;
    }
}
</style>
