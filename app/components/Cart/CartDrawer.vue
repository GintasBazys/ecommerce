<script setup lang="ts">
import type { CartLineItemDTO } from "@medusajs/types"

import NuxtImage from "~/components/Shared/NuxtImage.vue"
import { usePostHog } from "~/composables/usePostHog"
import { ALL_PRODUCTS_URL_HANDLE, DEFAULT_CURENCY } from "~/utils/consts"
import { formatPrice } from "~/utils/formatPrice"

const { cart, openCartDrawer } = storeToRefs(useCartStore())
const { removeLineItem, updateLineItem } = useCartStore()
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

const displayTotal = computed<string>(() => {
    const sum = (cart.value?.items || []).reduce((acc, item) => {
        const qty = qtyMap[item.id] ?? Number(item.quantity)
        return acc + qty * Number(item.unit_price)
    }, 0)

    return formatPrice(sum, cart.value?.currency_code ?? DEFAULT_CURENCY)
})

const displayTaxTotal = computed<string>(() =>
    formatPrice(Number(cart.value?.tax_total || 0), cart.value?.currency_code ?? DEFAULT_CURENCY)
)

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
                <div
                    v-if="openCartDrawer"
                    class="fixed inset-0 z-80 bg-[linear-gradient(180deg,rgba(2,6,23,0.5),rgba(2,6,23,0.66))] backdrop-blur-[2px]"
                    @click="closeDrawer"
                ></div>
            </transition>

            <aside
                ref="drawerRef"
                class="cart-drawer fixed right-0 bottom-0 z-85 w-full max-w-110 border-l border-white/60"
                :class="openCartDrawer ? 'cart-drawer--open' : 'cart-drawer--closed'"
                :aria-labelledby="titleId"
                role="search"
                @keydown="onDrawerKeydown"
            >
                <div class="cart-drawer__inner">
                    <div class="cart-drawer__top border-b border-slate-200/80 px-4 py-4 sm:px-5 sm:py-5">
                        <div
                            class="mb-4 h-px w-full bg-[linear-gradient(90deg,rgba(148,163,184,0),rgba(202,138,4,0.45),rgba(148,163,184,0))]"
                        ></div>
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <p
                                    class="inline-flex rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-amber-900"
                                >
                                    Cart overview
                                </p>
                                <h2
                                    :id="titleId"
                                    class="mt-3 max-w-[12ch] text-xl font-semibold leading-tight tracking-[-0.03em] text-slate-950 sm:text-[1.75rem]"
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
                                class="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-[0_10px_30px_rgba(8,27,90,0.08)] transition hover:border-amber-200 hover:text-slate-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200"
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

                    <div class="cart-drawer__scroll px-3 py-3 sm:px-4 sm:py-4">
                        <div v-if="cart?.items?.length" class="grid gap-3.5">
                            <article
                                v-for="item in cart.items"
                                :key="item.id"
                                class="grid grid-cols-[84px_minmax(0,1fr)] gap-3 rounded-[1.35rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-3 shadow-[0_14px_36px_rgba(8,27,90,0.07)] sm:grid-cols-[96px_minmax(0,1fr)]"
                            >
                                <NuxtImage
                                    :src="item.thumbnail || '/images/about-premium.jpg'"
                                    :alt="item.product_title || 'Product image'"
                                    width="96"
                                    height="112"
                                    loading="lazy"
                                    class="h-24 w-21 rounded-2xl bg-slate-100 object-cover sm:h-28 sm:w-24"
                                />

                                <div class="flex min-w-0 flex-col justify-between gap-3">
                                    <div>
                                        <p class="text-sm font-semibold text-slate-950">{{ item.product_title }}</p>
                                        <p class="mt-1 text-xs tracking-[0.03em] text-slate-500">
                                            {{ item.variant_title || "Standard option" }}
                                        </p>
                                    </div>

                                    <div class="flex items-end justify-between gap-3">
                                        <div
                                            class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50/90 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                                        >
                                            <button
                                                type="button"
                                                class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border-0 bg-transparent text-slate-700 transition hover:bg-white hover:text-slate-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
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
                                                class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border-0 bg-transparent text-slate-700 transition hover:bg-white hover:text-slate-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
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
                                                {{
                                                    formatPrice(
                                                        (qtyMap[item.id] ?? Number(item.quantity)) * Number(item.unit_price),
                                                        cart?.currency_code ?? DEFAULT_CURENCY
                                                    )
                                                }}
                                            </p>
                                            <button
                                                type="button"
                                                class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 transition hover:border-rose-200 hover:text-rose-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-200"
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
                            class="rounded-[1.6rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-6 text-center shadow-[0_18px_44px_rgba(8,27,90,0.08)]"
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
                            <NuxtLink
                                :to="ALL_PRODUCTS_URL_HANDLE"
                                class="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#cda45e] px-5 text-sm font-semibold text-slate-950 transition hover:bg-[#d8b57a] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200"
                            >
                                Keep shopping
                            </NuxtLink>
                        </section>
                    </div>

                    <footer
                        class="cart-drawer__footer border-t border-slate-200/80 bg-white/85 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur sm:px-5"
                    >
                        <div
                            class="space-y-2 rounded-3xl border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-4 shadow-[0_14px_36px_rgba(8,27,90,0.06)]"
                        >
                            <div class="flex items-center justify-between gap-2">
                                <span class="text-sm text-slate-600">Subtotal</span>
                                <strong class="text-sm text-slate-950">{{ displayTotal }}</strong>
                            </div>
                            <div class="flex items-center justify-between gap-2">
                                <span class="text-sm text-slate-600">Tax</span>
                                <strong class="text-sm text-slate-950">{{ displayTaxTotal }}</strong>
                            </div>
                            <div class="pt-1">
                                <div
                                    class="mb-3 h-px w-full bg-[linear-gradient(90deg,rgba(148,163,184,0),rgba(202,138,4,0.35),rgba(148,163,184,0))]"
                                ></div>
                                <p class="text-xs tracking-[0.04em] text-slate-500">Shipping is calculated during checkout.</p>
                            </div>
                        </div>

                        <div class="mt-4 grid gap-2">
                            <button
                                v-if="isCartDirty"
                                type="button"
                                class="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#cda45e] px-5 text-sm font-semibold text-slate-950 transition hover:bg-[#d8b57a] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
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
                                class="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:text-slate-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200"
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

<style scoped>
.cart-drawer {
    top: 0;
    background: linear-gradient(180deg, #fbfcfe 0%, #f6f8fc 58%, #f2f5fa 100%);
    box-shadow: -12px 0 32px rgba(2, 6, 23, 0.14);
    transform: translate3d(100%, 0, 0);
    transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
    backface-visibility: hidden;
    contain: layout paint style;
    overflow: hidden;
}

.cart-drawer--open {
    transform: translate3d(0, 0, 0);
}

.cart-drawer--closed {
    transform: translate3d(100%, 0, 0);
}

.cart-drawer__inner {
    display: flex;
    height: 100%;
    min-height: 0;
    flex-direction: column;
}

.cart-drawer__top,
.cart-drawer__footer {
    flex: 0 0 auto;
}

.cart-drawer__scroll {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
}
</style>
