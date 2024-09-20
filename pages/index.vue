<script setup lang="ts">
import MainBanner from "~/components/Banner/MainBanner.vue"
import AboutCta from "~/components/About/AboutCta.vue"
</script>

<template>
    <main>
        <MainBanner />
        <AboutCta :link-shown="true" />
    </main>
</template>
