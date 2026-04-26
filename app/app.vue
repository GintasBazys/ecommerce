<script setup lang="ts">
import BaseHeader from "@/components/Header/BaseHeader.vue"

const { organizationSchema, websiteSchema } = useSiteIdentity()
const LazyAppFooter = defineAsyncComponent(() => import("@/components/Footer/AppFooter.vue"))
const LazyCookieBanner = defineAsyncComponent(() => import("@/components/Shared/CookieBanner.vue"))
const archivoFontHref = "https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,100..900;1,100..900&display=swap"
const showDeferredChrome = ref(false)

onMounted(() => {
    const revealDeferredChrome = () => {
        showDeferredChrome.value = true
    }

    const requestIdleCallback = window.requestIdleCallback

    if (typeof requestIdleCallback === "function") {
        requestIdleCallback(revealDeferredChrome)
        return
    }

    window.setTimeout(revealDeferredChrome, 1200)
})

useHead({
    link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
            rel: "stylesheet",
            href: archivoFontHref,
            media: "print",
            onload: "this.media='all'"
        },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
        { rel: "manifest", href: "/site.webmanifest" }
    ],
    noscript: [{ textContent: `<link rel="stylesheet" href="${archivoFontHref}">` }]
})

useStructuredData(() => [organizationSchema.value, websiteSchema.value], "global-structured-data")
</script>

<template>
    <NuxtLoadingIndicator />
    <BaseHeader />
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
    <LazyCookieBanner v-if="showDeferredChrome" />
    <LazyAppFooter v-if="showDeferredChrome" />
</template>

<style lang="scss">
html {
    font-family: "Archivo", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    scrollbar-gutter: stable;
    scrollbar-width: thin;
    scrollbar-color: rgba(120, 53, 15, 0.78) rgba(241, 245, 249, 0.96);
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
