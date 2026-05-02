<script setup lang="ts">
import BaseHeader from "@/components/Header/BaseHeader.vue"

const { organizationSchema, websiteSchema } = useSiteIdentity()
const LazyAppFooter = defineAsyncComponent(() => import("@/components/Footer/AppFooter.vue"))
const LazyCookieBanner = defineAsyncComponent(() => import("@/components/Shared/CookieBanner.vue"))
const LazyAppSnackbar = defineAsyncComponent(() => import("@/components/Shared/AppSnackbar.vue"))
const archivoFontHref = "https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,100..900;1,100..900&display=swap"
const appShellInlineCss = `html{font-family:Archivo,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;scrollbar-color:rgba(120,53,15,.78) rgba(241,245,249,.96);scrollbar-gutter:stable;scrollbar-width:thin}main{padding-top:var(--site-header-offset,64px)}button{cursor:pointer}@media screen and (-webkit-min-device-pixel-ratio:0){input,select,textarea{font-size:16px}}html::-webkit-scrollbar{width:.9rem}html::-webkit-scrollbar-track{background:linear-gradient(180deg,#ffffffeb,#f1f5f9fa);box-shadow:inset 0 0 0 1px #94a3b824}html::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#b48430f2,#78350feb);border:2px solid hsla(0,0%,100%,.92);border-radius:999px;box-shadow:0 4px 12px #78350f2e}html::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,#ca8a04f2,#78350ff5)}`

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
    noscript: [{ textContent: `<link rel="stylesheet" href="${archivoFontHref}">` }],
    style: [{ key: "app-shell-inline-css", textContent: appShellInlineCss }]
})

useStructuredData(() => [organizationSchema.value, websiteSchema.value], "global-structured-data")
</script>

<template>
    <BaseHeader />
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
    <LazyCookieBanner />
    <LazyAppSnackbar />
    <LazyAppFooter />
</template>
