<script setup lang="ts">
import MainBanner from "~/components/Banner/MainBanner.vue"
import AboutCta from "~/components/About/AboutCta.vue"
import BestSellers from "~/components/Products/BestSellers.vue"

useHead({
    title: "Shop | Ecommerce"
})
</script>

<template>
    <section>
        <MainBanner />
        <AboutCta :link-shown="true" />
        <BestSellers />
    </section>
</template>
