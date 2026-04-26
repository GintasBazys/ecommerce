<script setup lang="ts">
const props = defineProps<{
    total: string
    itemCount: number
    continueShoppingUrl: string
}>()
</script>

<template>
    <div
        class="rounded-panel shadow-panel overflow-hidden border border-white/80 bg-linear-to-b from-white to-slate-50 p-5 sm:rounded-4xl sm:p-7"
    >
        <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="max-w-2xl">
                <span class="ui-badge-accent"> Shopping cart </span>
                <h1 class="mt-4 max-w-lg text-4xl leading-tight font-bold tracking-tighter text-slate-950 sm:text-5xl lg:text-7xl">
                    Review your picks before you head to checkout.
                </h1>
                <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                    Fine-tune quantities, remove anything that no longer fits, and keep your order feeling as considered as the rest of the
                    shop.
                </p>
            </div>

            <div class="grid w-full gap-3 sm:w-auto sm:min-w-72">
                <NuxtLink :to="props.continueShoppingUrl" class="ui-btn-accent min-h-12"> Continue shopping </NuxtLink>
                <div class="rounded-card shadow-card border border-slate-200/80 bg-white/80 p-4">
                    <p class="text-label-eyebrow tracking-label font-bold text-slate-500 uppercase">Current total</p>
                    <p class="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                        {{ props.total }}
                    </p>
                    <p class="mt-2 text-sm leading-6 text-slate-600">
                        {{ props.itemCount }} item{{ props.itemCount === 1 ? "" : "s" }} in your cart
                    </p>
                </div>
            </div>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-3">
            <div class="rounded-card border border-slate-200/80 bg-white/80 p-4">
                <p class="text-sm font-semibold text-slate-950">Save cart changes first</p>
                <p class="mt-1 text-sm leading-6 text-slate-600">Live totals update after cart changes are applied.</p>
            </div>
            <div class="rounded-card border border-slate-200/80 bg-white/80 p-4">
                <p class="text-sm font-semibold text-slate-950">Promo codes before checkout</p>
                <p class="mt-1 text-sm leading-6 text-slate-600">Apply promotions here once quantities are final.</p>
            </div>
            <div class="rounded-card border border-slate-200/80 bg-white/80 p-4">
                <p class="text-sm font-semibold text-slate-950">Shipping next step</p>
                <p class="mt-1 text-sm leading-6 text-slate-600">Delivery options and shipping costs are confirmed during checkout.</p>
            </div>
        </div>
    </div>
</template>
