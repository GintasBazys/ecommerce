<script setup lang="ts">
import type { CartLineItemDTO } from "@medusajs/types"

import NuxtImage from "~/components/Shared/NuxtImage.vue"
import { usePostHog } from "~/composables/usePostHog"
import { ALL_PRODUCTS_URL_HANDLE, DEFAULT_CURENCY } from "~/utils/consts"
import { formatPrice } from "~/utils/formatPrice"

const cartStore = useCartStore()
const { cart, openCartDrawer, recoveryMessage } = storeToRefs(cartStore)
const { removeLineItem, updateLineItem, clearRecoveryMessage } = cartStore
const posthog = usePostHog()

const isHydrated = ref(false)
const drawerRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)
const titleId = useId()
const previousFocusedElement = ref<HTMLElement | null>(null)

const qtyMap = reactive<Record<string, number | undefined>>({})
const updating = reactive<Record<string, boolean>>({})

const router = useRouter()
const unregisterAfterEach = router.afterEach(() => {
    openCartDrawer.value = false
})

onMounted(() => {
    isHydrated.value = true

    if (openCartDrawer.value) {
        previousFocusedElement.value = document.activeElement as HTMLElement
        document.body.style.overflow = "hidden"
        document.body.style.touchAction = "none"
    }
})

onBeforeUnmount(() => {
    unregisterAfterEach()
    document.body.style.overflow = ""
    document.body.style.touchAction = ""
})

watch(openCartDrawer, async (opened) => {
    if (!import.meta.client) {
        return
    }

    if (opened) {
        previousFocusedElement.value = document.activeElement as HTMLElement
        document.body.style.overflow = "hidden"
        document.body.style.touchAction = "none"
        await nextTick()
        closeButtonRef.value?.focus()
        return
    }

    document.body.style.overflow = ""
    document.body.style.touchAction = ""
    previousFocusedElement.value?.focus()
})

watch(
    cart,
    (newCart) => {
        const newIds = newCart?.items?.map((item) => item.id) || []

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

const isAnyUpdating = computed<boolean>(() => Object.values(updating).some(Boolean))

type PricedCartLineItem = CartLineItemDTO & {
    total?: number | null
    unit_price?: number | null
}

function getItemDisplayTotalAmount(item: CartLineItemDTO): number {
    const pricedItem = item as PricedCartLineItem
    const savedQuantity = Math.max(Number(item.quantity) || 1, 1)
    const desiredQuantity = Math.max(Number(qtyMap[item.id] ?? item.quantity) || 1, 1)
    const unitAmountWithTax = pricedItem.total != null ? Number(pricedItem.total) / savedQuantity : Number(pricedItem.unit_price ?? 0)

    return unitAmountWithTax * desiredQuantity
}

const hasCartItems = computed<boolean>(() => Boolean(cart.value?.items?.length))
const displaySubtotalAmount = computed<number>(() => (hasCartItems.value ? Number(cart.value?.subtotal || 0) : 0))
const displayTaxAmount = computed<number>(() => (hasCartItems.value ? Number(cart.value?.tax_total || 0) : 0))
const displaySubtotal = computed<string>(() => formatPrice(displaySubtotalAmount.value, cart.value?.currency_code ?? DEFAULT_CURENCY))
const displayTaxTotal = computed<string>(() => formatPrice(displayTaxAmount.value, cart.value?.currency_code ?? DEFAULT_CURENCY))

function getItemDisplayTotal(item: CartLineItemDTO): string {
    return formatPrice(getItemDisplayTotalAmount(item), cart.value?.currency_code ?? DEFAULT_CURENCY)
}

async function removeItem(lineItemId: string): Promise<void> {
    if (!cart.value?.id) {
        throw new Error("No active cart found")
    }

    const item = cart.value?.items?.find((i) => i.id === lineItemId)

    try {
        await removeLineItem(lineItemId)
        posthog?.capture("cart_item_removed", {
            product_id: item?.product_id,
            product_name: item?.product_title,
            variant_id: item?.variant_id,
            variant_name: item?.variant_title,
            quantity: item?.quantity
        })
    } catch (error) {
        console.error("Failed to remove item:", error)
    }
}

function decrementQty(itemId: string): void {
    const quantity = qtyMap[itemId] ?? 1

    if (quantity > 1) {
        qtyMap[itemId] = quantity - 1
    }
}

function incrementQty(item: CartLineItemDTO): void {
    const quantity = qtyMap[item.id] ?? Number(item.quantity)
    const max = item.stocked_quantity ?? Infinity

    if (quantity < max) {
        qtyMap[item.id] = quantity + 1
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
    } catch (error) {
        console.error("Failed to update count:", error)
    } finally {
        updating[item.id] = false
    }
}

function updateCart(): void {
    cart.value?.items?.forEach((item) => {
        void updateCount(item)
    })
}

function closeDrawer(): void {
    openCartDrawer.value = false
}

function onDrawerKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
        closeDrawer()
        return
    }

    if (event.key !== "Tab") {
        return
    }

    const container = drawerRef.value
    if (!container) {
        return
    }

    const focusableElements = container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    if (!focusableElements.length) {
        return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (!firstElement || !lastElement) {
        return
    }
    const activeElement = document.activeElement

    if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
    } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
    }
}
</script>

<template>
    <Teleport to="body">
        <div v-if="isHydrated">
            <transition name="fade">
                <div v-if="openCartDrawer" class="fixed inset-0 z-80 bg-slate-950/55 backdrop-blur-sm" @click="closeDrawer"></div>
            </transition>

            <aside
                ref="drawerRef"
                class="fixed top-0 right-0 bottom-0 z-85 w-full max-w-110 overflow-hidden border-l border-white/60 bg-gradient-to-b from-slate-50 to-slate-100 shadow-2xl transition-transform duration-300 ease-out"
                :class="openCartDrawer ? 'translate-x-0' : 'translate-x-full'"
                :aria-labelledby="titleId"
                role="search"
                @keydown="onDrawerKeydown"
            >
                <div class="flex h-full min-h-0 flex-col">
                    <div class="shrink-0 border-b border-slate-200/80 px-4 py-4 sm:px-5 sm:py-5">
                        <div class="mb-4 h-px w-full bg-gradient-to-r from-slate-400/0 via-amber-500/45 to-slate-400/0"></div>
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <p
                                    class="text-label-xs tracking-label inline-flex rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 font-semibold text-amber-900 uppercase"
                                >
                                    Cart overview
                                </p>
                                <h2
                                    :id="titleId"
                                    class="mt-3 max-w-xs text-xl leading-tight font-semibold tracking-tight text-slate-950 sm:text-3xl"
                                >
                                    Your order is nearly ready.
                                </h2>
                                <p class="mt-2 max-w-md text-sm leading-6 text-slate-700">
                                    Review quantities, make quick changes, and continue to checkout when everything looks right.
                                </p>
                            </div>

                            <button
                                ref="closeButtonRef"
                                type="button"
                                class="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-xl transition hover:border-amber-200 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
                                @click="closeDrawer"
                            >
                                <span class="sr-only">Close cart drawer</span>
                                <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                                    <path
                                        d="M5.22 5.22a.75.75 0 0 1 1.06 0L10 8.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L11.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 0-1.06Z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
                        <div
                            v-if="recoveryMessage"
                            class="rounded-card-sm mb-3 flex items-start justify-between gap-3 border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950"
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

                        <div v-if="cart?.items?.length" class="grid gap-3.5">
                            <article
                                v-for="item in cart.items"
                                :key="item.id"
                                class="rounded-card shadow-panel flex gap-3 border border-white/80 bg-gradient-to-b from-white to-slate-50 p-3"
                            >
                                <NuxtImage
                                    :src="item.thumbnail || '/images/about/about-premium.jpg'"
                                    :alt="item.product_title || 'Product image'"
                                    width="96"
                                    height="112"
                                    loading="lazy"
                                    class="h-24 w-21 rounded-2xl bg-slate-100 object-cover sm:h-28 sm:w-24"
                                />

                                <div class="flex min-w-0 flex-col justify-between gap-3">
                                    <div>
                                        <p class="text-sm font-semibold text-slate-950">{{ item.product_title }}</p>
                                        <p class="mt-1 text-xs tracking-wide text-slate-500">
                                            {{ item.variant_title || "Standard option" }}
                                        </p>
                                    </div>

                                    <div class="flex items-end justify-between gap-3">
                                        <div
                                            class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50/90 p-1 shadow-inner"
                                        >
                                            <button
                                                type="button"
                                                class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border-0 bg-transparent text-slate-700 transition hover:bg-white hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                                                :disabled="(qtyMap[item.id] ?? 1) <= 1"
                                                :aria-label="`Decrease quantity for ${item.product_title}`"
                                                @click="decrementQty(item.id)"
                                            >
                                                -
                                            </button>
                                            <span class="min-w-7 text-center text-sm font-semibold text-slate-900">{{
                                                qtyMap[item.id] ?? Number(item.quantity)
                                            }}</span>
                                            <button
                                                type="button"
                                                class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border-0 bg-transparent text-slate-700 transition hover:bg-white hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                                                :disabled="
                                                    (qtyMap[item.id] ?? Number(item.quantity)) >= (item.stocked_quantity ?? Infinity)
                                                "
                                                :aria-label="`Increase quantity for ${item.product_title}`"
                                                @click="incrementQty(item)"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div class="flex items-center gap-2">
                                            <p class="text-sm font-semibold text-slate-950">
                                                {{ getItemDisplayTotal(item) }}
                                            </p>
                                            <button
                                                type="button"
                                                class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 transition hover:border-rose-200 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:outline-hidden"
                                                :aria-label="`Remove ${item.product_title}`"
                                                @click="removeItem(item.id)"
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    class="h-4 w-4"
                                                    stroke="currentColor"
                                                    stroke-width="1.8"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        d="M4 7h16M9 7V5h6v2m-7 3v7m4-7v7m4-7v7M6 7l1 12h10l1-12"
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </div>

                        <section
                            v-else
                            class="shadow-panel rounded-3xl border border-white/80 bg-gradient-to-b from-white to-slate-50 p-6 text-center"
                        >
                            <div
                                class="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-900"
                            >
                                🛒
                            </div>
                            <h3 class="mt-3 text-lg font-semibold text-slate-950">Your cart is empty</h3>
                            <p class="mt-2 text-sm leading-6 text-slate-700">
                                Add a few pieces you love and they will appear here for a quick final review.
                            </p>
                            <NuxtLink :to="ALL_PRODUCTS_URL_HANDLE" class="ui-btn-accent mt-5"> Keep shopping </NuxtLink>
                        </section>
                    </div>

                    <footer class="shrink-0 border-t border-slate-200/80 bg-white/85 p-4 pb-6 backdrop-blur sm:px-5">
                        <div class="shadow-panel space-y-2 rounded-3xl border border-white/80 bg-gradient-to-b from-white to-slate-50 p-4">
                            <div class="flex items-center justify-between gap-2">
                                <span class="text-sm text-slate-600">Subtotal</span>
                                <strong class="text-sm text-slate-950">{{ displaySubtotal }}</strong>
                            </div>
                            <div class="flex items-center justify-between gap-2">
                                <span class="text-sm text-slate-600">Tax</span>
                                <strong class="text-sm text-slate-950">{{ displayTaxTotal }}</strong>
                            </div>
                            <div class="pt-1">
                                <div class="mb-3 h-px w-full bg-gradient-to-r from-slate-400/0 via-amber-500/35 to-slate-400/0"></div>
                                <p class="text-xs tracking-wide text-slate-500">Shipping is calculated during checkout.</p>
                            </div>
                        </div>

                        <div class="mt-4 grid gap-2">
                            <button
                                v-if="isCartDirty"
                                type="button"
                                class="ui-btn-accent w-full"
                                :disabled="!isCartDirty || isAnyUpdating"
                                @click="updateCart"
                            >
                                <span
                                    v-if="isAnyUpdating"
                                    class="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-900/40 border-t-slate-950"
                                ></span>
                                Update cart
                            </button>

                            <NuxtLink
                                to="/cart"
                                class="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
                                :class="{ 'pointer-events-none opacity-50': isCartDirty || isAnyUpdating }"
                            >
                                Go to cart
                            </NuxtLink>
                        </div>
                    </footer>
                </div>
            </aside>
        </div>
    </Teleport>
</template>
