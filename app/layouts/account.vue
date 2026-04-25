<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const customerStore = useCustomerStore()
const { customer } = storeToRefs(customerStore)
const isClientHydrated = ref(false)

onMounted(() => {
    isClientHydrated.value = true
})

const accountNav = [
    { label: "Dashboard", to: "/account", icon: "dashboard" },
    { label: "Profile", to: "/account/profile", icon: "profile" },
    { label: "Addresses", to: "/account/address", icon: "addresses" },
    { label: "Orders", to: "/account/orders", icon: "orders" }
] as const

const pageContent = computed(() => {
    if (route.path === "/account") {
        return {
            eyebrow: "Account dashboard",
            title: "A cleaner space for everything tied to your customer account.",
            description:
                "Move between profile, addresses, and orders from one shared account shell instead of jumping through disconnected pages."
        }
    }

    if (route.path.startsWith("/account/profile")) {
        return {
            eyebrow: "Profile settings",
            title: "Keep your details current for smoother future orders.",
            description: "Update the information attached to your account while staying inside the same focused account workspace."
        }
    }

    if (route.path.startsWith("/account/address")) {
        return {
            eyebrow: "Saved addresses",
            title: "Manage delivery and billing locations in one place.",
            description: "Add, edit, and review saved addresses without leaving the shared account experience."
        }
    }

    if (route.path.startsWith("/account/orders/")) {
        return {
            eyebrow: "Order details",
            title: "Review a single order with all of its invoice and delivery context.",
            description: "Open one purchase at a time while keeping the broader account navigation close at hand."
        }
    }

    return {
        eyebrow: "Order history",
        title: "Track every purchase from the same account workspace.",
        description: "Browse past orders, inspect statuses, and reopen details without switching into a separate layout."
    }
})

const breadcrumbItems = computed(() => {
    const items = [{ label: "Account", to: "/account" }]

    if (route.path === "/account") {
        return items
    }

    if (route.path.startsWith("/account/profile")) {
        items.push({ label: "Profile", to: "/account/profile" })
        return items
    }

    if (route.path.startsWith("/account/address")) {
        items.push({ label: "Addresses", to: "/account/address" })
        return items
    }

    if (route.path.startsWith("/account/orders/")) {
        items.push({ label: "Orders", to: "/account/orders" })
        items.push({ label: "Order details", to: route.path })
        return items
    }

    items.push({ label: "Orders", to: "/account/orders" })
    return items
})

const accountStatus = computed(() => [
    {
        label: "Signed in",
        value: isClientHydrated.value ? customer.value?.email || "Account member" : "Account member"
    },
    {
        label: "Current section",
        value: breadcrumbItems.value[breadcrumbItems.value.length - 1]?.label || "Account"
    }
])

const customerLabel = computed(() => {
    const firstName = isClientHydrated.value ? customer.value?.first_name || "Account" : "Account"
    const lastName = isClientHydrated.value ? customer.value?.last_name || "Member" : "Member"

    return `${firstName} ${lastName}`.trim()
})

function isActivePath(path: string): boolean {
    if (path === "/account") {
        return route.path === path
    }

    return route.path === path || route.path.startsWith(`${path}/`)
}

function iconPaths(icon: (typeof accountNav)[number]["icon"]): string[] {
    if (icon === "dashboard") {
        return ["M4 4h7v7H4z", "M13 4h7v5h-7z", "M13 11h7v9h-7z", "M4 13h7v7H4z"]
    }

    if (icon === "profile") {
        return ["M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z", "M4.5 19.5a7.5 7.5 0 0 1 15 0"]
    }

    if (icon === "addresses") {
        return ["M12 21s-5.5-5.7-5.5-10a5.5 5.5 0 1 1 11 0c0 4.3-5.5 10-5.5 10Z", "M12 13.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z"]
    }

    return ["M6 7h12", "M8 4h8v4H8z", "M5 7h14v11H5z", "M9 11h6", "M9 15h4"]
}

async function handleLogout(): Promise<void> {
    try {
        const response = await $fetch<{ success: boolean }>("/api/account/logout", { method: "POST" })

        if (response.success) {
            customerStore.$patch({ customer: null })
            await router.push("/")
        }
    } catch (error) {
        console.error("Logout failed", error)
    }
}
</script>

<template>
    <main class="min-h-screen bg-slate-50">
        <div class="mx-auto w-full max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pb-12 sm:pt-16 xl:pb-16">
            <header class="max-w-4xl">
                <div class="grid gap-4">
                    <nav class="flex flex-wrap items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
                        <template v-for="(item, index) in breadcrumbItems" :key="item.to">
                            <NuxtLink
                                v-if="index < breadcrumbItems.length - 1"
                                :to="item.to"
                                class="rounded-full border border-slate-200 bg-white px-3 py-1.5 transition hover:border-amber-200 hover:text-slate-900"
                            >
                                {{ item.label }}
                            </NuxtLink>
                            <span v-else class="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 font-semibold text-slate-900">
                                {{ item.label }}
                            </span>
                            <span v-if="index < breadcrumbItems.length - 1" aria-hidden="true" class="text-slate-400">/</span>
                        </template>
                    </nav>

                    <div class="flex flex-wrap gap-3">
                        <div v-for="item in accountStatus" :key="item.label" class="min-w-[10rem] rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <span class="block text-[0.72rem] font-bold uppercase tracking-[0.12em] text-slate-500">{{ item.label }}</span>
                            <strong class="mt-1 block text-sm font-semibold text-slate-950">{{ item.value }}</strong>
                        </div>
                    </div>
                </div>

                <div class="mt-5">
                    <span class="inline-flex min-h-9 items-center rounded-full bg-brand-100 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-brand-700">
                        {{ pageContent.eyebrow }}
                    </span>
                    <h1 class="mt-4 max-w-[14ch] text-[2.4rem] font-bold leading-[0.96] tracking-[-0.06rem] text-slate-950 sm:text-[3rem] xl:text-[3.6rem]">
                        {{ pageContent.title }}
                    </h1>
                    <p class="mt-4 max-w-3xl text-[0.98rem] leading-7 text-slate-600 sm:text-base sm:leading-8">
                        {{ pageContent.description }}
                    </p>
                </div>
            </header>

            <div class="mt-8 grid gap-5 xl:grid-cols-[minmax(17rem,20rem)_minmax(0,1fr)] xl:items-start">
                <aside class="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 xl:sticky xl:top-6">
                    <div class="flex items-center gap-4 rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                        <div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-sm font-bold uppercase tracking-[0.08em] text-amber-900 ring-1 ring-amber-100">
                            {{ customerLabel.slice(0, 2) }}
                        </div>
                        <div class="min-w-0">
                            <p class="truncate text-base font-semibold text-slate-950">{{ customerLabel }}</p>
                            <p class="truncate text-sm leading-6 text-slate-600">
                                {{ isClientHydrated ? customer?.email || 'Signed in customer' : 'Signed in customer' }}
                            </p>
                        </div>
                    </div>

                    <nav class="mt-4 grid gap-2" aria-label="Account navigation">
                        <NuxtLink
                            v-for="item in accountNav"
                            :key="item.to"
                            :to="item.to"
                            class="flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition motion-reduce:transition-none"
                            :class="
                                isActivePath(item.to)
                                    ? 'bg-amber-50 text-slate-950 ring-1 ring-amber-100'
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                            "
                        >
                            <span
                                class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
                                :class="isActivePath(item.to) ? 'border-amber-200 bg-white text-amber-900' : 'border-slate-200 bg-white text-slate-500'"
                            >
                                <svg viewBox="0 0 24 24" class="h-4.5 w-4.5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                    <path v-for="path in iconPaths(item.icon)" :key="path" :d="path" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </span>
                            <span>{{ item.label }}</span>
                        </NuxtLink>
                    </nav>

                    <button
                        type="button"
                        class="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:text-slate-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200 motion-reduce:transition-none"
                        @click="handleLogout"
                    >
                        Log out
                    </button>
                </aside>

                <section class="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
                    <slot></slot>
                </section>
            </div>
        </div>
    </main>
</template>
