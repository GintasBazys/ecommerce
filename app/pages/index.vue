<script setup lang="ts">
import MainBanner from "@/components/Banner/MainBanner.vue"
import AboutCta from "@/components/About/AboutCta.vue"
import BestSellers from "@/components/Products/BestSellers.vue"
import LatestProducts from "@/components/Products/LatestProducts.vue"
import LatestPosts from "@/components/About/LatestPosts.vue"

useHead({
    title: "Shop | Ecommerce",
    script: [
        {
            type: "application/ld+json",
            innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebPage",
                name: "Shop | Ecommerce",
                description: "Welcome to our shop. Explore our latest and best-selling products.",
                url: "https://yourdomain.com/",
                publisher: {
                    "@type": "Organization",
                    name: "Your Brand Name",
                    logo: {
                        "@type": "ImageObject",
                        url: "https://yourdomain.com/logo.png"
                    }
                }
            }),
            tagPosition: "head",
            key: "schema-org"
        }
    ]
})
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
