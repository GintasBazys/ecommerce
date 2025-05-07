<script setup lang="ts">
import MainBanner from "@/components/Banner/MainBanner.vue"
import AboutCta from "@/components/About/AboutCta.vue"
import BestSellers from "@/components/Products/BestSellers.vue"
import LatestProducts from "@/components/Products/LatestProducts.vue"
import LatestPosts from "@/components/About/LatestPosts.vue"

useHead({
    title: "Shop | Ecommerce"
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
