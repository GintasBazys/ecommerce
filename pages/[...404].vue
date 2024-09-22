<script setup lang="ts">
useHead({
    title: "404 | Ecommerce"
})
definePageMeta({
    layout: "account"
})

const handleError = () => clearError({ redirect: "/" })
</script>

<template>
    <section class="container-md max-w-520 my-5 py-5 text-center">
        <h1 class="mb-4">Sorry. The page you were looking for doesn't exist.</h1>
        <button class="btn btn-primary px-4" @click="handleError">Go to homepage</button>
    </section>
</template>
