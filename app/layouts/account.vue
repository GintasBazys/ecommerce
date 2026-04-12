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
    <main class="account-shell">
        <div class="account-shell__backdrop"></div>
        <VContainer class="account-shell__container">
            <header class="account-shell__hero">
                <div class="account-shell__meta-row">
                    <nav class="account-shell__breadcrumb" aria-label="Breadcrumb">
                        <template v-for="(item, index) in breadcrumbItems" :key="item.to">
                            <NuxtLink v-if="index < breadcrumbItems.length - 1" :to="item.to" class="account-shell__breadcrumb-link">
                                {{ item.label }}
                            </NuxtLink>
                            <span v-else class="account-shell__breadcrumb-current">{{ item.label }}</span>
                            <VIcon v-if="index < breadcrumbItems.length - 1" size="16" class="account-shell__breadcrumb-icon">
                                mdi-chevron-right
                            </VIcon>
                        </template>
                    </nav>
                    <div class="account-shell__status-strip">
                        <div v-for="item in accountStatus" :key="item.label" class="account-shell__status-item">
                            <span class="account-shell__status-label">{{ item.label }}</span>
                            <strong class="account-shell__status-value">{{ item.value }}</strong>
                        </div>
                    </div>
                </div>
                <div>
                    <span class="account-shell__eyebrow">{{ pageContent.eyebrow }}</span>
                    <h1 class="account-shell__title">{{ pageContent.title }}</h1>
                    <p class="account-shell__description">{{ pageContent.description }}</p>
                </div>
            </header>
            <div class="account-shell__grid">
                <aside class="account-shell__sidebar">
                    <div class="account-shell__profile-card">
                        <div class="account-shell__avatar">
                            <VIcon size="24">mdi-account-outline</VIcon>
                        </div>
                        <div>
                            <p class="account-shell__profile-name">
                                {{ customer?.first_name || "Account" }} {{ customer?.last_name || "Member" }}
                            </p>
                            <p class="account-shell__profile-email">{{ customer?.email || "Signed in customer" }}</p>
                        </div>
                    </div>
                    <nav class="account-shell__nav">
                        <NuxtLink
                            v-for="item in accountNav"
                            :key="item.to"
                            :to="item.to"
                            class="account-shell__nav-link"
                            :class="{ 'account-shell__nav-link--active': route.path === item.to || route.path.startsWith(`${item.to}/`) }"
                        >
                            <VIcon size="18">{{ item.icon }}</VIcon>
                            <span>{{ item.label }}</span>
                        </NuxtLink>
                    </nav>
                    <VBtn color="primary" rounded="pill" class="account-shell__logout-btn text-none" block @click="handleLogout">
                        Log out
                    </VBtn>
                </aside>
                <main class="account-shell__content">
                    <slot></slot>
                </main>
            </div>
        </VContainer>
    </main>
</template>

<style scoped lang="scss">
.account-shell {
    position: relative;
    min-height: 100vh;
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.account-shell__backdrop {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(circle at top right, rgba(0, 128, 255, 0.1), transparent 24%),
        radial-gradient(circle at bottom left, rgba(1, 12, 128, 0.06), transparent 28%);
    pointer-events: none;
}

.account-shell__container {
    position: relative;
    z-index: 1;
    padding-top: 4.5rem;
    padding-bottom: 4rem;
}

.account-shell__hero {
    max-width: 48rem;
    margin-bottom: 1.8rem;
}

.account-shell__meta-row {
    display: grid;
    gap: 1rem;
    margin-bottom: 1.1rem;
}

.account-shell__breadcrumb,
.account-shell__status-strip {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.45rem;
}

.account-shell__breadcrumb {
    color: #6a7590;
    font-size: 0.92rem;
}

.account-shell__breadcrumb-link,
.account-shell__breadcrumb-current {
    text-decoration: none;
}

.account-shell__breadcrumb-link {
    color: #4b5874;
}

.account-shell__breadcrumb-current,
.account-shell__status-value {
    color: #08173f;
    font-weight: 700;
}

.account-shell__breadcrumb-icon {
    color: #9aa4bd;
}

.account-shell__status-strip {
    gap: 0.75rem;
}

.account-shell__status-item {
    display: grid;
    gap: 0.1rem;
    min-width: 10rem;
    padding: 0.65rem 0.85rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.72);
}

.account-shell__status-label {
    color: #6a7590;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.account-shell__eyebrow {
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

.account-shell__title {
    margin: 1rem 0 0.75rem;
    color: #08173f;
    font-size: 3.4rem;
    line-height: 0.96;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.account-shell__description,
.account-shell__profile-email {
    margin: 0;
    color: #4b5874;
    line-height: 1.75;
}

.account-shell__grid {
    display: grid;
    grid-template-columns: minmax(16rem, 19rem) minmax(0, 1fr);
    gap: 1.5rem;
    align-items: start;
}

.account-shell__sidebar,
.account-shell__content {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.account-shell__sidebar {
    position: sticky;
    top: 1.5rem;
    display: grid;
    gap: 1.25rem;
    padding: 1.2rem;
}

.account-shell__profile-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.9rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.2rem;
    background: rgba(247, 250, 255, 0.92);
}

.account-shell__avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 1rem;
    background: linear-gradient(145deg, rgba(1, 12, 128, 0.1), rgba(0, 128, 255, 0.08));
    color: #010c80;
}

.account-shell__profile-name {
    margin: 0 0 0.2rem;
    color: #08173f;
    font-weight: 700;
}

.account-shell__nav {
    display: grid;
    gap: 0.5rem;
}

.account-shell__nav-link {
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

.account-shell__nav-link:hover,
.account-shell__nav-link--active {
    background: rgba(1, 12, 128, 0.08);
    color: #08173f;
    transform: translateX(2px);
}

.account-shell__content {
    padding: 1.35rem;
}

.account-shell__logout-btn {
    margin-top: auto;
}

@media screen and (max-width: 1100px) {
    .account-shell__grid {
        grid-template-columns: 1fr;
    }

    .account-shell__sidebar {
        position: static;
    }
}

@media screen and (max-width: 700px) {
    .account-shell__container {
        padding-top: 3rem;
        padding-bottom: 2.5rem;
    }

    .account-shell__title {
        font-size: 2.5rem;
        line-height: 1;
    }

    .account-shell__sidebar,
    .account-shell__content {
        border-radius: 1.2rem;
    }

    .account-shell__status-item {
        width: 100%;
        min-width: 0;
    }
}

@media (prefers-reduced-motion: reduce) {
    .account-shell__nav-link {
        transition: none;
    }
}
</style>
