<script setup lang="ts">
import AppHeader from "~/components/Header/AppHeader.vue"
import AppFooter from "~/components/Footer/AppFooter.vue"
import { type CollectionResponse, useProductStore } from "~/stores/product"
import BaseHeader from "~/components/Header/BaseHeader.vue"
import NavigationLinks from "~/components/Header/NavigationLinks.vue"

const store = useProductStore()
const { data } = await useFetch<CollectionResponse>("/api/collections")
if (data.value) {
    store.collections = data.value["collections"]
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
