<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const customerStore = useCustomerStore()
const { customer } = storeToRefs(customerStore)

const accountNav = [
    { label: "Dashboard", to: "/account", icon: "mdi-view-grid-outline" },
    { label: "Profile", to: "/account/profile", icon: "mdi-account-circle-outline" },
    { label: "Addresses", to: "/account/address", icon: "mdi-map-marker-outline" },
    { label: "Orders", to: "/account/orders", icon: "mdi-bag-personal-outline" }
]

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
        value: customer.value?.email || "Account member"
    },
    {
        label: "Current section",
        value: breadcrumbItems.value[breadcrumbItems.value.length - 1]?.label || "Account"
    }
])

async function handleLogout(): Promise<void> {
    const response = await $fetch<{ success: boolean }>("/api/account/logout", { method: "POST" })

    if (response.success) {
        customerStore.$patch({ customer: null })
        await router.push("/")
    }
}
</script>

<template>
    <main class="accountShell">
        <div class="accountShell__backdrop"></div>
        <VContainer class="accountShell__container">
            <header class="accountShell__hero">
                <div class="accountShell__metaRow">
                    <nav class="accountShell__breadcrumb" aria-label="Breadcrumb">
                        <template v-for="(item, index) in breadcrumbItems" :key="item.to">
                            <NuxtLink v-if="index < breadcrumbItems.length - 1" :to="item.to" class="accountShell__breadcrumbLink">
                                {{ item.label }}
                            </NuxtLink>
                            <span v-else class="accountShell__breadcrumbCurrent">{{ item.label }}</span>
                            <VIcon v-if="index < breadcrumbItems.length - 1" size="16" class="accountShell__breadcrumbIcon">
                                mdi-chevron-right
                            </VIcon>
                        </template>
                    </nav>
                    <div class="accountShell__statusStrip">
                        <div v-for="item in accountStatus" :key="item.label" class="accountShell__statusItem">
                            <span class="accountShell__statusLabel">{{ item.label }}</span>
                            <strong class="accountShell__statusValue">{{ item.value }}</strong>
                        </div>
                    </div>
                </div>
                <div>
                    <span class="accountShell__eyebrow">{{ pageContent.eyebrow }}</span>
                    <h1 class="accountShell__title">{{ pageContent.title }}</h1>
                    <p class="accountShell__description">{{ pageContent.description }}</p>
                </div>
            </header>
            <div class="accountShell__grid">
                <aside class="accountShell__sidebar">
                    <div class="accountShell__profileCard">
                        <div class="accountShell__avatar">
                            <VIcon size="24">mdi-account-outline</VIcon>
                        </div>
                        <div>
                            <p class="accountShell__profileName">
                                {{ customer?.first_name || "Account" }} {{ customer?.last_name || "Member" }}
                            </p>
                            <p class="accountShell__profileEmail">{{ customer?.email || "Signed in customer" }}</p>
                        </div>
                    </div>
                    <nav class="accountShell__nav">
                        <NuxtLink
                            v-for="item in accountNav"
                            :key="item.to"
                            :to="item.to"
                            class="accountShell__navLink"
                            :class="{ 'accountShell__navLink--active': route.path === item.to || route.path.startsWith(`${item.to}/`) }"
                        >
                            <VIcon size="18">{{ item.icon }}</VIcon>
                            <span>{{ item.label }}</span>
                        </NuxtLink>
                    </nav>
                    <VBtn color="primary" rounded="pill" class="accountShell__logoutBtn text-none" block @click="handleLogout"
                    >Log out</VBtn
                    >
                </aside>
                <main class="accountShell__content">
                    <slot></slot>
                </main>
            </div>
        </VContainer>
    </main>
</template>

<style scoped lang="scss">
.accountShell {
    position: relative;
    min-height: 100vh;
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.accountShell__backdrop {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(circle at top right, rgba(0, 128, 255, 0.1), transparent 24%),
        radial-gradient(circle at bottom left, rgba(1, 12, 128, 0.06), transparent 28%);
    pointer-events: none;
}

.accountShell__container {
    position: relative;
    z-index: 1;
    padding-top: clamp(3.75rem, 6vw, 5rem);
    padding-bottom: clamp(3rem, 5vw, 4.5rem);
}

.accountShell__hero {
    max-width: 48rem;
    margin-bottom: 1.8rem;
}

.accountShell__metaRow {
    display: grid;
    gap: 1rem;
    margin-bottom: 1.1rem;
}

.accountShell__breadcrumb,
.accountShell__statusStrip {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.45rem;
}

.accountShell__breadcrumb {
    color: #6a7590;
    font-size: 0.92rem;
}

.accountShell__breadcrumbLink,
.accountShell__breadcrumbCurrent {
    text-decoration: none;
}

.accountShell__breadcrumbLink {
    color: #4b5874;
}

.accountShell__breadcrumbCurrent,
.accountShell__statusValue {
    color: #08173f;
    font-weight: 700;
}

.accountShell__breadcrumbIcon {
    color: #9aa4bd;
}

.accountShell__statusStrip {
    gap: 0.75rem;
}

.accountShell__statusItem {
    display: grid;
    gap: 0.1rem;
    min-width: 10rem;
    padding: 0.65rem 0.85rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.72);
}

.accountShell__statusLabel {
    color: #6a7590;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.accountShell__eyebrow {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    background: rgba(1, 12, 128, 0.07);
    color: #010c80;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.accountShell__title {
    margin: 1rem 0 0.75rem;
    color: #08173f;
    font-size: clamp(2.2rem, 4vw, 3.8rem);
    line-height: 0.96;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.accountShell__description,
.accountShell__profileEmail {
    margin: 0;
    color: #4b5874;
    line-height: 1.75;
}

.accountShell__grid {
    display: grid;
    grid-template-columns: minmax(16rem, 19rem) minmax(0, 1fr);
    gap: 1.5rem;
    align-items: start;
}

.accountShell__sidebar,
.accountShell__content {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.accountShell__sidebar {
    position: sticky;
    top: 1.5rem;
    display: grid;
    gap: 1.25rem;
    padding: 1.2rem;
}

.accountShell__profileCard {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.9rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.2rem;
    background: rgba(247, 250, 255, 0.92);
}

.accountShell__avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 1rem;
    background: linear-gradient(145deg, rgba(1, 12, 128, 0.1), rgba(0, 128, 255, 0.08));
    color: #010c80;
}

.accountShell__profileName {
    margin: 0 0 0.2rem;
    color: #08173f;
    font-weight: 700;
}

.accountShell__nav {
    display: grid;
    gap: 0.5rem;
}

.accountShell__navLink {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 0.95rem;
    border-radius: 999px;
    color: #33415f;
    font-weight: 700;
    text-decoration: none;
    transition:
        background-color 0.2s ease,
        color 0.2s ease,
        transform 0.2s ease;
}

.accountShell__navLink:hover,
.accountShell__navLink--active {
    background: rgba(1, 12, 128, 0.08);
    color: #08173f;
    transform: translateX(2px);
}

.accountShell__content {
    padding: 1.35rem;
}

.accountShell__logoutBtn {
    margin-top: auto;
}

@media screen and (max-width: 1100px) {
    .accountShell__grid {
        grid-template-columns: 1fr;
    }

    .accountShell__sidebar {
        position: static;
    }
}

@media screen and (max-width: 700px) {
    .accountShell__container {
        padding-top: 3rem;
        padding-bottom: 2.5rem;
    }

    .accountShell__title {
        font-size: clamp(2rem, 9vw, 2.8rem);
        line-height: 1;
    }

    .accountShell__sidebar,
    .accountShell__content {
        border-radius: 1.2rem;
    }

    .accountShell__statusItem {
        width: 100%;
        min-width: 0;
    }
}

@media (prefers-reduced-motion: reduce) {
    .accountShell__navLink {
        transition: none;
    }
}
</style>
