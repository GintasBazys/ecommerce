<script setup lang="ts">
import { useProductStore } from "~/stores/product"
const store = useProductStore()
</script>

<template>
    <section class="container my-12 mx-auto px-4">
        <div v-for="product in store.products" :key="product.id">
            <ProductCard :product="product" />
        </div>
        <h1>Home page</h1>
        <NuxtLink to="/about">About page</NuxtLink>
    </section>
</template>
