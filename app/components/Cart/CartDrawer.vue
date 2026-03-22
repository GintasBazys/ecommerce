<script setup lang="ts">
import type { CartLineItemDTO } from "@medusajs/types"

import { DEFAULT_CURENCY } from "~/utils/consts"
import { formatPrice } from "~/utils/formatPrice"

const { cart, openCartDrawer } = storeToRefs(useCartStore())
const { removeLineItem, updateLineItem } = useCartStore()

const qtyMap = reactive<Record<string, number | undefined>>({})
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

const isCartDirty = computed<boolean>(() =>
    Object.entries(qtyMap).some(([id, qty]) => (qty ?? originalQtys.value[id]) !== originalQtys.value[id])
)

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
    const q = qtyMap[itemId] ?? 1
    if (q > 1) {
        qtyMap[itemId] = q - 1
    }
}

function incrementQty(item: CartLineItemDTO): void {
    const q = qtyMap[item.id] ?? Number(item.quantity)
    const max = item.stocked_quantity ?? Infinity
    if (q < max) {
        qtyMap[item.id] = q + 1
    }
}

async function updateCount(item: CartLineItemDTO): Promise<void> {
    const desiredQty = qtyMap[item.id] ?? Number(item.quantity)
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

const router = useRouter()

router.afterEach(() => {
    openCartDrawer.value = false
})
</script>

<template>
    <VNavigationDrawer v-model="openCartDrawer" location="right" touchless temporary width="420" class="cartDrawer">
        <div class="cartDrawer__shell">
            <div class="cartDrawer__backdrop"></div>

            <VContainer class="cartDrawer__container">
                <header class="cartDrawer__hero">
                    <div>
                        <span class="cartDrawer__eyebrow">Cart overview</span>
                        <h2 class="cartDrawer__title">Your order is nearly ready.</h2>
                        <p class="cartDrawer__description">
                            Review quantities, make quick changes, and continue to checkout when everything looks right.
                        </p>
                    </div>

                    <VBtn icon variant="text" class="cartDrawer__closeBtn" @click="openCartDrawer = false">
                        <VIcon>mdi-close</VIcon>
                    </VBtn>
                </header>

                <div class="cartDrawer__content">
                    <div v-if="cart?.items?.length" class="cartDrawer__items">
                        <article v-for="item in cart?.items || []" :key="item.id" class="cartDrawer__itemCard">
                            <VImg :src="item.thumbnail" alt="product image" width="96" height="112" class="cartDrawer__image" cover />

                            <div class="cartDrawer__itemBody">
                                <div>
                                    <p class="cartDrawer__itemTitle">{{ item.product_title }}</p>
                                    <p class="cartDrawer__itemVariant">{{ item.variant_title || "Standard option" }}</p>
                                </div>

                                <div class="cartDrawer__itemFooter">
                                    <div class="cartDrawer__qtyControl">
                                        <VBtn
                                            icon
                                            size="x-small"
                                            variant="text"
                                            :disabled="(qtyMap[item.id] ?? 1) <= 1"
                                            @click="decrementQty(item.id)"
                                        >
                                            <VIcon size="18">mdi-minus</VIcon>
                                        </VBtn>

                                        <span class="cartDrawer__qtyValue">{{ qtyMap[item.id] ?? Number(item.quantity) }}</span>

                                        <VBtn
                                            icon
                                            size="x-small"
                                            variant="text"
                                            :disabled="(qtyMap[item.id] ?? Number(item.quantity)) >= (item.stocked_quantity ?? Infinity)"
                                            @click="incrementQty(item)"
                                        >
                                            <VIcon size="18">mdi-plus</VIcon>
                                        </VBtn>
                                    </div>

                                    <div class="cartDrawer__itemActions">
                                        <span class="cartDrawer__itemPrice">
                                            {{
                                                formatPrice(
                                                    (qtyMap[item.id] ?? Number(item.quantity)) * Number(item.unit_price),
                                                    cart?.currency_code ?? DEFAULT_CURENCY
                                                )
                                            }}
                                        </span>

                                        <VBtn icon variant="text" class="cartDrawer__removeBtn" @click="removeItem(item.id)">
                                            <VIcon size="18">mdi-trash-can-outline</VIcon>
                                        </VBtn>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </div>

                    <div v-else class="cartDrawer__emptyState">
                        <div class="cartDrawer__emptyIcon">
                            <VIcon size="26">mdi-cart-outline</VIcon>
                        </div>
                        <h3 class="cartDrawer__emptyTitle">Your cart is empty</h3>
                        <p class="cartDrawer__emptyText">Add a few pieces you love and they will appear here for a quick final review.</p>
                        <VBtn color="primary" rounded="pill" class="text-none px-6" to="/">Keep shopping</VBtn>
                    </div>
                </div>

                <footer class="cartDrawer__summary">
                    <div class="cartDrawer__summaryRow">
                        <span class="cartDrawer__summaryLabel">Subtotal</span>
                        <strong class="cartDrawer__summaryValue">{{ displayTotal }}</strong>
                    </div>

                    <p class="cartDrawer__summaryNote">Taxes and shipping are calculated during checkout.</p>

                    <VBtn
                        v-if="isCartDirty"
                        color="primary"
                        block
                        rounded="pill"
                        class="text-none"
                        :loading="isAnyUpdating"
                        :disabled="!isCartDirty || isAnyUpdating"
                        @click="updateCart"
                    >
                        Update cart
                    </VBtn>

                    <NuxtLink :class="{ 'pointer-events-none opacity-50': isCartDirty || isAnyUpdating }" to="/cart">
                        <VBtn color="primary" variant="outlined" rounded="pill" class="cartDrawer__viewCartBtn text-none" block>
                            Go to cart
                        </VBtn>
                    </NuxtLink>
                </footer>
            </VContainer>
        </div>
    </VNavigationDrawer>
</template>

<style scoped lang="scss">
.cartDrawer {
    :deep(.v-navigation-drawer__content) {
        background:
            radial-gradient(circle at top left, rgba(1, 12, 128, 0.1), transparent 26%),
            linear-gradient(180deg, #f6f9ff 0%, #ffffff 45%, #f7faff 100%);
    }
}

.cartDrawer__shell {
    position: relative;
    min-height: 100%;
}

.cartDrawer__backdrop {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(circle at top right, rgba(0, 128, 255, 0.12), transparent 22%),
        radial-gradient(circle at bottom left, rgba(1, 12, 128, 0.08), transparent 28%);
    pointer-events: none;
}

.cartDrawer__container {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding: 3rem 1rem 0;
}

.cartDrawer__hero,
.cartDrawer__summary,
.cartDrawer__itemCard,
.cartDrawer__emptyState {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.5rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.cartDrawer__hero {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.35rem;
}

.cartDrawer__eyebrow {
    display: inline-flex;
    align-items: center;
    min-height: 2.1rem;
    padding: 0.45rem 0.85rem;
    border-radius: 999px;
    background: rgba(1, 12, 128, 0.07);
    color: #010c80;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.cartDrawer__title {
    margin: 0.95rem 0 0.65rem;
    color: #08173f;
    font-size: clamp(1.8rem, 4vw, 2.4rem);
    line-height: 0.98;
    letter-spacing: -0.05rem;
    text-wrap: balance;
}

.cartDrawer__description,
.cartDrawer__itemVariant,
.cartDrawer__summaryNote,
.cartDrawer__emptyText {
    margin: 0;
    color: #4b5874;
    line-height: 1.65;
}

.cartDrawer__closeBtn,
.cartDrawer__removeBtn {
    color: #08173f;
}

.cartDrawer__content {
    flex: 1;
    min-height: 0;
    padding: 1rem 0;
    overflow-y: auto;
}

.cartDrawer__items {
    display: grid;
    gap: 1rem;
}

.cartDrawer__itemCard {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 1rem;
    padding: 1rem;
}

.cartDrawer__image {
    border-radius: 1rem;
    background: #edf2ff;
}

.cartDrawer__itemBody {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1rem;
    min-width: 0;
}

.cartDrawer__itemTitle,
.cartDrawer__emptyTitle {
    margin: 0;
    color: #08173f;
    font-weight: 700;
    line-height: 1.3;
}

.cartDrawer__itemTitle {
    font-size: 1rem;
}

.cartDrawer__itemVariant {
    margin-top: 0.35rem;
    font-size: 0.92rem;
}

.cartDrawer__itemFooter,
.cartDrawer__itemActions,
.cartDrawer__summaryRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
}

.cartDrawer__qtyControl {
    display: inline-flex;
    align-items: center;
    gap: 0.15rem;
    padding: 0.2rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 999px;
    background: rgba(247, 250, 255, 0.95);
}

.cartDrawer__qtyValue {
    min-width: 1.9rem;
    color: #08173f;
    font-size: 0.95rem;
    font-weight: 700;
    text-align: center;
}

.cartDrawer__itemPrice,
.cartDrawer__summaryValue {
    color: #08173f;
    font-weight: 700;
}

.cartDrawer__summary {
    display: grid;
    gap: 0.95rem;
    padding: 1.25rem;
    position: sticky;
    bottom: 0;
    margin-top: auto;
}

.cartDrawer__summaryLabel {
    color: #6a7590;
    font-size: 0.92rem;
}

.cartDrawer__summaryValue {
    font-size: 1.1rem;
}

.cartDrawer__viewCartBtn {
    margin-top: 0.1rem;
}

.cartDrawer__emptyState {
    display: grid;
    justify-items: start;
    gap: 0.85rem;
    padding: 1.4rem;
}

.cartDrawer__emptyIcon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3.15rem;
    height: 3.15rem;
    border-radius: 1rem;
    background: linear-gradient(145deg, rgba(1, 12, 128, 0.1), rgba(0, 128, 255, 0.08));
    color: #010c80;
}

.cartDrawer__emptyTitle {
    font-size: 1.2rem;
}

@media screen and (max-width: 600px) {
    .cartDrawer__container {
        min-height: 100%;
        padding: 1.35rem 1rem 1rem;
    }

    .cartDrawer__hero,
    .cartDrawer__summary,
    .cartDrawer__itemCard,
    .cartDrawer__emptyState {
        border-radius: 1.2rem;
    }

    .cartDrawer__itemCard {
        grid-template-columns: 1fr;
    }

    .cartDrawer__image {
        width: 100% !important;
        height: 12rem !important;
    }

    .cartDrawer__itemFooter {
        align-items: stretch;
        flex-direction: column;
    }

    .cartDrawer__itemActions,
    .cartDrawer__summaryRow {
        width: 100%;
    }
}
</style>
