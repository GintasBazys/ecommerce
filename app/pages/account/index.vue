<script setup lang="ts">
definePageMeta({
    layout: "account",
    middleware: ["auth"]
})

useHead({ title: "Account | Medusa Commerce" })

const { customer } = storeToRefs(useCustomerStore())

const accountLinks = [
    {
        title: "Profile",
        description: "Update your personal and company information.",
        detail: "Keep contact and account details accurate for future orders.",
        to: "/account/profile",
        icon: "profile"
    },
    {
        title: "Addresses",
        description: "Manage saved billing and delivery locations.",
        detail: "Review saved destinations before your next checkout.",
        to: "/account/address",
        icon: "addresses"
    },
    {
        title: "Orders",
        description: "Browse previous purchases and reopen order details.",
        detail: "Track history, status changes, and past order context.",
        to: "/account/orders",
        icon: "orders"
    }
] as const

const accountHighlights = computed(() => [
    {
        label: "Signed in as",
        value: customer.value?.email || "Account member"
    },
    {
        label: "Primary name",
        value: `${customer.value?.first_name || "Account"} ${customer.value?.last_name || "Member"}`.trim()
    }
])

function iconPaths(icon: (typeof accountLinks)[number]["icon"]): string[] {
    if (icon === "profile") {
        return ["M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z", "M4.5 19.5a7.5 7.5 0 0 1 15 0"]
    }

    if (icon === "addresses") {
        return ["M12 21s-5.5-5.7-5.5-10a5.5 5.5 0 1 1 11 0c0 4.3-5.5 10-5.5 10Z", "M12 13.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z"]
    }

    return ["M6 7h12", "M8 4h8v4H8z", "M5 7h14v11H5z", "M9 11h6", "M9 15h4"]
}
</script>

<template>
    <div class="grid gap-5">
        <section class="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <span
                class="bg-brand-100 text-brand-700 text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full px-4 py-2 font-bold uppercase"
            >
                Welcome back
            </span>
            <h2 class="mt-4 max-w-md text-3xl leading-tight font-bold tracking-tight text-slate-950 sm:text-4xl">
                {{ customer?.first_name || "Account" }}, here is your quick account overview.
            </h2>
            <p class="mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:leading-8">
                Open the section you need and manage it from the shared account workspace.
            </p>

            <div class="mt-6 grid gap-3 sm:grid-cols-2">
                <div
                    v-for="item in accountHighlights"
                    :key="item.label"
                    class="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
                >
                    <span class="text-label-xs tracking-label-tight block font-bold text-slate-500 uppercase">{{ item.label }}</span>
                    <strong class="mt-1 block text-sm font-semibold text-slate-950 sm:text-base">{{ item.value }}</strong>
                </div>
            </div>
        </section>

        <section class="grid gap-4 lg:grid-cols-3">
            <NuxtLink
                v-for="link in accountLinks"
                :key="link.to"
                :to="link.to"
                class="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden motion-reduce:transition-none"
            >
                <article class="grid h-full gap-4">
                    <div
                        class="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-900"
                    >
                        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                            <path
                                v-for="path in iconPaths(link.icon)"
                                :key="path"
                                :d="path"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </div>

                    <div>
                        <h3 class="text-lg font-semibold text-slate-950">{{ link.title }}</h3>
                        <p class="mt-2 text-sm leading-7 text-slate-600">{{ link.description }}</p>
                    </div>

                    <div class="mt-auto flex items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm">
                        <span class="text-slate-500">{{ link.detail }}</span>
                        <span class="font-semibold text-slate-900 transition group-hover:text-amber-900">Open</span>
                    </div>
                </article>
            </NuxtLink>
        </section>
    </div>
</template>
