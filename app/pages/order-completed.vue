<script setup lang="ts">
import type { OrderDTO } from "@medusajs/types"

import { formatPrice } from "@/utils/formatPrice"

definePageMeta({ layout: "checkout" })

useHead({ title: "Order Completed | Ecommerce" })

const route = useRoute()
const orderId = route.query.orderId

const { customer } = storeToRefs(useCustomerStore())

if (!orderId) throw new Error("Missing orderId")

const {
    data: orderRes,
    pending,
    error
} = await useFetch<{ order: OrderDTO }>(`/api/orders/${orderId}`, {
    method: "GET"
})
</script>

<template>
  <VContainer class="py-8">
    <div v-if="pending">Loading order…</div>
    <div v-else-if="error">Error loading order: {{ error.message }}</div>
    <div v-else>
      <VRow>
        <VCol cols="12" md="8">
          <VCard class="mb-6">
            <VCardTitle>Order #{{ orderRes?.order.display_id }}</VCardTitle>
            <VCardText>
              <p><strong>Status:</strong> {{ orderRes?.order.status }}</p>
              <p><strong>Payment:</strong> {{ orderRes?.order.payment_status }}</p>
              <p><strong>Date:</strong> {{ new Date(orderRes?.order.created_at ?? new Date()).toLocaleDateString() }}</p>
              <p v-if="orderRes?.order.email"><strong>Email:</strong> {{ orderRes.order.email }}</p>
              <p v-if="customer">
                <strong>Customer:</strong> {{ customer.first_name }}
                {{ customer.last_name }}
              </p>
            </VCardText>
          </VCard>

          <VCard class="mb-6">
            <VCardTitle>Shipping Address</VCardTitle>
            <VCardText>
              <p>
                {{ orderRes?.order?.shipping_address?.first_name }} {{ orderRes?.order?.shipping_address?.last_name }}<br />
                {{ orderRes?.order?.shipping_address?.address_1 }}<br />
                {{ orderRes?.order?.shipping_address?.city }}, {{ orderRes?.order?.shipping_address?.province }}<br />
                {{ orderRes?.order?.shipping_address?.postal_code }}<br />
                {{ orderRes?.order?.shipping_address?.country?.display_name }}
              </p>
            </VCardText>

            <VDivider />

            <VCardTitle>Billing Address</VCardTitle>
            <VCardText>
              <p>
                {{ orderRes?.order?.billing_address?.first_name }} {{ orderRes?.order?.billing_address?.last_name }}<br />
                {{ orderRes?.order?.billing_address?.address_1 }}<br />
                {{ orderRes?.order?.billing_address?.city }}, {{ orderRes?.order?.billing_address?.province }}<br />
                {{ orderRes?.order?.billing_address?.postal_code }}<br />
                {{ orderRes?.order?.billing_address?.country?.display_name }}
              </p>
            </VCardText>
          </VCard>

          <VCard class="mb-6">
            <VCardTitle>Shipping Method</VCardTitle>
            <VCardText>
              <p v-if="orderRes?.order?.shipping_methods?.[0]">
                {{ orderRes.order.shipping_methods[0].name }} —
                {{
                  formatPrice(
                    Number(orderRes.order.shipping_methods[0].amount ?? 0),
                    orderRes.order.currency_code ?? DEFAULT_CURENCY
                  )
                }}
              </p>
            </VCardText>
          </VCard>

          <VCard>
            <VCardTitle>Order Items</VCardTitle>
            <VCardText>
              <VList dense>
                <VListItem v-for="item in orderRes?.order.items" :key="item.id" class="align-start">
                  <VListItemAvatar>
                    <VImg :src="item.thumbnail ?? ''" width="60" />
                  </VListItemAvatar>
                  <VListItemContent>
                    <VListItemTitle>{{ item.product_title }} × {{ item.quantity }}</VListItemTitle>
                    <VListItemSubtitle>
                      Variant: {{ item.variant_title }}<br />
                      Options:
                      <span v-for="(val, key) in item.variant_option_values" :key="key"> {{ key }}: {{ val }} </span>
                    </VListItemSubtitle>
                    <VListItemSubtitle>
                      Unit Price:
                      {{ formatPrice(item.unit_price, orderRes?.order.currency_code ?? DEFAULT_CURENCY) }}
                    </VListItemSubtitle>
                  </VListItemContent>
                </VListItem>
              </VList>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" md="4">
          <VCard>
            <VCardTitle>Order Summary</VCardTitle>
            <VCardText>
              <p>
                <strong>Subtotal:</strong>
                {{ formatPrice(Number(orderRes?.order.subtotal), orderRes?.order.currency_code ?? DEFAULT_CURENCY) }}
              </p>
              <p>
                <strong>Shipping:</strong>
                {{ formatPrice(Number(orderRes?.order.shipping_total), orderRes?.order.currency_code ?? DEFAULT_CURENCY) }}
              </p>
              <p>
                <strong>Tax:</strong>
                {{ formatPrice(Number(orderRes?.order.tax_total), orderRes?.order.currency_code ?? DEFAULT_CURENCY) }}
              </p>
              <p>
                <strong>Discount:</strong> -{{
                  formatPrice(Number(orderRes?.order.discount_total), orderRes?.order.currency_code ?? DEFAULT_CURENCY)
                }}
              </p>
              <VDivider class="my-2" />
              <p>
                <strong>Total:</strong>
                {{ formatPrice(Number(orderRes?.order.total), orderRes?.order.currency_code ?? DEFAULT_CURENCY) }}
              </p>
              <p>
                <strong>Paid:</strong>
                {{
                  formatPrice(
                    Number(orderRes?.order.summary?.paid_total),
                    orderRes?.order.currency_code ?? DEFAULT_CURENCY
                  )
                }}
              </p>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </VContainer>
</template>
