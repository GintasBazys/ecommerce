<script setup lang="ts">
import AppFooter from "@/components/Footer/AppFooter.vue"
import BaseHeader from "@/components/Header/BaseHeader.vue"
import CookieBanner from "@/components/Shared/CookieBanner.vue"

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
</script>

<template>
    <NuxtLoadingIndicator />
    <BaseHeader />
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
    <CookieBanner />
    <AppFooter />
</template>

<style lang="scss">
html {
    font-family: "Archivo", sans-serif;
    scrollbar-gutter: stable;
    scrollbar-width: thin;
    scrollbar-color: rgba(120, 53, 15, 0.78) rgba(241, 245, 249, 0.96);
}

html,
body {
    overflow-x: hidden;
}

main {
    padding-top: var(--site-header-offset, 98px);
}

button {
    cursor: pointer;
}

@media screen and (-webkit-min-device-pixel-ratio: 0) {
    select,
    textarea,
    input {
        font-size: 16px;
    }
}

html::-webkit-scrollbar {
    width: 0.9rem;
}

html::-webkit-scrollbar-track {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(241, 245, 249, 0.98));
    box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.14);
}

html::-webkit-scrollbar-thumb {
    border: 2px solid rgba(255, 255, 255, 0.92);
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(180, 132, 48, 0.95), rgba(120, 53, 15, 0.92));
    box-shadow: 0 4px 12px rgba(120, 53, 15, 0.18);
}

html::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgba(202, 138, 4, 0.95), rgba(120, 53, 15, 0.96));
}
</style>
