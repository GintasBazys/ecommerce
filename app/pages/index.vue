<script setup lang="ts">
import AboutCta from "@/components/About/AboutCta.vue"
import MainBanner from "@/components/Banner/MainBanner.vue"

const route = useRoute()
const { siteName, absoluteUrl } = useSiteIdentity()
const DeferredLatestPosts = defineAsyncComponent(() => import("@/components/About/LatestPosts.vue"))
const DeferredLatestProducts = defineAsyncComponent(() => import("@/components/Products/LatestProducts.vue"))
const DeferredBestSellers = defineAsyncComponent(() => import("@/components/Products/BestSellers.vue"))

useHead({
    title: "Shop | Medusa Commerce"
})

useStructuredData(
    () => [
        {
            "@type": "WebPage",
            "@id": `${absoluteUrl(route.path)}#webpage`,
            name: `${siteName.value} Shop`,
            description: "Browse the latest products, best sellers, and editorial picks across the store.",
            url: absoluteUrl(route.path),
            isPartOf: {
                "@id": `${absoluteUrl()}/#website`
            }
        },
        createBreadcrumbSchema(
            [
                { name: "Home", path: "/" },
                { name: "Shop", path: route.path }
            ],
            absoluteUrl
        )
    ],
    "home-structured-data"
)
</script>

<template>
    <section>
        <MainBanner />
        <AboutCta :link-shown="true" :extra-spacer-class="'pb-0'" />
        <DeferredLatestProducts />
        <DeferredBestSellers />
        <DeferredLatestPosts />
    </section>
</template>
