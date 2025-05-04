<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useCartStore } from "@/stores/cartStore"

useHead({
    title: "Cart | Ecommerce"
})

const cartStore = useCartStore()
const { cart } = storeToRefs(cartStore)
const { removeLineItem } = cartStore

const formatPrice = (amount: number) => `${amount.toFixed(2)} €`

const removeItem = async (lineItemId: string) => {
    if (!cart.value?.id) {
        throw new Error("No active cart found")
    }

    try {
        await removeLineItem(lineItemId)
    } catch (err) {
        console.error("Failed to remove item:", err)
    }
}
</script>

<template>
    <section class="py-10">
        <VContainer>
            <VRow class="mb-6" align="center" justify="space-between">
                <VCol cols="12" lg="6">
                    <h1 class="text-h5 font-weight-bold">Shopping Cart</h1>
                </VCol>
                <VCol cols="12" lg="6" class="text-lg-end text-sm-start mt-2 mt-lg-0">
                    <p class="mb-0"><strong>Total:</strong> {{ formatPrice(Number(cart?.total || 0)) }}</p>
                </VCol>
            </VRow>

            <VRow>
                <VCol cols="12" lg="7">
                    <VCard v-for="item in cart?.items || []" :key="item.id" class="mb-4" flat>
                        <VCardText class="d-flex flex-row gap-4">
                            <NuxtLink :to="`${PRODUCT_URL_HANDLE}/${item.product_handle}`">
                                <VImg
                                    :src="item.thumbnail || '/images/placeholder.png'"
                                    :alt="item.product_title ?? ''"
                                    width="80"
                                    height="100"
                                    class="rounded"
                                    cover
                                />
                            </NuxtLink>
                            <div class="flex-grow-1">
                                <div class="d-flex justify-space-between">
                                    <div>
                                        <p class="text-subtitle-1 mb-1">
                                            <NuxtLink :to="`${PRODUCT_URL_HANDLE}/${item.product_handle}`">
                                                {{ item.product_title }}
                                            </NuxtLink>
                                        </p>
                                        <p class="text-body-2">{{ item.product_description }}</p>
                                        <p class="text-caption">Option: {{ item.variant_title }}</p>
                                        <p class="text-caption">Code: {{ item.variant_sku ?? "N/A" }}</p>
                                    </div>
                                    <VBtn icon color="error" variant="text" @click="removeItem(item.id)" aria-label="Remove">
                                        <VIcon>mdi-delete</VIcon>
                                    </VBtn>
                                </div>
                                <div class="text-end mt-2">
                                    <strong>{{ formatPrice(Number(item.unit_price || 0) * Number(item.quantity || 1)) }}</strong>
                                </div>
                            </div>
                        </VCardText>
                    </VCard>

                    <p v-if="!cart?.items?.length" class="text-center text-grey mt-6">Your cart is empty.</p>
                </VCol>
                <VCol cols="12" lg="5">
                    <VCard class="pa-6" elevation="2">
                        <h2 class="text-h6 mb-4">Order Summary</h2>
                        <VForm id="couponForm">
                            <VTextField
                                name="couponTextInput"
                                placeholder="Enter coupon code"
                                prepend-inner-icon="mdi-ticket-percent"
                                variant="outlined"
                                hide-details
                            />
                            <VBtn class="mt-3" color="primary" block type="submit">Apply</VBtn>
                        </VForm>

                        <VDivider class="my-4" />

                        <div class="d-flex justify-space-between mb-2">
                            <span><strong>Subtotal:</strong></span>
                            <span>{{ formatPrice(Number(cart?.subtotal || 0)) }}</span>
                        </div>
                        <div class="d-flex justify-space-between mb-6">
                            <span class="text-lg font-weight-bold">Total:</span>
                            <span class="text-lg font-weight-bold">{{ formatPrice(Number(cart?.total || 0)) }}</span>
                        </div>

                        <NuxtLink :class="{ 'pointer-events-none opacity-50': !cart?.items?.length }" to="/checkout">
                            <VBtn color="primary" block :disabled="!cart?.items?.length"> Checkout </VBtn>
                        </NuxtLink>
                    </VCard>
                </VCol>
            </VRow>
        </VContainer>
    </section>
</template>
