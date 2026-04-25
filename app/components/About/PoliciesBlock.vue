<script setup lang="ts">
interface PolicyItem {
    icon: string
    title: string
    description: string
}

const policies: PolicyItem[] = [
    {
        icon: "/images/policies/shipping.svg",
        title: "Free Shipping",
        description: "Enjoy free shipping on qualifying orders with a clearer delivery experience."
    },
    {
        icon: "/images/policies/secure-payment.svg",
        title: "Secure Payment",
        description: "Protected checkout with trusted payment flows and transparent confirmation."
    },
    {
        icon: "/images/policies/support.svg",
        title: "Human Support",
        description: "Helpful support for product questions, order updates, and returns when needed."
    }
]
</script>

<template>
    <section class="bg-gradient-to-b from-white to-slate-50">
        <div class="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
            <div class="max-w-3xl">
                <span
                    class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                >
                    Shop with confidence
                </span>
                <h2 class="mt-4 max-w-lg text-4xl leading-tight font-bold tracking-tighter text-slate-950 sm:text-5xl lg:text-6xl">
                    A smoother purchase experience from product discovery to delivery.
                </h2>
                <p class="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                    Clear delivery, safer checkout, and responsive support built into the same premium storefront experience.
                </p>
            </div>

            <div class="mt-7 grid gap-4 md:grid-cols-3">
                <article
                    v-for="policy in policies"
                    :key="policy.title"
                    class="shadow-card grid min-h-full gap-4 rounded-3xl border border-white/80 bg-gradient-to-b from-white to-slate-50 p-5"
                >
                    <div
                        class="inline-flex h-13 w-13 items-center justify-center rounded-2xl border border-amber-200/70 bg-gradient-to-b from-amber-100/80 to-white"
                        aria-hidden="true"
                    >
                        <img :src="policy.icon" alt="" class="h-10 w-10" loading="lazy" width="40" height="40" />
                    </div>
                    <div class="min-w-0">
                        <h3 class="text-lg font-semibold text-slate-900">{{ policy.title }}</h3>
                        <p class="mt-2 text-base leading-7 text-slate-600">{{ policy.description }}</p>
                    </div>
                </article>
            </div>
        </div>
    </section>
</template>
