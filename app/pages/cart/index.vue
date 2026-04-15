<script setup lang="ts">
import debounce from "lodash-es/debounce"

import TaxedLinePrice from "../../components/Cart/TaxedLinePrice.vue"

import type { CartLineItemDTO } from "@medusajs/types"

import { ALL_PRODUCTS_URL_HANDLE, DEFAULT_CURENCY, PRODUCT_URL_HANDLE } from "~/utils/consts"
import { formatPrice } from "~/utils/formatPrice"

definePageMeta({ layout: "checkout" })

useHead({ title: "Cart | Ecommerce" })

type PricedCartLineItem = CartLineItemDTO & {
    subtotal?: number | null
    total?: number | null
    tax_total?: number | null
    unit_price?: number | null
}

const { cart } = storeToRefs(useCartStore())
const { removeLineItem, updateLineItem, loadCart } = useCartStore()
const qtyMap = reactive<Record<string, number>>({})
const updating = reactive<Record<string, boolean>>({})
const isApplyingCoupon = ref<boolean>(false)
const isCartLoading = ref<boolean>(true)

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
const isCheckoutDisabled = computed<boolean>(() => !hasCartItems.value || isCartDirty.value || Number(cart.value?.total) <= 0)
const isCouponDisabled = computed<boolean>(
    () => !hasCartItems.value || isCartDirty.value || isApplyingCoupon.value || !trimmedCouponCode.value
)
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

const couponCode = ref<string>("")
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

const currencyCode = computed<string>(() => cart.value?.currency_code ?? DEFAULT_CURENCY)

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
</script>

<template>
    <main class="cart-page">
        <div class="cart-page__hero">
            <VContainer class="cart-page__container">
                <div v-if="isCartLoading" class="cart-page__loading-state">
                    <VProgressCircular indeterminate color="primary" size="40" />
                    <p class="cart-page__loading-text">Loading your cart...</p>
                </div>
                <template v-else>
                    <div class="cart-page__hero-grid">
                        <div class="cart-page__hero-copy">
                            <span class="cart-page__eyebrow">Shopping cart</span>
                            <h1 class="cart-page__title">Review your picks before you head to checkout.</h1>
                            <p class="cart-page__description">
                                Fine-tune quantities, remove anything that no longer fits, and keep your order feeling as considered as the
                                rest of the shop.
                            </p>
                            <div class="cart-page__hero-actions">
                                <VBtn color="primary" rounded="pill" size="large" class="text-none px-7" :to="ALL_PRODUCTS_URL_HANDLE">
                                    Continue shopping
                                </VBtn>
                                <div class="cart-page__stat-card">
                                    <span class="cart-page__stat-label">Current total</span>
                                    <strong class="cart-page__stat-value">{{ formatPrice(Number(cart?.total || 0), currencyCode) }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="cart-page__hero-panel">
                            <span class="cart-page__panel-label">Checkout notes</span>
                            <h2 class="cart-page__panel-title">Everything stays editable until the final step.</h2>
                            <p class="cart-page__panel-text">
                                Confirm quantities here, apply a promotion if you have one, and continue when your basket looks right.
                            </p>
                            <ul class="cart-page__promise-list">
                                <li class="cart-page__promise-item">
                                    <VIcon size="18" color="primary">mdi-check-circle-outline</VIcon>
                                    <span>Live totals update after cart changes are applied</span>
                                </li>
                                <li class="cart-page__promise-item">
                                    <VIcon size="18" color="primary">mdi-check-circle-outline</VIcon>
                                    <span>Promo codes can be added before checkout</span>
                                </li>
                                <li class="cart-page__promise-item">
                                    <VIcon size="18" color="primary">mdi-check-circle-outline</VIcon>
                                    <span>Shipping is confirmed in the next step</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="cart-page__content-grid">
                        <div class="cart-page__items-panel">
                            <div v-if="cart?.items?.length" class="cart-page__item-list">
                                <article v-for="item in cart?.items || []" :key="item.id" class="cart-page__item-card">
                                    <NuxtLink :to="`${PRODUCT_URL_HANDLE}/${item.product_handle}`" class="cart-page__image-link">
                                        <VImg
                                            :src="item.thumbnail || '/images/placeholder.png'"
                                            :alt="item.product_title ?? ''"
                                            width="116"
                                            height="136"
                                            class="cart-page__item-image"
                                            cover
                                        />
                                    </NuxtLink>
                                    <div class="cart-page__item-body">
                                        <div class="cart-page__item-top">
                                            <div>
                                                <NuxtLink
                                                    :to="`${PRODUCT_URL_HANDLE}/${item.product_handle}`"
                                                    class="cart-page__item-title"
                                                >
                                                    {{ item.product_title }}
                                                </NuxtLink>
                                                <p class="cart-page__item-description">{{ item.product_description }}</p>
                                                <p class="cart-page__item-meta">Option: {{ item.variant_title || "Standard option" }}</p>
                                                <p class="cart-page__item-meta">Code: {{ item.variant_sku ?? "N/A" }}</p>
                                            </div>
                                            <VBtn
                                                icon
                                                variant="text"
                                                class="cart-page__remove-btn"
                                                aria-label="Remove"
                                                @click="removeItem(item.id)"
                                            >
                                                <VIcon>mdi-delete-outline</VIcon>
                                            </VBtn>
                                        </div>
                                        <div class="cart-page__item-footer">
                                            <div class="cart-page__qty-section">
                                                <span class="cart-page__qty-label">Quantity</span>
                                                <div class="cart-page__qty-control">
                                                    <VBtn
                                                        icon
                                                        size="x-small"
                                                        variant="text"
                                                        :disabled="(qtyMap[item.id] ?? 0) <= 1"
                                                        @click="decrementQty(item.id)"
                                                    >
                                                        <VIcon size="18">mdi-minus</VIcon>
                                                    </VBtn>
                                                    <VTextField
                                                        v-model.number="qtyMap[item.id]"
                                                        type="number"
                                                        hide-details
                                                        variant="plain"
                                                        density="compact"
                                                        class="cart-page__qty-input"
                                                        @update:model-value="
                                                            (val) =>
                                                                debouncedQtyUpdate(item.id, Number(val), item.stocked_quantity ?? Infinity)
                                                        "
                                                    />
                                                    <VBtn
                                                        icon
                                                        size="x-small"
                                                        variant="text"
                                                        :disabled="(qtyMap[item.id] ?? 0) >= (item.stocked_quantity ?? Infinity)"
                                                        @click="incrementQty(item)"
                                                    >
                                                        <VIcon size="18">mdi-plus</VIcon>
                                                    </VBtn>
                                                </div>
                                            </div>
                                            <div class="cart-page__price-block">
                                                <span class="cart-page__price-label">Line total</span>
                                                <TaxedLinePrice
                                                    :amount-with-tax="getAmountWithTax(item)"
                                                    :amount-without-tax="getAmountWithoutTax(item)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </article>
                                <VBtn
                                    color="primary"
                                    rounded="pill"
                                    class="cart-page__update-btn text-none"
                                    block
                                    :loading="isUpdatingCart"
                                    :disabled="!isCartDirty || isUpdatingCart"
                                    @click="updateCart"
                                >
                                    Update cart
                                </VBtn>
                            </div>
                            <div v-else class="cart-page__empty-state">
                                <div class="cart-page__empty-icon">
                                    <VIcon size="26">mdi-cart-outline</VIcon>
                                </div>
                                <h2 class="cart-page__empty-title">Your cart is empty</h2>
                                <p class="cart-page__empty-text">
                                    Add a few products you love and come back here to review everything before checkout.
                                </p>
                                <VBtn color="primary" rounded="pill" class="text-none px-6" :to="ALL_PRODUCTS_URL_HANDLE">
                                    Browse products
                                </VBtn>
                            </div>
                        </div>
                        <aside class="cart-page__summary-column">
                            <div class="cart-page__summary-card">
                                <span class="cart-page__section-eyebrow">Order summary</span>
                                <h2 class="cart-page__section-title">A clean view of what you are about to order.</h2>
                                <p class="cart-page__section-text">
                                    Apply a promotion, review the totals, and continue once cart updates are saved.
                                </p>

                                <VForm class="cart-page__coupon-form" @submit.prevent="applyCoupon">
                                    <VTextField
                                        v-model="couponCode"
                                        name="couponTextInput"
                                        placeholder="Enter coupon code"
                                        prepend-inner-icon="mdi-ticket-percent"
                                        variant="outlined"
                                        hide-details
                                        :disabled="!hasCartItems || isCartDirty"
                                    />
                                    <VBtn
                                        :loading="isApplyingCoupon"
                                        :disabled="isCouponDisabled"
                                        color="primary"
                                        rounded="pill"
                                        class="text-none"
                                        block
                                        type="submit"
                                    >
                                        Apply code
                                    </VBtn>
                                </VForm>
                                <p class="cart-page__coupon-hint">{{ couponHint }}</p>
                                <div v-if="cart?.promotions?.length" class="cart-page__promo-list">
                                    <h3 class="cart-page__promo-heading">Applied promotions</h3>
                                    <div v-for="promo in cart?.promotions" :key="promo.id" class="cart-page__promo-item">
                                        <div>
                                            <strong class="cart-page__promo-code">{{ promo.code }}</strong>
                                            <p class="cart-page__promo-value">
                                                {{ formatPrice(Number(promo.application_method?.value) ?? 0, currencyCode) }}
                                            </p>
                                        </div>
                                        <VBtn
                                            icon
                                            size="small"
                                            variant="text"
                                            aria-label="Remove promotion"
                                            @click="removePromotion(promo.code)"
                                        >
                                            <VIcon size="18">mdi-close</VIcon>
                                        </VBtn>
                                    </div>
                                </div>
                                <VDivider class="my-5" />
                                <div class="cart-page__totals">
                                    <div class="cart-page__total-row">
                                        <span class="cart-page__total-label">Subtotal</span>
                                        <span class="cart-page__total-value">{{
                                            formatPrice(Number(cart?.subtotal || 0), currencyCode)
                                        }}</span>
                                    </div>
                                    <div class="cart-page__total-row">
                                        <span class="cart-page__total-label">Tax</span>
                                        <span class="cart-page__total-value">{{
                                            formatPrice(Number(cart?.tax_total || 0), currencyCode)
                                        }}</span>
                                    </div>
                                    <div class="cart-page__total-row">
                                        <span class="cart-page__total-label">Total</span>
                                        <strong class="cart-page__grand-total">{{
                                            formatPrice(Number(cart?.total || 0), currencyCode)
                                        }}</strong>
                                    </div>
                                </div>
                                <p class="cart-page__summary-note">Shipping is calculated during the next step.</p>
                                <VBtn
                                    color="primary"
                                    rounded="pill"
                                    class="text-none"
                                    block
                                    :disabled="isCheckoutDisabled"
                                    :to="isCheckoutDisabled ? undefined : '/checkout'"
                                >
                                    Checkout
                                </VBtn>
                            </div>
                        </aside>
                    </div>
                </template>
            </VContainer>
        </div>
    </main>
</template>

<style scoped lang="scss">
.cart-page {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.cart-page__hero {
    padding: 6.5rem 0 6rem;
}

.cart-page__container {
    position: relative;
    z-index: 1;
}

.cart-page__hero-grid,
.cart-page__content-grid {
    display: grid;
    gap: 2rem;
}

.cart-page__hero-grid {
    grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
    align-items: end;
    margin-bottom: 3rem;
}

.cart-page__hero-copy,
.cart-page__hero-panel,
.cart-page__items-panel,
.cart-page__summary-column {
    animation: cart-rise 0.8s ease both;
}

.cart-page__hero-panel,
.cart-page__summary-column {
    animation-delay: 0.12s;
}

.cart-page__eyebrow,
.cart-page__panel-label,
.cart-page__section-eyebrow {
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

.cart-page__title,
.cart-page__panel-title,
.cart-page__section-title,
.cart-page__empty-title {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.cart-page__title {
    max-width: 11ch;
    margin: 1rem 0;
    font-size: 4.5rem;
    line-height: 0.95;
}

.cart-page__description,
.cart-page__panel-text,
.cart-page__section-text,
.cart-page__item-description,
.cart-page__item-meta,
.cart-page__summary-note,
.cart-page__empty-text,
.cart-page__loading-text {
    margin: 0;
    color: #4b5874;
    font-size: 1rem;
    line-height: 1.75;
}

.cart-page__hero-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem 1.25rem;
    margin-top: 1.75rem;
}

.cart-page__stat-card,
.cart-page__hero-panel,
.cart-page__item-card,
.cart-page__summary-card,
.cart-page__empty-state {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.cart-page__stat-card {
    display: grid;
    gap: 0.2rem;
    padding: 0.9rem 1.05rem;
}

.cart-page__stat-label,
.cart-page__price-label,
.cart-page__qty-label,
.cart-page__total-label,
.cart-page__promo-value {
    color: #6a7590;
    font-size: 0.88rem;
}

.cart-page__stat-value,
.cart-page__item-title,
.cart-page__price-value,
.cart-page__grand-total,
.cart-page__promo-code {
    color: #08173f;
}

.cart-page__hero-panel,
.cart-page__summary-card,
.cart-page__empty-state {
    padding: 1.9rem;
}

.cart-page__panel-label,
.cart-page__section-eyebrow {
    margin-bottom: 1rem;
}

.cart-page__panel-title,
.cart-page__section-title,
.cart-page__empty-title {
    margin-bottom: 0.85rem;
    font-size: 2.2rem;
    line-height: 1.08;
}

.cart-page__promise-list,
.cart-page__item-list,
.cart-page__promo-list,
.cart-page__totals {
    display: grid;
    gap: 1rem;
}

.cart-page__promise-list {
    margin: 1.4rem 0 0;
    padding: 0;
    list-style: none;
}

.cart-page__promise-item {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    color: #33415f;
    line-height: 1.6;
}

.cart-page__content-grid {
    grid-template-columns: minmax(0, 1.15fr) minmax(19rem, 0.85fr);
    align-items: start;
}

.cart-page__item-card {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 1.15rem;
    padding: 1.2rem;
}

.cart-page__image-link {
    display: block;
}

.cart-page__item-image {
    border-radius: 1.1rem;
    background: #edf2ff;
}

.cart-page__item-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
}

.cart-page__item-top,
.cart-page__item-footer,
.cart-page__promo-item,
.cart-page__total-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}

.cart-page__item-top,
.cart-page__item-footer,
.cart-page__promo-item,
.cart-page__total-row {
    align-items: flex-start;
}

.cart-page__item-title {
    display: inline-block;
    margin-bottom: 0.45rem;
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1.3;
    text-decoration: none;
}

.cart-page__item-title:hover {
    text-decoration: underline;
}

.cart-page__item-description {
    margin-bottom: 0.45rem;
}

.cart-page__item-meta {
    font-size: 0.92rem;
    line-height: 1.55;
}

.cart-page__remove-btn {
    color: #08173f;
}

.cart-page__qty-section,
.cart-page__price-block {
    display: grid;
    gap: 0.45rem;
}

.cart-page__price-block {
    justify-items: end;
}

.cart-page__qty-control {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 999px;
    background: rgba(247, 250, 255, 0.95);
}

.cart-page__qty-input {
    max-width: 3.2rem;
}

.cart-page__qty-input :deep(input) {
    text-align: center;
    color: #08173f;
    font-weight: 700;
    padding: 0;
}

.cart-page__update-btn {
    margin-top: 0.25rem;
}

.cart-page__summary-column {
    position: sticky;
    top: 1.5rem;
}

.cart-page__coupon-form {
    display: grid;
    gap: 0.9rem;
    margin-top: 1.25rem;
}

.cart-page__coupon-hint {
    margin: 0.75rem 0 0;
    color: rgba(8, 23, 63, 0.72);
    font-size: 0.95rem;
    line-height: 1.5;
}

.cart-page__promo-heading {
    margin: 0;
    color: #08173f;
    font-size: 1rem;
}

.cart-page__promo-item {
    padding: 0.95rem 1rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1rem;
    background: rgba(247, 250, 255, 0.9);
    align-items: center;
}

.cart-page__promo-value {
    margin-top: 0.2rem;
}

.cart-page__total-value,
.cart-page__price-value,
.cart-page__grand-total {
    font-weight: 700;
}

.cart-page__grand-total {
    font-size: 1.1rem;
}

.cart-page__summary-note {
    margin: 0.25rem 0 0;
}

.cart-page__empty-state {
    display: grid;
    justify-items: start;
    gap: 0.85rem;
}

.cart-page__empty-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3.15rem;
    height: 3.15rem;
    border-radius: 1rem;
    background: linear-gradient(145deg, rgba(1, 12, 128, 0.1), rgba(0, 128, 255, 0.08));
    color: #010c80;
}

.cart-page__loading-state {
    display: grid;
    justify-items: center;
    gap: 0.9rem;
    padding: 4rem 0;
}

@keyframes cart-rise {
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
    .cart-page__hero {
        padding: 4.75rem 0 4rem;
    }

    .cart-page__hero-grid,
    .cart-page__content-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .cart-page__hero-grid {
        margin-bottom: 2rem;
    }

    .cart-page__title {
        max-width: 100%;
        font-size: 3.25rem;
    }

    .cart-page__hero-panel,
    .cart-page__summary-card,
    .cart-page__empty-state {
        padding: 1.5rem;
    }

    .cart-page__panel-title,
    .cart-page__section-title,
    .cart-page__empty-title {
        font-size: 1.8rem;
    }

    .cart-page__summary-column {
        position: static;
    }
}

@media screen and (max-width: 700px) {
    .cart-page__hero {
        padding: 3.75rem 0 3.5rem;
    }

    .cart-page__title {
        font-size: 2.4rem;
        line-height: 1;
    }

    .cart-page__hero-panel,
    .cart-page__summary-card,
    .cart-page__item-card,
    .cart-page__empty-state {
        border-radius: 1.2rem;
    }

    .cart-page__hero-panel,
    .cart-page__summary-card,
    .cart-page__empty-state {
        padding: 1.4rem;
    }

    .cart-page__panel-title,
    .cart-page__section-title,
    .cart-page__empty-title {
        font-size: 1.6rem;
    }

    .cart-page__item-card {
        grid-template-columns: 1fr;
    }

    .cart-page__item-image {
        width: 100% !important;
        height: 14rem !important;
    }

    .cart-page__item-top,
    .cart-page__item-footer,
    .cart-page__promo-item,
    .cart-page__total-row {
        flex-direction: column;
    }

    .cart-page__price-block {
        justify-items: start;
    }
}

@media (prefers-reduced-motion: reduce) {
    .cart-page__hero-copy,
    .cart-page__hero-panel,
    .cart-page__items-panel,
    .cart-page__summary-column {
        animation: none;
    }
}
</style>
