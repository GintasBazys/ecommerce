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
    <section class="orderCompletePage">
        <div class="orderCompletePage__hero">
            <VContainer class="orderCompletePage__container">
                <div v-if="pending" class="orderCompletePage__loadingState">
                    <VProgressCircular indeterminate color="primary" size="40" />
                    <p class="orderCompletePage__loadingText">Loading your order details...</p>
                </div>
                <VAlert v-else-if="error" type="error" variant="tonal"> Error loading order: {{ error.message }} </VAlert>
                <template v-else-if="order">
                    <div class="orderCompletePage__heroGrid">
                        <div class="orderCompletePage__copy">
                            <span class="orderCompletePage__eyebrow">Order confirmed</span>
                            <h1 class="orderCompletePage__title">Thank you. Your order is in and the next steps are already underway.</h1>
                            <p class="orderCompletePage__description">
                                We have received your order and sent the details to {{ order.email || customer?.email || "your email" }}.
                                You can review everything below.
                            </p>
                            <div class="orderCompletePage__heroActions">
                                <VBtn color="primary" rounded="pill" class="text-none px-7" to="/">Continue shopping</VBtn>
                                <div class="orderCompletePage__orderChip">Order #{{ order.display_id }}</div>
                            </div>
                        </div>
                        <div class="orderCompletePage__progressCard">
                            <div v-for="item in statusItems" :key="item.label" class="orderCompletePage__statusItem">
                                <span class="orderCompletePage__statusLabel">{{ item.label }}</span>
                                <strong class="orderCompletePage__statusValue">{{ item.value }}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="orderCompletePage__contentGrid">
                        <div class="orderCompletePage__main">
                            <section class="orderCompletePage__sectionCard">
                                <div class="orderCompletePage__sectionIntro">
                                    <span class="orderCompletePage__sectionEyebrow">Customer details</span>
                                    <h2 class="orderCompletePage__sectionTitle">Who and where this order is going.</h2>
                                </div>
                                <div class="orderCompletePage__detailsGrid">
                                    <article class="orderCompletePage__detailPanel">
                                        <h3 class="orderCompletePage__panelTitle">Shipping address</h3>
                                        <p class="orderCompletePage__addressText">
                                            {{ order.shipping_address?.first_name }} {{ order.shipping_address?.last_name }}<br />
                                            {{ order.shipping_address?.address_1 }}<br />
                                            {{ order.shipping_address?.city }}, {{ order.shipping_address?.province }}<br />
                                            {{ order.shipping_address?.postal_code }}<br />
                                            {{ order.shipping_address?.country?.display_name }}
                                        </p>
                                    </article>
                                    <article class="orderCompletePage__detailPanel">
                                        <h3 class="orderCompletePage__panelTitle">Billing address</h3>
                                        <p class="orderCompletePage__addressText">
                                            {{ order.billing_address?.first_name }} {{ order.billing_address?.last_name }}<br />
                                            {{ order.billing_address?.address_1 }}<br />
                                            {{ order.billing_address?.city }}, {{ order.billing_address?.province }}<br />
                                            {{ order.billing_address?.postal_code }}<br />
                                            {{ order.billing_address?.country?.display_name }}
                                        </p>
                                    </article>
                                </div>
                                <div class="orderCompletePage__metaRow">
                                    <div class="orderCompletePage__metaItem">
                                        <span class="orderCompletePage__metaLabel">Contact email</span>
                                        <strong class="orderCompletePage__metaValue">{{
                                            order.email || customer?.email || "Not provided"
                                        }}</strong>
                                    </div>
                                    <div class="orderCompletePage__metaItem">
                                        <span class="orderCompletePage__metaLabel">Shipping method</span>
                                        <strong class="orderCompletePage__metaValue">{{
                                            shippingMethod?.name || "Shipping method unavailable"
                                        }}</strong>
                                    </div>
                                </div>
                            </section>
                            <section class="orderCompletePage__sectionCard">
                                <div class="orderCompletePage__sectionIntro">
                                    <span class="orderCompletePage__sectionEyebrow">Order items</span>
                                    <h2 class="orderCompletePage__sectionTitle">Everything included in this order.</h2>
                                </div>
                                <div class="orderCompletePage__itemsList">
                                    <article v-for="item in order.items" :key="item.id" class="orderCompletePage__itemCard">
                                        <VImg
                                            :src="item.thumbnail || '/images/placeholder.png'"
                                            :alt="item.product_title || 'Product image'"
                                            width="88"
                                            height="108"
                                            class="orderCompletePage__itemImage"
                                            cover
                                        />
                                        <div class="orderCompletePage__itemBody">
                                            <strong class="orderCompletePage__itemTitle">{{ item.product_title }}</strong>
                                            <p class="orderCompletePage__itemMeta">
                                                Variant: {{ item.variant_title || "Standard option" }}
                                            </p>
                                            <p class="orderCompletePage__itemMeta">Quantity: {{ item.quantity }}</p>
                                            <p class="orderCompletePage__itemMeta">
                                                Unit price: {{ formatPrice(Number(item.unit_price || 0), currencyCode) }}
                                            </p>
                                        </div>
                                        <strong class="orderCompletePage__itemPrice">
                                            {{ formatPrice(Number(item.total ?? item.unit_price ?? 0), currencyCode) }}
                                        </strong>
                                    </article>
                                </div>
                            </section>
                        </div>
                        <aside class="orderCompletePage__summaryColumn">
                            <div class="orderCompletePage__summaryCard">
                                <span class="orderCompletePage__sectionEyebrow">Order summary</span>
                                <h2 class="orderCompletePage__summaryTitle">A clear breakdown of what was charged.</h2>
                                <div class="orderCompletePage__totals">
                                    <div class="orderCompletePage__totalRow">
                                        <span>Subtotal</span>
                                        <span>{{ formatPrice(Number(order.subtotal || 0), currencyCode) }}</span>
                                    </div>
                                    <div class="orderCompletePage__totalRow">
                                        <span>Shipping</span>
                                        <span>{{ formatPrice(Number(order.shipping_total || 0), currencyCode) }}</span>
                                    </div>
                                    <div class="orderCompletePage__totalRow">
                                        <span>Tax</span>
                                        <span>{{ formatPrice(Number(order.tax_total || 0), currencyCode) }}</span>
                                    </div>
                                    <div class="orderCompletePage__totalRow">
                                        <span>Discount</span>
                                        <span>-{{ formatPrice(Number(order.discount_total || 0), currencyCode) }}</span>
                                    </div>
                                    <div class="orderCompletePage__totalRow orderCompletePage__totalRow--grand">
                                        <span>Total</span>
                                        <strong>{{ formatPrice(Number(order.total || 0), currencyCode) }}</strong>
                                    </div>
                                    <div class="orderCompletePage__totalRow">
                                        <span>Paid</span>
                                        <strong>{{ formatPrice(Number(order.summary?.paid_total || 0), currencyCode) }}</strong>
                                    </div>
                                </div>
                                <div class="orderCompletePage__ctaBlock">
                                    <VBtn color="primary" rounded="pill" class="text-none" block to="/">Back to home</VBtn>
                                    <VBtn variant="outlined" rounded="pill" class="text-none" block to="/account/orders"
                                    >View your orders</VBtn
                                    >
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
.orderCompletePage {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.orderCompletePage__hero {
    padding: clamp(4.75rem, 7vw, 6.5rem) 0 clamp(4rem, 7vw, 6rem);
}

.orderCompletePage__container {
    position: relative;
    z-index: 1;
}

.orderCompletePage__heroGrid,
.orderCompletePage__contentGrid,
.orderCompletePage__detailsGrid {
    display: grid;
    gap: clamp(1.5rem, 3vw, 2rem);
}

.orderCompletePage__heroGrid {
    grid-template-columns: minmax(0, 1.15fr) minmax(18rem, 0.85fr);
    align-items: end;
    margin-bottom: clamp(2rem, 4vw, 3rem);
}

.orderCompletePage__contentGrid {
    grid-template-columns: minmax(0, 1.12fr) minmax(19rem, 0.88fr);
    align-items: start;
}

.orderCompletePage__copy,
.orderCompletePage__progressCard,
.orderCompletePage__main,
.orderCompletePage__summaryColumn {
    animation: order-rise 0.8s ease both;
}

.orderCompletePage__progressCard,
.orderCompletePage__summaryColumn {
    animation-delay: 0.12s;
}

.orderCompletePage__eyebrow,
.orderCompletePage__sectionEyebrow {
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

.orderCompletePage__title,
.orderCompletePage__sectionTitle,
.orderCompletePage__summaryTitle {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.orderCompletePage__title {
    max-width: 12ch;
    margin: 1rem 0;
    font-size: clamp(2.4rem, 4.4vw, 4.5rem);
    line-height: 0.95;
}

.orderCompletePage__description,
.orderCompletePage__loadingText,
.orderCompletePage__addressText,
.orderCompletePage__itemMeta,
.orderCompletePage__statusLabel,
.orderCompletePage__metaLabel {
    margin: 0;
    color: #4b5874;
    line-height: 1.75;
}

.orderCompletePage__heroActions,
.orderCompletePage__metaRow,
.orderCompletePage__itemCard,
.orderCompletePage__totalRow {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}

.orderCompletePage__heroActions,
.orderCompletePage__totalRow {
    align-items: center;
}

.orderCompletePage__progressCard,
.orderCompletePage__sectionCard,
.orderCompletePage__summaryCard,
.orderCompletePage__detailPanel {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.orderCompletePage__progressCard,
.orderCompletePage__sectionCard,
.orderCompletePage__summaryCard,
.orderCompletePage__detailPanel {
    padding: clamp(1.3rem, 2vw, 1.8rem);
}

.orderCompletePage__orderChip {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: 0.45rem 0.95rem;
    border-radius: 999px;
    background: rgba(247, 250, 255, 0.95);
    color: #08173f;
    font-weight: 700;
}

.orderCompletePage__statusItem + .orderCompletePage__statusItem {
    margin-top: 0.95rem;
}

.orderCompletePage__statusValue,
.orderCompletePage__panelTitle,
.orderCompletePage__metaValue,
.orderCompletePage__itemTitle,
.orderCompletePage__itemPrice {
    color: #08173f;
}

.orderCompletePage__sectionTitle,
.orderCompletePage__summaryTitle {
    margin: 1rem 0 0.75rem;
    font-size: clamp(1.6rem, 2.4vw, 2.15rem);
    line-height: 1.08;
}

.orderCompletePage__main {
    display: grid;
    gap: 1.25rem;
}

.orderCompletePage__detailsGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 1rem;
}

.orderCompletePage__metaRow {
    margin-top: 1rem;
}

.orderCompletePage__metaItem {
    display: grid;
    gap: 0.25rem;
}

.orderCompletePage__itemsList,
.orderCompletePage__totals,
.orderCompletePage__ctaBlock {
    display: grid;
    gap: 0.9rem;
}

.orderCompletePage__itemsList {
    margin-top: 1rem;
}

.orderCompletePage__itemCard {
    align-items: flex-start;
    padding: 1rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.2rem;
    background: rgba(247, 250, 255, 0.92);
}

.orderCompletePage__itemImage {
    border-radius: 1rem;
    background: #edf2ff;
}

.orderCompletePage__itemBody {
    display: grid;
    flex: 1;
    gap: 0.2rem;
}

.orderCompletePage__summaryColumn {
    position: sticky;
    top: 1.5rem;
}

.orderCompletePage__totalRow {
    color: #4b5874;
}

.orderCompletePage__totalRow--grand {
    padding-top: 0.75rem;
    border-top: 1px solid rgba(8, 23, 63, 0.08);
}

.orderCompletePage__totalRow strong {
    color: #08173f;
}

.orderCompletePage__loadingState {
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
    .orderCompletePage__heroGrid,
    .orderCompletePage__contentGrid,
    .orderCompletePage__detailsGrid {
        grid-template-columns: 1fr;
    }

    .orderCompletePage__title {
        max-width: 100%;
    }

    .orderCompletePage__summaryColumn {
        position: static;
    }
}

@media screen and (max-width: 700px) {
    .orderCompletePage__hero {
        padding: 3.75rem 0 3.5rem;
    }

    .orderCompletePage__title {
        font-size: clamp(2rem, 9vw, 2.8rem);
        line-height: 1;
    }

    .orderCompletePage__progressCard,
    .orderCompletePage__sectionCard,
    .orderCompletePage__summaryCard,
    .orderCompletePage__detailPanel,
    .orderCompletePage__itemCard {
        border-radius: 1.2rem;
    }

    .orderCompletePage__heroActions,
    .orderCompletePage__metaRow,
    .orderCompletePage__itemCard,
    .orderCompletePage__totalRow {
        flex-direction: column;
        align-items: flex-start;
    }
}

@media (prefers-reduced-motion: reduce) {
    .orderCompletePage__copy,
    .orderCompletePage__progressCard,
    .orderCompletePage__main,
    .orderCompletePage__summaryColumn {
        animation: none;
    }
}
</style>
