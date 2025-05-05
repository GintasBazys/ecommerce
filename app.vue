<script setup lang="ts">
import AppFooter from "@/components/Footer/AppFooter.vue"
import BaseHeader from "@/components/Header/BaseHeader.vue"

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
    scroll-behavior: smooth;
}
</style>
