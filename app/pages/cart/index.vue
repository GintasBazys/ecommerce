<script setup lang="ts">
import debounce from "lodash-es/debounce"

import type { CartLineItemDTO } from "@medusajs/types"

import CartHero from "~/components/Cart/CartHero.vue"
import CartLineItem from "~/components/Cart/CartLineItem.vue"
import CartSummary from "~/components/Cart/CartSummary.vue"
import { ALL_PRODUCTS_URL_HANDLE, DEFAULT_CURENCY } from "~/utils/consts"
import { formatPrice } from "~/utils/formatPrice"

definePageMeta({ layout: "checkout" })

useHead({ title: "Cart | Medusa Commerce" })

type PricedCartLineItem = CartLineItemDTO & {
    subtotal?: number | null
    total?: number | null
    tax_total?: number | null
    unit_price?: number | null
}

const cartStore = useCartStore()
const { cart, recoveryMessage } = storeToRefs(cartStore)
const { removeLineItem, updateLineItem, loadCart, clearRecoveryMessage } = cartStore
const qtyMap = reactive<Record<string, number>>({})
const updating = reactive<Record<string, boolean>>({})
const isApplyingCoupon = ref<boolean>(false)
const isCartLoading = ref<boolean>(true)
const couponCode = ref<string>("")

watch(
    cart,
    (newCart) => {
        const nextItemIds = new Set((newCart?.items ?? []).map((item) => item.id))

        Object.keys(qtyMap).forEach((itemId) => {
            if (!nextItemIds.has(itemId)) {
                delete qtyMap[itemId]
            }
        })

        Object.keys(updating).forEach((itemId) => {
            if (!nextItemIds.has(itemId)) {
                delete updating[itemId]
            }
        })

        newCart?.items?.forEach((item: CartLineItemDTO) => {
            qtyMap[item.id] = Number(item.quantity)
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
const hasCartItems = computed<boolean>(() => Boolean(cart.value?.items?.length))
const isUpdatingCart = computed<boolean>(() => Object.values(updating).some(Boolean))
const trimmedCouponCode = computed<string>(() => couponCode.value.trim())
const displayShippingAmount = computed<number>(() => (hasCartItems.value ? Number(cart.value?.shipping_total || 0) : 0))
const displaySubtotalAmount = computed<number>(() => (hasCartItems.value ? Number(cart.value?.subtotal || 0) : 0))
const displayTaxAmount = computed<number>(() => (hasCartItems.value ? Number(cart.value?.tax_total || 0) : 0))
const displayTotalAmount = computed<number>(() =>
    Math.max(0, hasCartItems.value ? Number(cart.value?.total || 0) - displayShippingAmount.value : 0)
)
const isCheckoutDisabled = computed<boolean>(() => !hasCartItems.value || isCartDirty.value || displayTotalAmount.value <= 0)
const isCouponDisabled = computed<boolean>(
    () => !hasCartItems.value || isCartDirty.value || isApplyingCoupon.value || !trimmedCouponCode.value
)
const currencyCode = computed<string>(() => cart.value?.currency_code ?? DEFAULT_CURENCY)
const cartItemCount = computed<number>(() => (cart.value?.items ?? []).reduce((total, item) => total + Number(item.quantity || 0), 0))
const appliedPromotionCount = computed<number>(() => cart.value?.promotions?.length ?? 0)
const displaySubtotal = computed<string>(() => formatPrice(displaySubtotalAmount.value, currencyCode.value))
const displayTax = computed<string>(() => formatPrice(displayTaxAmount.value, currencyCode.value))
const displayTotal = computed<string>(() => formatPrice(displayTotalAmount.value, currencyCode.value))
const couponHint = computed<string>(() => {
    if (!hasCartItems.value) {
        return "Add an item to your cart to unlock promo codes."
    }

    if (isCartDirty.value) {
        return "Save your cart updates before applying a code."
    }

    if (!trimmedCouponCode.value) {
        return "Enter a promo code to apply it."
    }

    return "Promo codes apply to your current saved cart."
})

const debouncedQtyUpdate = debounce((id: string, value: number, max: number) => {
    qtyMap[id] = Math.max(1, Math.min(value, max))
}, 300)

function onQuantityInput(item: CartLineItemDTO, event: Event): void {
    const value = event.target instanceof HTMLInputElement ? Number(event.target.value) : Number(item.quantity)
    debouncedQtyUpdate(item.id, value, item.stocked_quantity ?? Infinity)
}

async function removeItem(lineItemId: string): Promise<void> {
    if (!cart.value?.id) {
        throw new Error("No active cart found")
    }

    try {
        await removeLineItem(lineItemId)
    } catch (err) {
        console.error("Failed to remove item:", err)
    }
}

function decrementQty(itemId: string): void {
    const current = qtyMap[itemId] ?? 0
    if (current > 1) {
        qtyMap[itemId] = current - 1
    }
}

function incrementQty(item: CartLineItemDTO): void {
    const current = qtyMap[item.id] ?? 0
    const max = item.stocked_quantity ?? Infinity
    if (current < max) {
        qtyMap[item.id] = current + 1
    }
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
            calculated_price: { calculated_amount: Number(item.unit_price) }
        }
        await updateLineItem(variant, desiredQty, true)
    } catch (err) {
        console.error("Failed to update count:", err)
    } finally {
        updating[item.id] = false
    }
}

onMounted(async () => {
    if (!cart.value) {
        await loadCart()
    }
    isCartLoading.value = false
})

async function applyCoupon(): Promise<void> {
    if (!cart.value?.id || isCouponDisabled.value) {
        return
    }

    isApplyingCoupon.value = true
    try {
        await $fetch("/api/cart/apply-promotion", {
            method: "POST",
            body: {
                cartId: cart.value.id,
                promoCode: trimmedCouponCode.value
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

function getAmountWithTax(item: CartLineItemDTO): number {
    const pricedItem = item as PricedCartLineItem
    const savedQuantity = Math.max(Number(item.quantity) || 1, 1)
    const desiredQuantity = Math.max(Number(qtyMap[item.id] ?? item.quantity) || 1, 1)
    const unitAmountWithTax = pricedItem.total != null ? Number(pricedItem.total) / savedQuantity : Number(pricedItem.unit_price ?? 0)

    return unitAmountWithTax * desiredQuantity
}

function getAmountWithoutTax(item: CartLineItemDTO): number {
    const pricedItem = item as PricedCartLineItem
    const savedQuantity = Math.max(Number(item.quantity) || 1, 1)
    const desiredQuantity = Math.max(Number(qtyMap[item.id] ?? item.quantity) || 1, 1)

    if (pricedItem.subtotal != null) {
        return (Number(pricedItem.subtotal) / savedQuantity) * desiredQuantity
    }

    return getAmountWithTax(item) - (Number(pricedItem.tax_total ?? 0) / savedQuantity) * desiredQuantity
}

async function removePromotion(promoCode: string | undefined): Promise<void> {
    if (!cart.value?.id || !promoCode) {
        return
    }

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

async function updateCart(): Promise<void> {
    if (!cart.value?.items?.length || !isCartDirty.value) {
        return
    }

    await Promise.all(cart.value.items.map((item) => updateCount(item)))
}

function getPromotionValue(promo: { application_method?: { value?: number | string | null } | null }): string {
    const value = Number(promo.application_method?.value ?? 0)
    return formatPrice(value, currencyCode.value)
}
</script>

<template>
    <main
        class="bg-[radial-gradient(circle_at_top_left,rgba(1,12,128,0.07),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#ffffff_42%,#f6f9ff_100%)] pt-[calc(var(--site-header-offset,98px)+1.25rem)] pb-14 sm:pt-[calc(var(--site-header-offset,98px)+1.75rem)] sm:pb-18"
    >
        <div class="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6">
            <section class="grid gap-5 lg:gap-7 xl:grid-cols-[minmax(0,1.15fr)_minmax(21rem,0.85fr)]">
                <div class="space-y-5 sm:space-y-6">
                    <CartHero :total="displayTotal" :item-count="cartItemCount" :continue-shopping-url="ALL_PRODUCTS_URL_HANDLE" />

                    <section
                        class="shadow-panel rounded-[1.75rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-4 sm:p-5"
                    >
                        <div
                            v-if="recoveryMessage"
                            class="rounded-card-sm mb-4 flex items-start justify-between gap-3 border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950"
                            role="status"
                        >
                            <p>{{ recoveryMessage }}</p>
                            <button
                                type="button"
                                class="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-white/80 text-amber-900 transition hover:bg-white focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
                                aria-label="Dismiss cart recovery message"
                                @click="clearRecoveryMessage"
                            >
                                <span aria-hidden="true">x</span>
                            </button>
                        </div>

                        <div v-if="isCartLoading" class="grid justify-items-center gap-4 px-4 py-14 text-center">
                            <span
                                class="border-brand-200 border-t-brand-700 inline-flex h-10 w-10 animate-spin rounded-full border-4"
                            ></span>
                            <p class="text-sm leading-6 text-slate-600">Loading your cart...</p>
                        </div>

                        <template v-else-if="hasCartItems">
                            <div class="grid gap-4">
                                <CartLineItem
                                    v-for="item in cart?.items || []"
                                    :key="item.id"
                                    :item="item"
                                    :quantity="qtyMap[item.id] ?? Number(item.quantity)"
                                    :max-quantity="item.stocked_quantity ?? Infinity"
                                    :amount-with-tax="getAmountWithTax(item)"
                                    :amount-without-tax="getAmountWithoutTax(item)"
                                    @remove="removeItem(item.id)"
                                    @decrement="decrementQty(item.id)"
                                    @increment="incrementQty(item)"
                                    @quantity-input="onQuantityInput(item, $event)"
                                />
                            </div>

                            <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p class="text-sm leading-6 text-slate-600">
                                    <span v-if="isCartDirty">You have unsaved quantity changes.</span>
                                    <span v-else>Your cart is up to date and ready for checkout.</span>
                                </p>
                                <button
                                    type="button"
                                    class="ui-btn-accent min-h-12 px-6"
                                    :disabled="!isCartDirty || isUpdatingCart"
                                    @click="updateCart"
                                >
                                    <span
                                        v-if="isUpdatingCart"
                                        class="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-900/40 border-t-slate-950"
                                    ></span>
                                    Update cart
                                </button>
                            </div>
                        </template>

                        <div
                            v-else
                            class="grid justify-items-start gap-4 rounded-[1.4rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_12px_30px_rgba(8,27,90,0.05)] sm:p-8"
                        >
                            <div
                                class="inline-flex h-13 w-13 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-900"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    class="h-6 w-6"
                                    stroke="currentColor"
                                    stroke-width="1.8"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.76L21 7H7.4"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                    <path
                                        d="M10 20a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm8 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h2 class="text-[1.55rem] leading-[1.08] font-semibold tracking-[-0.04rem] text-slate-950">
                                    Your cart is empty
                                </h2>
                                <p class="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                                    Add a few products you love and come back here to review everything before checkout.
                                </p>
                            </div>
                            <NuxtLink :to="ALL_PRODUCTS_URL_HANDLE" class="ui-btn-accent min-h-12 px-6"> Browse products </NuxtLink>
                        </div>
                    </section>
                </div>

                <aside class="xl:sticky xl:top-6 xl:self-start">
                    <CartSummary
                        :item-count="cartItemCount"
                        :promotion-count="appliedPromotionCount"
                        :coupon-code="couponCode"
                        :has-cart-items="hasCartItems"
                        :is-cart-dirty="isCartDirty"
                        :is-applying-coupon="isApplyingCoupon"
                        :is-coupon-disabled="isCouponDisabled"
                        :is-checkout-disabled="isCheckoutDisabled"
                        :coupon-hint="couponHint"
                        :subtotal="displaySubtotal"
                        :tax="displayTax"
                        :total="displayTotal"
                        :promotions="cart?.promotions || []"
                        :promotion-value="getPromotionValue"
                        @update="couponCode = $event"
                        @submit="applyCoupon"
                        @remove-promotion="removePromotion"
                    />
                </aside>
            </section>
        </div>
    </main>
</template>
