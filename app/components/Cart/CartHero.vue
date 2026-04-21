<script setup lang="ts">
const props = defineProps<{
    total: string
    itemCount: number
    continueShoppingUrl: string
}>()
</script>

<template>
    <div class="overflow-hidden rounded-[1.75rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 shadow-[0_18px_48px_rgba(8,27,90,0.08)] sm:rounded-[2rem] sm:p-7">
        <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="max-w-2xl">
                <span class="inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-amber-900">
                    Shopping cart
                </span>
                <h1 class="mt-4 max-w-[12ch] text-[2.2rem] font-bold leading-[0.96] tracking-[-0.06rem] text-slate-950 sm:text-[3rem] lg:text-[4.2rem]">
                    Review your picks before you head to checkout.
                </h1>
                <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                    Fine-tune quantities, remove anything that no longer fits, and keep your order feeling as considered as the rest of the shop.
                </p>
            </div>

            <div class="grid w-full gap-3 sm:w-auto sm:min-w-72">
                <NuxtLink
                    :to="props.continueShoppingUrl"
                    class="inline-flex min-h-12 items-center justify-center rounded-full bg-[#cda45e] px-5 text-sm font-semibold text-slate-950 transition hover:bg-[#d8b57a] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200"
                >
                    Continue shopping
                </NuxtLink>
                <div class="rounded-[1.4rem] border border-slate-200/80 bg-white/80 p-4 shadow-[0_10px_26px_rgba(8,27,90,0.05)]">
                    <p class="text-[0.74rem] font-bold uppercase tracking-[0.14em] text-slate-500">Current total</p>
                    <p class="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                        {{ props.total }}
                    </p>
                    <p class="mt-2 text-sm leading-6 text-slate-600">
                        {{ props.itemCount }} item{{ props.itemCount === 1 ? "" : "s" }} in your cart
                    </p>
                </div>
            </div>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-3">
            <div class="rounded-[1.35rem] border border-slate-200/80 bg-white/80 p-4">
                <p class="text-sm font-semibold text-slate-950">Save cart changes first</p>
                <p class="mt-1 text-sm leading-6 text-slate-600">Live totals update after cart changes are applied.</p>
            </div>
            <div class="rounded-[1.35rem] border border-slate-200/80 bg-white/80 p-4">
                <p class="text-sm font-semibold text-slate-950">Promo codes before checkout</p>
                <p class="mt-1 text-sm leading-6 text-slate-600">Apply promotions here once quantities are final.</p>
            </div>
            <div class="rounded-[1.35rem] border border-slate-200/80 bg-white/80 p-4">
                <p class="text-sm font-semibold text-slate-950">Shipping next step</p>
                <p class="mt-1 text-sm leading-6 text-slate-600">Delivery options and shipping costs are confirmed during checkout.</p>
            </div>
        </div>
    </div>
</template>
