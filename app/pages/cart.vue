<script setup lang="ts">
import debounce from "lodash/debounce"

import type { CartLineItemDTO } from "@medusajs/types"

import { DEFAULT_CURENCY, PRODUCT_URL_HANDLE } from "@/utils/consts"
import { formatPrice } from "@/utils/formatPrice"


definePageMeta({ layout: "checkout" })

useHead({ title: "Cart | Ecommerce" })

const { cart } = storeToRefs(useCartStore())
const { removeLineItem, updateLineItem, loadCart } = useCartStore()

const qtyMap = reactive<Record<string, number>>({})
const updating = reactive<Record<string, boolean>>({})
const isApplyingCoupon = ref<boolean>(false)

watch(
    cart,
    (newCart) => {
        newCart?.items?.forEach((item: CartLineItemDTO) => {
            if (qtyMap[item.id] === undefined) {
                qtyMap[item.id] = Number(item.quantity)
            }
            if (updating[item.id] === undefined) {
                updating[item.id] = false
            }
        })
    },
    { immediate: true }
)

const originalQtys = computed<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    cart.value?.items?.forEach((item) => {
        map[item.id] = Number(item.quantity)
    })
    return map
})

const isCartDirty = computed<boolean>(() => Object.entries(qtyMap).some(([id, qty]) => qty !== originalQtys.value[id]))

const debouncedQtyUpdate = debounce((id: string, value: number, max: number) => {
    qtyMap[id] = Math.max(1, Math.min(value, max))
}, 300)

async function removeItem(lineItemId: string): Promise<void> {
    if (!cart.value?.id) throw new Error("No active cart found")
    try {
        await removeLineItem(lineItemId)
    } catch (err) {
        console.error("Failed to remove item:", err)
    }
}

function decrementQty(itemId: string): void {
  const current = qtyMap[itemId] ?? 0
  if (current > 1) qtyMap[itemId] = current - 1
}

function incrementQty(item: CartLineItemDTO): void {
  const current = qtyMap[item.id] ?? 0
  const max = item.stocked_quantity ?? Infinity
  if (current < max) qtyMap[item.id] = current + 1
}

async function updateCount(item: CartLineItemDTO): Promise<void> {
  const desiredQty = qtyMap[item.id] ?? Number(item.quantity)
  const currentQty = Number(item.quantity)
  const max = item.stocked_quantity ?? Infinity

  if (desiredQty === currentQty || desiredQty < 1 || desiredQty > max || !cart.value?.id) {
    return
  }

  updating[item.id] = true
  try {
    const variant = {
      inventory_quantity: item.stocked_quantity ?? desiredQty,
      id: item.variant_id ?? null,
      title: item.variant_title ?? "",
      calculated_price: { calculated_amount: Number(item.unit_price) },
    }
    await updateLineItem(variant, desiredQty, true)
  } catch (err) {
    console.error("Failed to update count:", err)
  } finally {
    updating[item.id] = false
  }
}


const isCartLoading = ref<boolean>(true)
onMounted(async () => {
    if (!cart.value) await loadCart()
    isCartLoading.value = false
})

const couponCode = ref<string>("")
async function applyCoupon(): Promise<void> {
    if (!cart.value?.id) {
        console.error("Cart not found")
        return
    }
    isApplyingCoupon.value = true
    try {
        await $fetch("/api/cart/apply-promotion", {
            method: "POST",
            body: {
                cartId: cart.value.id,
                promoCode: couponCode.value
            }
        })
        await loadCart()
        couponCode.value = ""
    } catch (err) {
        console.error("Coupon application error:", err)
    } finally {
        isApplyingCoupon.value = false
    }
}

const currencyCode = computed<string>(() => cart.value?.currency_code ?? DEFAULT_CURENCY)

async function removePromotion(promoCode: string | undefined): Promise<void> {
    if (!cart.value?.id || !promoCode) return

    try {
        await $fetch("/api/cart/remove-promotion", {
            method: "DELETE",
            body: {
                cartId: cart.value.id,
                promo_codes: [promoCode]
            }
        })

        await loadCart()
    } catch (err) {
        console.error("Failed to remove promotion:", err)
    }
}
</script>

<template>
  <section class="py-10">
    <VContainer>
      <div v-if="isCartLoading" class="text-center py-10">
        <VProgressCircular indeterminate color="primary" size="40" />
        <p class="mt-4">Loading your cart...</p>
      </div>

      <template v-else>
        <VRow class="mb-6" align="center" justify="space-between">
          <VCol cols="12" lg="6">
            <h1 class="text-h5 font-weight-bold">Shopping Cart</h1>
          </VCol>
          <VCol cols="12" lg="6" class="text-lg-end text-sm-start mt-2 mt-lg-0">
            <p class="mb-0">
              <strong>Total:</strong>
              {{ formatPrice(Number(cart?.total || 0), currencyCode) }}
            </p>
          </VCol>
        </VRow>

        <VRow>
          <VCol cols="12" lg="7">
            <VCard v-for="item in cart?.items || []" :key="item.id" class="mb-4" flat>
              <VCardText class="d-flex pa-4 ga-5">
                <NuxtLink :to="`${PRODUCT_URL_HANDLE}/${item.product_handle}`" class="flex-shrink-0">
                  <VImg
                    :src="item.thumbnail || '/images/placeholder.png'"
                    :alt="item.product_title ?? ''"
                    width="100"
                    height="120"
                    class="rounded-lg"
                    cover
                  />
                </NuxtLink>

                <div class="flex-grow-1 d-flex flex-column justify-space-between">
                  <div class="d-flex justify-space-between align-start mb-2">
                    <div class="ms-4">
                      <NuxtLink
                        :to="`${PRODUCT_URL_HANDLE}/${item.product_handle}`"
                        class="text-primary text-decoration-none text-subtitle-1 font-weight-medium"
                      >
                        {{ item.product_title }}
                      </NuxtLink>
                      <p class="text-body-2 text-grey-darken-2 mt-1 mb-1">
                        {{ item.product_description }}
                      </p>
                      <p class="text-caption text-grey-darken-1 mb-0">Option: {{ item.variant_title }}</p>
                      <p class="text-caption text-grey-darken-1">Code: {{ item.variant_sku ?? "N/A" }}</p>
                    </div>
                    <VBtn icon color="error" variant="text" aria-label="Remove" @click="removeItem(item.id)">
                      <VIcon>mdi-delete</VIcon>
                    </VBtn>
                  </div>

                  <div class="d-flex align-center gap-2 ms-4">
                    <VBtn icon :disabled="(qtyMap[item.id] ?? 0) <= 1" @click="decrementQty(item.id)">
                      <VIcon>mdi-minus</VIcon>
                    </VBtn>

                    <VTextField
                      v-model.number="qtyMap[item.id]"
                      type="number"
                      hide-details
                      variant="outlined"
                      class="mx-2"
                      density="compact"
                      style="max-width: 80px"
                      @update:model-value="
                        (val) => debouncedQtyUpdate(item.id, Number(val), item.stocked_quantity ?? Infinity)
                      "
                    />

                    <VBtn
                      icon
                      :disabled="(qtyMap[item.id] ?? 0) >= (item.stocked_quantity ?? Infinity)"
                      @click="incrementQty(item)"
                    >
                      <VIcon>mdi-plus</VIcon>
                    </VBtn>
                  </div>

                  <div class="text-end mt-2 me-4">
                    <strong class="text-subtitle-1">
                      {{ formatPrice(Number(item.unit_price || 0) * Number(item.quantity || 1), currencyCode) }}
                    </strong>
                  </div>
                </div>
              </VCardText>
            </VCard>

            <VBtn
              v-if="cart?.items?.length"
              class="mt-4"
              color="primary"
              block
              :loading="Object.values(updating).some(Boolean)"
              :disabled="!isCartDirty || Object.values(updating).some(Boolean)"
              @click="cart?.items?.forEach((item) => updateCount(item))"
            >
              Update Cart
            </VBtn>

            <p v-if="!cart?.items?.length" class="text-center text-grey mt-6">Your cart is empty.</p>
          </VCol>

          <VCol cols="12" lg="5">
            <VCard class="pa-6" elevation="2">
              <h2 class="text-h6 mb-4">Order Summary</h2>
              <VForm @submit.prevent="applyCoupon">
                <VTextField
                  v-model="couponCode"
                  name="couponTextInput"
                  placeholder="Enter coupon code"
                  prepend-inner-icon="mdi-ticket-percent"
                  variant="outlined"
                  hide-details
                />
                <VBtn
                  :loading="isApplyingCoupon"
                  :disabled="isApplyingCoupon"
                  class="mt-3"
                  color="primary"
                  block
                  type="submit"
                >
                  Apply
                </VBtn>
              </VForm>
              <div v-if="cart?.promotions?.length" class="mb-4">
                <h3 class="text-subtitle-1 font-weight-medium mt-4">Applied Promotions:</h3>

                <ul>
                  <li
                    v-for="promo in cart?.promotions"
                    :key="promo.id"
                    class="d-flex justify-space-between align-center border px-3 mb-3"
                  >
                    <span>
                      <strong>{{ promo.code }}&nbsp;</strong>
                      <span class="text-success">
                        {{ formatPrice(Number(promo.application_method?.value) ?? 0, currencyCode) }}
                      </span>
                    </span>

                    <VBtn icon small variant="text" aria-label="Remove promotion" @click="removePromotion(promo.code)">
                      <VIcon>mdi-close</VIcon>
                    </VBtn>
                  </li>
                </ul>
              </div>
              <VDivider class="my-4" />

              <div class="d-flex justify-space-between mb-2">
                <span><strong>Subtotal:</strong></span>
                <span>{{ formatPrice(Number(cart?.subtotal || 0), currencyCode) }}</span>
              </div>
              <div class="d-flex justify-space-between mb-6">
                <span class="text-lg font-weight-bold">Total:</span>
                <span class="text-lg font-weight-bold">
                  {{ formatPrice(Number(cart?.total || 0), currencyCode) }}
                </span>
              </div>

              <NuxtLink :class="{ 'pointer-events-none opacity-50': !cart?.items?.length }" to="/address">
                <VBtn color="primary" block :disabled="!cart?.items?.length || isCartDirty || Number(cart?.total) <= 0">
                  Checkout
                </VBtn>
              </NuxtLink>
            </VCard>
          </VCol>
        </VRow>
      </template>
    </VContainer>
  </section>
</template>
