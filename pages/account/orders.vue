<script setup lang="ts">
definePageMeta({
    layout: "account",
    middleware: ["auth"]
})

useHead({
    title: "Orders | Ecommerce"
})
</script>

<template>
    <section class="spacer">
        <div class="container">
            <h1>Orders</h1>
        </div>
    </section>
</template>
