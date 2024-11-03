<script setup lang="ts">
import { useCustomerStore } from "~/stores/customer"
import { useCartStore } from "~/stores/cartStore.js"
import AppHeader from "~/components/Header/AppHeader.vue"
import AppFooter from "~/components/Footer/AppFooter.vue"
import BaseHeader from "~/components/Header/BaseHeader.vue"
import NavigationLinks from "~/components/Header/NavigationLinks.vue"

const customerStore = useCustomerStore()
const cartStore = useCartStore()
const cartIdCookie = useCookie("cart_id")

const { data: customerData } = await useFetch<CustomerAuthResponseInterface>("/api/auth", {
    credentials: "include",
    headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": useRuntimeConfig().public.PUBLISHABLE_KEY
    }
})

const { data: cartData } = await useFetch<CartResponse>("/api/cart")

if (customerData.value?.customer) {
    customerStore.customer = customerData.value.customer
}

if (cartData.value?.cart) {
    cartStore.cart = cartData.value.cart
    if (cartData.value.cart.id && !cartIdCookie.value) {
        cartIdCookie.value = cartData.value.cart.id
    }
}

useHead({
    link: [
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
        { rel: "manifest", href: "/site.webmanifest" }
    ]
})
</script>

<template>
    <NuxtLoadingIndicator />
    <BaseHeader>
        <HeaderBanner />
        <AppHeader>
            <template #header-icons>
                <HeaderIcons />
            </template>
            <template #navigation-links>
                <NavigationLinks />
            </template>
        </AppHeader>
    </BaseHeader>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
    <AppFooter />
</template>

<!--suppress CssUnusedSymbol -->
<style>
.page-enter-active,
.page-leave-active {
    transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
    opacity: 0;
    filter: blur(1rem);
}
</style>
