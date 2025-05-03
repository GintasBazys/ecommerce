<script setup lang="ts">
import { useCustomerStore } from "~/stores/customer"
import { useCartStore } from "~/stores/cartStore"
import { useProductStore } from "~/stores/product"
import type { CartResponse } from "~/stores/product"
import AppFooter from "~/components/Footer/AppFooter.vue"
import BaseHeader from "~/components/Header/BaseHeader.vue"

const customerStore = useCustomerStore()
const productStore = useProductStore()
const cartStore = useCartStore()

const runtimeConfig = useRuntimeConfig()

const { fetchRegion } = useRegionStore()

await fetchRegion()

const { data: categoriesData } = await useFetch("/api/categories", {
    credentials: "include",
    headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": runtimeConfig.public.PUBLISHABLE_KEY
    }
})
productStore.categories = categoriesData.value

const { data: customerData, error: customerError } = await useFetch<CustomerAuthResponseInterface>("/api/auth", {
    headers: useRequestHeaders(["cookie"])
})

if (!customerError.value) {
    customerStore.customer = customerData.value?.customer ?? null
} else {
    console.error("Error fetching customer data:", customerError.value)
}
customerStore.customer = customerData.value?.customer ?? null

const { data: cartData } = await useFetch<CartResponse>(`/api/cart?regionId=${useRegionStore().regionStoreId}`, {
    credentials: "include",
    headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": runtimeConfig.public.PUBLISHABLE_KEY
    }
})
if (cartData.value) {
    cartStore.cart = cartData.value.cart
}

if (customerStore.customer && !cartStore.cart?.customer_id) {
    await assignCustomerToCart(cartStore)
}

useCookie("cart_id", {
    default: () => cartStore.cart?.id
})

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
    <VApp>
        <BaseHeader />
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
        <AppFooter
    /></VApp>
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
html {
    font-family: "Archivo", sans-serif;
}
</style>
