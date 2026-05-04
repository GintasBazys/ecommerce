<script setup lang="ts">
import AboutCta from "@/components/About/AboutCta.vue"
import MainBanner from "@/components/Banner/MainBanner.vue"
import RenderOnVisible from "@/components/Shared/RenderOnVisible.vue"

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
        <RenderOnVisible contain-intrinsic-size="1px 620px">
            <DeferredLatestProducts />
        </RenderOnVisible>
        <RenderOnVisible contain-intrinsic-size="1px 620px">
            <DeferredBestSellers />
        </RenderOnVisible>
        <RenderOnVisible contain-intrinsic-size="1px 560px">
            <DeferredLatestPosts />
        </RenderOnVisible>
    </section>
</template>
