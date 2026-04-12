<script setup lang="ts">
definePageMeta({
    layout: "account",
    middleware: ["auth"]
})

useHead({ title: "Account | Ecommerce" })

const { customer } = storeToRefs(useCustomerStore())

const accountLinks = [
    {
        title: "Profile",
        description: "Update your personal and company information.",
        icon: "mdi-account-circle-outline",
        to: "/account/profile"
    },
    {
        title: "Addresses",
        description: "Manage saved billing and delivery locations.",
        icon: "mdi-map-marker-outline",
        to: "/account/address"
    },
    {
        title: "Orders",
        description: "Browse previous purchases and reopen order details.",
        icon: "mdi-bag-personal-outline",
        to: "/account/orders"
    }
]
</script>

<template>
    <div class="account-dashboard-content">
        <section class="account-dashboard-content__welcome-card">
            <span class="account-dashboard-content__eyebrow">Welcome back</span>
            <h2 class="account-dashboard-content__title">{{ customer?.first_name || "Account" }}, here is your quick account overview.</h2>
            <p class="account-dashboard-content__text">Open the section you need and manage it from the shared account workspace.</p>
        </section>
        <section class="account-dashboard-content__grid">
            <NuxtLink v-for="link in accountLinks" :key="link.to" :to="link.to" class="account-dashboard-content__card-link">
                <article class="account-dashboard-content__card">
                    <div class="account-dashboard-content__icon">
                        <VIcon size="24">{{ link.icon }}</VIcon>
                    </div>
                    <h3 class="account-dashboard-content__card-title">{{ link.title }}</h3>
                    <p class="account-dashboard-content__card-text">{{ link.description }}</p>
                </article>
            </NuxtLink>
        </section>
    </div>
</template>

<style scoped lang="scss">
.account-dashboard-content {
    display: grid;
    gap: 1.25rem;
}

.account-dashboard-content__welcome-card,
.account-dashboard-content__card {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.4rem;
    background: rgba(247, 250, 255, 0.92);
}

.account-dashboard-content__welcome-card {
    padding: 1.35rem;
}

.account-dashboard-content__eyebrow {
    display: inline-flex;
    align-items: center;
    min-height: 2rem;
    padding: 0.4rem 0.85rem;
    border-radius: 999px;
    background: rgba(1, 12, 128, 0.07);
    color: #010c80;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.account-dashboard-content__title,
.account-dashboard-content__card-title {
    color: #08173f;
}

.account-dashboard-content__title {
    margin: 0.9rem 0 0.6rem;
    font-size: 2rem;
    line-height: 1.1;
}

.account-dashboard-content__text,
.account-dashboard-content__card-text {
    margin: 0;
    color: #4b5874;
    line-height: 1.7;
}

.account-dashboard-content__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
}

.account-dashboard-content__card-link {
    color: inherit;
    text-decoration: none;
}

.account-dashboard-content__card {
    display: grid;
    gap: 0.85rem;
    height: 100%;
    padding: 1.2rem;
}

.account-dashboard-content__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 1rem;
    background: linear-gradient(145deg, rgba(1, 12, 128, 0.1), rgba(0, 128, 255, 0.08));
    color: #010c80;
}

.account-dashboard-content__card-title {
    margin: 0;
    font-size: 1.1rem;
}

@media screen and (max-width: 1024px) {
    .account-dashboard-content__title {
        font-size: 1.75rem;
    }
}

@media screen and (max-width: 900px) {
    .account-dashboard-content__title {
        font-size: 1.55rem;
    }

    .account-dashboard-content__grid {
        grid-template-columns: 1fr;
    }
}
</style>
