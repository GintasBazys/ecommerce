<script setup lang="ts">
import debounce from "lodash/debounce"

import TaxedLinePrice from "../../components/Cart/TaxedLinePrice.vue"

import type { CartLineItemDTO } from "@medusajs/types"

import { DEFAULT_CURENCY, PRODUCT_URL_HANDLE } from "~/utils/consts"
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
    <section class="cartPage">
        <div class="cartPage__hero">
            <VContainer class="cartPage__container">
                <div v-if="isCartLoading" class="cartPage__loadingState">
                    <VProgressCircular indeterminate color="primary" size="40" />
                    <p class="cartPage__loadingText">Loading your cart...</p>
                </div>
                <template v-else>
                    <div class="cartPage__heroGrid">
                        <div class="cartPage__heroCopy">
                            <span class="cartPage__eyebrow">Shopping cart</span>
                            <h1 class="cartPage__title">Review your picks before you head to checkout.</h1>
                            <p class="cartPage__description">
                                Fine-tune quantities, remove anything that no longer fits, and keep your order feeling as considered as the
                                rest of the shop.
                            </p>
                            <div class="cartPage__heroActions">
                                <VBtn color="primary" rounded="pill" size="large" class="text-none px-7" to="/"> Continue shopping </VBtn>
                                <div class="cartPage__statCard">
                                    <span class="cartPage__statLabel">Current total</span>
                                    <strong class="cartPage__statValue">{{ formatPrice(Number(cart?.total || 0), currencyCode) }}</strong>
                                </div>
                            </div>
                        </div>
                        <div class="cartPage__heroPanel">
                            <span class="cartPage__panelLabel">Checkout notes</span>
                            <h2 class="cartPage__panelTitle">Everything stays editable until the final step.</h2>
                            <p class="cartPage__panelText">
                                Confirm quantities here, apply a promotion if you have one, and continue when your basket looks right.
                            </p>
                            <ul class="cartPage__promiseList">
                                <li class="cartPage__promiseItem">
                                    <VIcon size="18" color="primary">mdi-check-circle-outline</VIcon>
                                    <span>Live totals update after cart changes are applied</span>
                                </li>
                                <li class="cartPage__promiseItem">
                                    <VIcon size="18" color="primary">mdi-check-circle-outline</VIcon>
                                    <span>Promo codes can be added before checkout</span>
                                </li>
                                <li class="cartPage__promiseItem">
                                    <VIcon size="18" color="primary">mdi-check-circle-outline</VIcon>
                                    <span>Shipping is confirmed in the next step</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="cartPage__contentGrid">
                        <div class="cartPage__itemsPanel">
                            <div v-if="cart?.items?.length" class="cartPage__itemList">
                                <article v-for="item in cart?.items || []" :key="item.id" class="cartPage__itemCard">
                                    <NuxtLink :to="`${PRODUCT_URL_HANDLE}/${item.product_handle}`" class="cartPage__imageLink">
                                        <VImg
                                            :src="item.thumbnail || '/images/placeholder.png'"
                                            :alt="item.product_title ?? ''"
                                            width="116"
                                            height="136"
                                            class="cartPage__itemImage"
                                            cover
                                        />
                                    </NuxtLink>
                                    <div class="cartPage__itemBody">
                                        <div class="cartPage__itemTop">
                                            <div>
                                                <NuxtLink :to="`${PRODUCT_URL_HANDLE}/${item.product_handle}`" class="cartPage__itemTitle">
                                                    {{ item.product_title }}
                                                </NuxtLink>
                                                <p class="cartPage__itemDescription">{{ item.product_description }}</p>
                                                <p class="cartPage__itemMeta">Option: {{ item.variant_title || "Standard option" }}</p>
                                                <p class="cartPage__itemMeta">Code: {{ item.variant_sku ?? "N/A" }}</p>
                                            </div>
                                            <VBtn
                                                icon
                                                variant="text"
                                                class="cartPage__removeBtn"
                                                aria-label="Remove"
                                                @click="removeItem(item.id)"
                                            >
                                                <VIcon>mdi-delete-outline</VIcon>
                                            </VBtn>
                                        </div>
                                        <div class="cartPage__itemFooter">
                                            <div class="cartPage__qtySection">
                                                <span class="cartPage__qtyLabel">Quantity</span>
                                                <div class="cartPage__qtyControl">
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
                                                        class="cartPage__qtyInput"
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
                                            <div class="cartPage__priceBlock">
                                                <span class="cartPage__priceLabel">Line total</span>
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
                                    class="cartPage__updateBtn text-none"
                                    block
                                    :loading="isUpdatingCart"
                                    :disabled="!isCartDirty || isUpdatingCart"
                                    @click="updateCart"
                                >
                                    Update cart
                                </VBtn>
                            </div>
                            <div v-else class="cartPage__emptyState">
                                <div class="cartPage__emptyIcon">
                                    <VIcon size="26">mdi-cart-outline</VIcon>
                                </div>
                                <h2 class="cartPage__emptyTitle">Your cart is empty</h2>
                                <p class="cartPage__emptyText">
                                    Add a few products you love and come back here to review everything before checkout.
                                </p>
                                <VBtn color="primary" rounded="pill" class="text-none px-6" to="/">Browse products</VBtn>
                            </div>
                        </div>
                        <aside class="cartPage__summaryColumn">
                            <div class="cartPage__summaryCard">
                                <span class="cartPage__sectionEyebrow">Order summary</span>
                                <h2 class="cartPage__sectionTitle">A clean view of what you are about to order.</h2>
                                <p class="cartPage__sectionText">
                                    Apply a promotion, review the totals, and continue once cart updates are saved.
                                </p>

                                <VForm class="cartPage__couponForm" @submit.prevent="applyCoupon">
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
                                <p class="cartPage__couponHint">{{ couponHint }}</p>
                                <div v-if="cart?.promotions?.length" class="cartPage__promoList">
                                    <h3 class="cartPage__promoHeading">Applied promotions</h3>
                                    <div v-for="promo in cart?.promotions" :key="promo.id" class="cartPage__promoItem">
                                        <div>
                                            <strong class="cartPage__promoCode">{{ promo.code }}</strong>
                                            <p class="cartPage__promoValue">
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
                                <div class="cartPage__totals">
                                    <div class="cartPage__totalRow">
                                        <span class="cartPage__totalLabel">Subtotal</span>
                                        <span class="cartPage__totalValue">{{
                                            formatPrice(Number(cart?.subtotal || 0), currencyCode)
                                        }}</span>
                                    </div>
                                    <div class="cartPage__totalRow">
                                        <span class="cartPage__totalLabel">Tax</span>
                                        <span class="cartPage__totalValue">{{
                                            formatPrice(Number(cart?.tax_total || 0), currencyCode)
                                        }}</span>
                                    </div>
                                    <div class="cartPage__totalRow">
                                        <span class="cartPage__totalLabel">Total</span>
                                        <strong class="cartPage__grandTotal">{{
                                            formatPrice(Number(cart?.total || 0), currencyCode)
                                        }}</strong>
                                    </div>
                                </div>
                                <p class="cartPage__summaryNote">Shipping is calculated during the next step.</p>
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
    </section>
</template>

<style scoped lang="scss">
.cartPage {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.cartPage__hero {
    padding: clamp(4.75rem, 7vw, 6.5rem) 0 clamp(4rem, 7vw, 6rem);
}

.cartPage__container {
    position: relative;
    z-index: 1;
}

.cartPage__heroGrid,
.cartPage__contentGrid {
    display: grid;
    gap: clamp(1.5rem, 3vw, 2rem);
}

.cartPage__heroGrid {
    grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
    align-items: end;
    margin-bottom: clamp(2rem, 4vw, 3rem);
}

.cartPage__heroCopy,
.cartPage__heroPanel,
.cartPage__itemsPanel,
.cartPage__summaryColumn {
    animation: cart-rise 0.8s ease both;
}

.cartPage__heroPanel,
.cartPage__summaryColumn {
    animation-delay: 0.12s;
}

.cartPage__eyebrow,
.cartPage__panelLabel,
.cartPage__sectionEyebrow {
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

.cartPage__title,
.cartPage__panelTitle,
.cartPage__sectionTitle,
.cartPage__emptyTitle {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.cartPage__title {
    max-width: 11ch;
    margin: 1rem 0;
    font-size: clamp(2.4rem, 4.4vw, 4.5rem);
    line-height: 0.95;
}

.cartPage__description,
.cartPage__panelText,
.cartPage__sectionText,
.cartPage__itemDescription,
.cartPage__itemMeta,
.cartPage__summaryNote,
.cartPage__emptyText,
.cartPage__loadingText {
    margin: 0;
    color: #4b5874;
    font-size: 1rem;
    line-height: 1.75;
}

.cartPage__heroActions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem 1.25rem;
    margin-top: 1.75rem;
}

.cartPage__statCard,
.cartPage__heroPanel,
.cartPage__itemCard,
.cartPage__summaryCard,
.cartPage__emptyState {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.cartPage__statCard {
    display: grid;
    gap: 0.2rem;
    padding: 0.9rem 1.05rem;
}

.cartPage__statLabel,
.cartPage__priceLabel,
.cartPage__qtyLabel,
.cartPage__totalLabel,
.cartPage__promoValue {
    color: #6a7590;
    font-size: 0.88rem;
}

.cartPage__statValue,
.cartPage__itemTitle,
.cartPage__priceValue,
.cartPage__grandTotal,
.cartPage__promoCode {
    color: #08173f;
}

.cartPage__heroPanel,
.cartPage__summaryCard,
.cartPage__emptyState {
    padding: clamp(1.4rem, 2vw, 1.9rem);
}

.cartPage__panelLabel,
.cartPage__sectionEyebrow {
    margin-bottom: 1rem;
}

.cartPage__panelTitle,
.cartPage__sectionTitle,
.cartPage__emptyTitle {
    margin-bottom: 0.85rem;
    font-size: clamp(1.6rem, 2.4vw, 2.2rem);
    line-height: 1.08;
}

.cartPage__promiseList,
.cartPage__itemList,
.cartPage__promoList,
.cartPage__totals {
    display: grid;
    gap: 1rem;
}

.cartPage__promiseList {
    margin: 1.4rem 0 0;
    padding: 0;
    list-style: none;
}

.cartPage__promiseItem {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    color: #33415f;
    line-height: 1.6;
}

.cartPage__contentGrid {
    grid-template-columns: minmax(0, 1.15fr) minmax(19rem, 0.85fr);
    align-items: start;
}

.cartPage__itemCard {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 1.15rem;
    padding: 1.2rem;
}

.cartPage__imageLink {
    display: block;
}

.cartPage__itemImage {
    border-radius: 1.1rem;
    background: #edf2ff;
}

.cartPage__itemBody {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
}

.cartPage__itemTop,
.cartPage__itemFooter,
.cartPage__promoItem,
.cartPage__totalRow {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}

.cartPage__itemTop,
.cartPage__itemFooter,
.cartPage__promoItem,
.cartPage__totalRow {
    align-items: flex-start;
}

.cartPage__itemTitle {
    display: inline-block;
    margin-bottom: 0.45rem;
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1.3;
    text-decoration: none;
}

.cartPage__itemTitle:hover {
    text-decoration: underline;
}

.cartPage__itemDescription {
    margin-bottom: 0.45rem;
}

.cartPage__itemMeta {
    font-size: 0.92rem;
    line-height: 1.55;
}

.cartPage__removeBtn {
    color: #08173f;
}

.cartPage__qtySection,
.cartPage__priceBlock {
    display: grid;
    gap: 0.45rem;
}

.cartPage__priceBlock {
    justify-items: end;
}

.cartPage__qtyControl {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 999px;
    background: rgba(247, 250, 255, 0.95);
}

.cartPage__qtyInput {
    max-width: 3.2rem;
}

.cartPage__qtyInput :deep(input) {
    text-align: center;
    color: #08173f;
    font-weight: 700;
    padding: 0;
}

.cartPage__updateBtn {
    margin-top: 0.25rem;
}

.cartPage__summaryColumn {
    position: sticky;
    top: 1.5rem;
}

.cartPage__couponForm {
    display: grid;
    gap: 0.9rem;
    margin-top: 1.25rem;
}

.cartPage__couponHint {
    margin: 0.75rem 0 0;
    color: rgba(8, 23, 63, 0.72);
    font-size: 0.95rem;
    line-height: 1.5;
}

.cartPage__promoHeading {
    margin: 0;
    color: #08173f;
    font-size: 1rem;
}

.cartPage__promoItem {
    padding: 0.95rem 1rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1rem;
    background: rgba(247, 250, 255, 0.9);
    align-items: center;
}

.cartPage__promoValue {
    margin-top: 0.2rem;
}

.cartPage__totalValue,
.cartPage__priceValue,
.cartPage__grandTotal {
    font-weight: 700;
}

.cartPage__grandTotal {
    font-size: 1.1rem;
}

.cartPage__summaryNote {
    margin: 0.25rem 0 0;
}

.cartPage__emptyState {
    display: grid;
    justify-items: start;
    gap: 0.85rem;
}

.cartPage__emptyIcon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3.15rem;
    height: 3.15rem;
    border-radius: 1rem;
    background: linear-gradient(145deg, rgba(1, 12, 128, 0.1), rgba(0, 128, 255, 0.08));
    color: #010c80;
}

.cartPage__loadingState {
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
    .cartPage__heroGrid,
    .cartPage__contentGrid {
        grid-template-columns: 1fr;
    }

    .cartPage__title {
        max-width: 100%;
    }

    .cartPage__summaryColumn {
        position: static;
    }
}

@media screen and (max-width: 700px) {
    .cartPage__hero {
        padding: 3.75rem 0 3.5rem;
    }

    .cartPage__title {
        font-size: clamp(2rem, 9vw, 2.8rem);
        line-height: 1;
    }

    .cartPage__heroPanel,
    .cartPage__summaryCard,
    .cartPage__itemCard,
    .cartPage__emptyState {
        border-radius: 1.2rem;
    }

    .cartPage__itemCard {
        grid-template-columns: 1fr;
    }

    .cartPage__itemImage {
        width: 100% !important;
        height: 14rem !important;
    }

    .cartPage__itemTop,
    .cartPage__itemFooter,
    .cartPage__promoItem,
    .cartPage__totalRow {
        flex-direction: column;
    }

    .cartPage__priceBlock {
        justify-items: start;
    }
}

@media (prefers-reduced-motion: reduce) {
    .cartPage__heroCopy,
    .cartPage__heroPanel,
    .cartPage__itemsPanel,
    .cartPage__summaryColumn {
        animation: none;
    }
}
</style>
