<script setup lang="ts">
import AboutCta from "@/components/About/AboutCta.vue"
import LatestPosts from "@/components/About/LatestPosts.vue"
import MainBanner from "@/components/Banner/MainBanner.vue"
import BestSellers from "@/components/Products/BestSellers.vue"
import LatestProducts from "@/components/Products/LatestProducts.vue"

const route = useRoute()
const { siteName, absoluteUrl } = useSiteIdentity()

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
        <LatestProducts />
        <BestSellers />
        <LatestPosts />
    </section>
</template>
