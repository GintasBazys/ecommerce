<script setup lang="ts">
import type { CartLineItemDTO } from "@medusajs/types"

import { DEFAULT_CURENCY } from "@/utils/consts"
import { formatPrice } from "@/utils/formatPrice"

const { cart, openCartDrawer } = storeToRefs(useCartStore())
const { removeLineItem, updateLineItem } = useCartStore()

const qtyMap = reactive<Record<string, number>>({})
const updating = reactive<Record<string, boolean>>({})

watch(
    cart,
    (newCart) => {
        const newIds = newCart?.items?.map((i) => i.id) || []

        Object.keys(qtyMap).forEach((id) => {
            if (!newIds.includes(id)) {
                Reflect.deleteProperty(qtyMap, id)
                Reflect.deleteProperty(updating, id)
            }
        })

        newCart?.items?.forEach((item) => {
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

async function removeItem(lineItemId: string): Promise<void> {
    if (!cart.value?.id) throw new Error("No active cart found")
    try {
        await removeLineItem(lineItemId)
    } catch (err) {
        console.error("Failed to remove item:", err)
    }
}

function decrementQty(itemId: string): void {
    if (qtyMap[itemId] > 1) qtyMap[itemId]--
}
function incrementQty(item: CartLineItemDTO): void {
    if (qtyMap[item.id] < (item.stocked_quantity ?? Infinity)) {
        qtyMap[item.id]++
    }
}

async function updateCount(item: CartLineItemDTO): Promise<void> {
    const desiredQty = qtyMap[item.id]
    const currentQty = Number(item.quantity)
    if (desiredQty === currentQty || desiredQty < 1 || desiredQty > (item.stocked_quantity ?? Infinity) || !cart.value?.id) {
        return
    }

    updating[item.id] = true
    try {
        const variant = {
            inventory_quantity: item.stocked_quantity ?? desiredQty,
            id: item.variant_id ?? null,
            title: item.variant_title ?? "",
            calculated_price: { calculated_amount: Number(item.unit_price) }
        }

        await updateLineItem(variant, desiredQty, true)
    } catch (err) {
        console.error("Failed to update count:", err)
    } finally {
        updating[item.id] = false
    }
}

function updateCart(): void {
    cart.value?.items?.forEach((item) => updateCount(item))
}

const isAnyUpdating = computed<boolean>(() => Object.values(updating).some(Boolean))

const displayTotal = computed<string>(() => {
    const sum = (cart.value?.items || []).reduce((acc, item) => {
        const qty = qtyMap[item.id] ?? Number(item.quantity)
        return acc + qty * Number(item.unit_price)
    }, 0)
    return formatPrice(sum, cart.value?.currency_code ?? DEFAULT_CURENCY)
})
</script>

<template>
  <ClientOnly>
    <VNavigationDrawer v-model="openCartDrawer" location="right" temporary width="400">
      <VContainer class="pa-4 d-flex flex-column fill-height flex-nowrap">
        <div class="d-flex w-100 justify-space-between align-center mb-4">
          <div class="text-h6">My Cart</div>
          <VBtn icon @click="openCartDrawer = false">
            <VIcon>mdi-close</VIcon>
          </VBtn>
        </div>

        <div class="flex-grow-1 overflow-y-auto">
          <VCard v-for="item in cart?.items || []" :key="item.id" class="mb-4" elevation="1">
            <VCardText class="d-flex ga-4">
              <VImg :src="item.thumbnail" alt="product image" width="100" height="100" class="rounded-lg" cover />

              <div class="d-flex flex-column justify-space-between flex-grow-1">
                <div>
                  <div class="font-weight-medium text-body-1">
                    {{ item.product_title }}
                  </div>
                  <div class="text-body-2">Option: {{ item.variant_title || "N/A" }}</div>
                </div>

                <div class="d-flex justify-space-between align-center">
                  <div class="d-flex align-center">
                    <VBtn icon size="small" :disabled="qtyMap[item.id] <= 1" @click="decrementQty(item.id)">
                      <VIcon>mdi-minus</VIcon>
                    </VBtn>
                    <VBtn
                      icon
                      size="small"
                      :disabled="qtyMap[item.id] >= (item.stocked_quantity ?? Infinity)"
                      @click="incrementQty(item)"
                    >
                      <VIcon>mdi-plus</VIcon>
                    </VBtn>
                  </div>

                  <div class="d-flex align-center ga-2">
                    <span class="font-weight-medium">
                      {{
                        formatPrice(
                          qtyMap[item.id] * Number(item.unit_price),
                          cart?.currency_code ?? DEFAULT_CURENCY
                        )
                      }}
                    </span>
                    <VBtn icon @click="removeItem(item.id)">
                      <VIcon>mdi-trash-can-outline</VIcon>
                    </VBtn>
                  </div>
                </div>
              </div>
            </VCardText>
          </VCard>
        </div>

        <div class="mt-4 w-100">
          <div class="d-flex justify-space-between align-center mb-3">
            <span class="text-subtitle-1 font-weight-medium">Total</span>
            <span class="text-subtitle-1 font-weight-bold">{{ displayTotal }}</span>
          </div>
          <VBtn
            v-if="isCartDirty"
            color="primary"
            block
            :loading="isAnyUpdating"
            :disabled="!isCartDirty || isAnyUpdating"
            @click="updateCart"
          >
            Update Cart
          </VBtn>
          <NuxtLink :class="{ 'pointer-events-none opacity-50': isCartDirty || isAnyUpdating }" to="/address">
            <VBtn color="primary" class="mt-4" block> Go to Checkout </VBtn>
          </NuxtLink>
        </div>
      </VContainer>
    </VNavigationDrawer>
  </ClientOnly>
</template>
