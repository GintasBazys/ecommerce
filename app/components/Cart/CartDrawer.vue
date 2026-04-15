<script setup lang="ts">
import type { CartLineItemDTO } from "@medusajs/types"

import { ALL_PRODUCTS_URL_HANDLE, DEFAULT_CURENCY } from "~/utils/consts"
import { formatPrice } from "~/utils/formatPrice"

const { cart, openCartDrawer } = storeToRefs(useCartStore())
const { removeLineItem, updateLineItem } = useCartStore()

const isHydrated = ref(false)
const drawerRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)
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
    }
})

onBeforeUnmount(() => {
    unregisterAfterEach()
    document.body.style.overflow = ""
})

watch(openCartDrawer, async (opened) => {
    if (!import.meta.client) {
        return
    }

    if (opened) {
        previousFocusedElement.value = document.activeElement as HTMLElement
        document.body.style.overflow = "hidden"
        await nextTick()
        closeButtonRef.value?.focus()
        return
    }

    document.body.style.overflow = ""
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

    try {
        await removeLineItem(lineItemId)
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
        <div v-if="isHydrated" class="pointer-events-none fixed inset-0 z-[80]">
            <transition name="fade">
                <div v-if="openCartDrawer" class="pointer-events-auto absolute inset-0 bg-slate-950/50" @click="closeDrawer"></div>
            </transition>

            <aside
                ref="drawerRef"
                class="pointer-events-auto absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col border-l border-slate-200 bg-gradient-to-b from-[#f6f9ff] via-white to-[#f7faff] shadow-2xl transition-transform duration-300"
                :class="openCartDrawer ? 'translate-x-0' : 'translate-x-full'"
                aria-label="Shopping cart"
                role="search"
                @keydown="onDrawerKeydown"
            >
                <div class="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:p-4">
                    <div>
                        <p
                            class="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700"
                        >
                            Cart overview
                        </p>
                        <h2 class="mt-3 text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">Your order is nearly ready.</h2>
                        <p class="mt-2 text-sm leading-6 text-slate-600">
                            Review quantities, make quick changes, and continue to checkout when everything looks right.
                        </p>
                    </div>

                    <button ref="closeButtonRef" type="button" class="ui-icon-btn shrink-0" @click="closeDrawer">
                        <span class="sr-only">Close cart drawer</span>
                        <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                            <path
                                d="M5.22 5.22a.75.75 0 0 1 1.06 0L10 8.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L11.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 0-1.06Z"
                            />
                        </svg>
                    </button>
                </div>

                <div class="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:p-4">
                    <div v-if="cart?.items?.length" class="grid gap-3">
                        <article
                            v-for="item in cart.items"
                            :key="item.id"
                            class="grid grid-cols-[84px_minmax(0,1fr)] gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-panel sm:grid-cols-[96px_minmax(0,1fr)]"
                        >
                            <NuxtImage
                                :src="item.thumbnail || '/images/about_banner.webp'"
                                :alt="item.product_title || 'Product image'"
                                width="96"
                                height="112"
                                loading="lazy"
                                class="h-24 w-[84px] rounded-xl bg-slate-100 object-cover sm:h-28 sm:w-24"
                            />

                            <div class="flex min-w-0 flex-col justify-between gap-3">
                                <div>
                                    <p class="text-sm font-semibold text-slate-900">{{ item.product_title }}</p>
                                    <p class="mt-1 text-xs text-slate-500">{{ item.variant_title || "Standard option" }}</p>
                                </div>

                                <div class="flex items-end justify-between gap-3">
                                    <div class="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 p-1">
                                        <button
                                            type="button"
                                            class="ui-icon-btn min-h-11 min-w-11 border-0 bg-transparent"
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
                                            class="ui-icon-btn min-h-11 min-w-11 border-0 bg-transparent"
                                            :disabled="(qtyMap[item.id] ?? Number(item.quantity)) >= (item.stocked_quantity ?? Infinity)"
                                            :aria-label="`Increase quantity for ${item.product_title}`"
                                            @click="incrementQty(item)"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div class="flex items-center gap-2">
                                        <p class="text-sm font-semibold text-slate-900">
                                            {{
                                                formatPrice(
                                                    (qtyMap[item.id] ?? Number(item.quantity)) * Number(item.unit_price),
                                                    cart?.currency_code ?? DEFAULT_CURENCY
                                                )
                                            }}
                                        </p>
                                        <button
                                            type="button"
                                            class="ui-icon-btn min-h-11 min-w-11"
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

                    <section v-else class="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-panel">
                        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">🛒</div>
                        <h3 class="mt-3 text-lg font-semibold text-slate-900">Your cart is empty</h3>
                        <p class="mt-2 text-sm leading-6 text-slate-600">
                            Add a few pieces you love and they will appear here for a quick final review.
                        </p>
                        <NuxtLink :to="ALL_PRODUCTS_URL_HANDLE" class="ui-btn-primary mt-5">Keep shopping</NuxtLink>
                    </section>
                </div>

                <footer class="border-t border-slate-200 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                    <div class="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-sm text-slate-600">Subtotal</span>
                            <strong class="text-sm text-slate-900">{{ displayTotal }}</strong>
                        </div>
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-sm text-slate-600">Tax</span>
                            <strong class="text-sm text-slate-900">{{ displayTaxTotal }}</strong>
                        </div>
                        <p class="pt-1 text-xs text-slate-500">Shipping is calculated during checkout.</p>
                    </div>

                    <div class="mt-4 grid gap-2">
                        <button
                            v-if="isCartDirty"
                            type="button"
                            class="ui-btn-primary w-full"
                            :disabled="!isCartDirty || isAnyUpdating"
                            @click="updateCart"
                        >
                            <span
                                v-if="isAnyUpdating"
                                class="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-white"
                            ></span>
                            Update cart
                        </button>

                        <NuxtLink
                            to="/cart"
                            class="ui-btn-secondary w-full"
                            :class="{ 'pointer-events-none opacity-50': isCartDirty || isAnyUpdating }"
                        >
                            Go to cart
                        </NuxtLink>
                    </div>
                </footer>
            </aside>
        </div>
    </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
