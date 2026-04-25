<script setup lang="ts">
type PromotionSummary = {
    id: string
    code?: string | null
    application_method?: {
        value?: number | string | null
    } | null
}

const props = defineProps<{
    itemCount: number
    promotionCount: number
    couponCode: string
    hasCartItems: boolean
    isCartDirty: boolean
    isApplyingCoupon: boolean
    isCouponDisabled: boolean
    isCheckoutDisabled: boolean
    couponHint: string
    subtotal: string
    tax: string
    total: string
    promotionValue: (_promo: PromotionSummary) => string
    promotions: PromotionSummary[]
}>()

const emit = defineEmits<{
    update: [value: string]
    submit: []
    removePromotion: [code: string | undefined]
}>()

function onCouponInput(event: Event): void {
    const value = event.target instanceof HTMLInputElement ? event.target.value : ""
    emit("update", value)
}
</script>

<template>
    <div
        class="overflow-hidden rounded-[1.75rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 shadow-[0_18px_48px_rgba(8,27,90,0.08)] sm:p-6"
    >
        <span class="ui-badge-brand"> Order summary </span>
        <h2 class="mt-4 text-[1.8rem] leading-[1.05] font-semibold tracking-[-0.04rem] text-slate-950 sm:text-[2.2rem]">
            A clean view of what you are about to order.
        </h2>
        <p class="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            Apply a promotion, review the totals, and continue once cart updates are saved.
        </p>

        <div class="mt-5 rounded-[1.4rem] border border-slate-200/80 bg-white/85 p-4 shadow-[0_10px_26px_rgba(8,27,90,0.05)]">
            <div class="flex items-center justify-between gap-3">
                <div>
                    <p class="text-label-eyebrow tracking-label font-bold text-slate-500 uppercase">Cart snapshot</p>
                    <p class="mt-2 text-sm font-semibold text-slate-950">
                        {{ props.itemCount }} item{{ props.itemCount === 1 ? "" : "s" }} selected
                    </p>
                </div>
                <div class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">
                    {{ props.promotionCount }} promo{{ props.promotionCount === 1 ? "" : "s" }}
                </div>
            </div>
        </div>

        <form class="mt-5 grid gap-3" @submit.prevent="emit('submit')">
            <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-900">Promo code</span>
                <input
                    :value="props.couponCode"
                    name="couponTextInput"
                    type="text"
                    placeholder="Enter coupon code"
                    class="ui-input-accent border-slate-200 placeholder:text-slate-400 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    :disabled="!props.hasCartItems || props.isCartDirty"
                    @input="onCouponInput"
                />
            </label>
            <button type="submit" class="ui-btn-accent min-h-12" :disabled="props.isCouponDisabled">
                <span
                    v-if="props.isApplyingCoupon"
                    class="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-900/40 border-t-slate-950"
                ></span>
                Apply code
            </button>
        </form>

        <p class="mt-3 text-sm leading-6 text-slate-600">{{ props.couponHint }}</p>

        <div v-if="props.promotions.length" class="mt-5 grid gap-3">
            <h3 class="text-sm font-semibold text-slate-950">Applied promotions</h3>
            <div
                v-for="promo in props.promotions"
                :key="promo.id"
                class="flex items-center justify-between gap-3 rounded-[1.2rem] border border-slate-200/80 bg-slate-50/80 p-4"
            >
                <div>
                    <p class="font-semibold text-slate-950">{{ promo.code }}</p>
                    <p class="mt-1 text-sm text-slate-600">
                        {{ props.promotionValue(promo) }}
                    </p>
                </div>
                <button
                    type="button"
                    class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:outline-hidden"
                    aria-label="Remove promotion"
                    @click="emit('removePromotion', promo.code || undefined)"
                >
                    <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                        <path
                            d="M5.22 5.22a.75.75 0 0 1 1.06 0L10 8.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L11.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 0-1.06Z"
                        />
                    </svg>
                </button>
            </div>
        </div>

        <div class="my-5 h-px w-full bg-[linear-gradient(90deg,rgba(148,163,184,0),rgba(202,138,4,0.38),rgba(148,163,184,0))]"></div>

        <div class="grid gap-3">
            <div class="flex items-center justify-between gap-3 text-sm text-slate-600">
                <span>Subtotal</span>
                <span class="font-semibold text-slate-950">{{ props.subtotal }}</span>
            </div>
            <div class="flex items-center justify-between gap-3 text-sm text-slate-600">
                <span>Tax</span>
                <span class="font-semibold text-slate-950">{{ props.tax }}</span>
            </div>
            <div class="flex items-center justify-between gap-3 rounded-[1.2rem] border border-slate-200/80 bg-slate-50/80 px-4 py-3">
                <span class="text-sm font-semibold text-slate-900">Total</span>
                <strong class="text-lg font-semibold tracking-[-0.02em] text-slate-950">
                    {{ props.total }}
                </strong>
            </div>
        </div>

        <p class="mt-4 text-sm leading-6 text-slate-600">Shipping is calculated during the next step.</p>

        <div class="mt-5 grid gap-3">
            <NuxtLink
                :to="props.isCheckoutDisabled ? undefined : '/checkout'"
                class="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-hidden"
                :class="props.isCheckoutDisabled ? 'pointer-events-none opacity-50' : ''"
            >
                Checkout
            </NuxtLink>
            <p v-if="props.isCheckoutDisabled" class="text-sm leading-6 text-slate-600">
                <span v-if="!props.hasCartItems">Add items to continue to checkout.</span>
                <span v-else-if="props.isCartDirty">Update your cart before continuing.</span>
                <span v-else>Your cart total must be greater than zero.</span>
            </p>
        </div>
    </div>
</template>
