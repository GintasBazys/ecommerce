<script setup lang="ts">
interface PolicyItem {
    icon: string
    title: string
    description: string
    to: string
    action: string
}

const policies: PolicyItem[] = [
    {
        icon: "/images/policies/shipping.svg",
        title: "Free shipping",
        description: "Qualifying orders ship free with clear delivery expectations before checkout.",
        to: "/shipping",
        action: "Shipping details"
    },
    {
        icon: "/images/policies/secure-payment.svg",
        title: "Secure payment",
        description: "Protected checkout, trusted payment methods, and transparent order confirmation.",
        to: "/shipping",
        action: "Payment info"
    },
    {
        icon: "/images/policies/support.svg",
        title: "Human support",
        description: "Get help with product questions, order updates, shipping, and returns.",
        to: "/contact",
        action: "Contact support"
    }
]
</script>

<template>
    <section class="bg-linear-to-b from-white to-slate-50" aria-labelledby="policies-heading">
        <div class="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
            <div
                class="shadow-panel grid gap-6 rounded-4xl border border-slate-200/80 bg-white/75 p-4 backdrop-blur sm:p-5 lg:grid-cols-[0.9fr_1.6fr] lg:items-center lg:p-6"
            >
                <div class="max-w-xl">
                    <span
                        class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                    >
                        Shop with confidence
                    </span>

                    <h2
                        id="policies-heading"
                        class="mt-4 text-3xl leading-tight font-bold tracking-tighter text-slate-950 sm:text-4xl lg:text-5xl"
                    >
                        Clear support from cart to delivery.
                    </h2>

                    <p class="mt-3 text-base leading-7 text-slate-600">
                        A smoother purchase experience with helpful shipping, payment, and support information exactly where shoppers expect
                        it.
                    </p>
                </div>

                <div class="grid gap-3 md:grid-cols-3">
                    <NuxtLink
                        v-for="policy in policies"
                        :key="policy.title"
                        :to="policy.to"
                        class="group shadow-card rounded-3xl border border-slate-200 bg-linear-to-b from-white to-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-hidden"
                        :aria-label="`${policy.title}: ${policy.action}`"
                    >
                        <div
                            class="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200/70 bg-linear-to-b from-amber-100/80 to-white"
                            aria-hidden="true"
                        >
                            <img :src="policy.icon" alt="" class="h-9 w-9" loading="lazy" width="36" height="36" />
                        </div>

                        <h3 class="mt-4 text-base font-semibold text-slate-950">
                            {{ policy.title }}
                        </h3>

                        <p class="mt-2 text-sm leading-6 text-slate-600">
                            {{ policy.description }}
                        </p>

                        <span class="mt-4 inline-flex items-center text-sm font-semibold text-amber-800">
                            {{ policy.action }}
                            <span class="ml-1 transition group-hover:translate-x-0.5" aria-hidden="true">→</span>
                        </span>
                    </NuxtLink>
                </div>
            </div>
        </div>
    </section>
</template>
