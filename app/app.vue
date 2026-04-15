<script setup lang="ts">
import AppFooter from "@/components/Footer/AppFooter.vue"
import BaseHeader from "@/components/Header/BaseHeader.vue"

const { organizationSchema, websiteSchema } = useSiteIdentity()

useHead({
    link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,100..900;1,100..900&display=swap"
        },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
        { rel: "manifest", href: "/site.webmanifest" }
    ]
})

useStructuredData(() => [organizationSchema.value, websiteSchema.value], "global-structured-data")

const nuxtApp = useNuxtApp()

nuxtApp.hook("page:finish", () => {
    window.scrollTo(0, 0)
})
</script>

<template>
    <NuxtLoadingIndicator />
    <VApp>
        <BaseHeader />
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
        <AppFooter />
    </VApp>
</template>

<style lang="scss">
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

html,
body {
    overflow-x: hidden;
}

main {
    padding-top: var(--site-header-offset, 98px);
}
</style>
