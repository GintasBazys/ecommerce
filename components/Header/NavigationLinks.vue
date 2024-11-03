<script setup lang="ts">
import { useProductStore } from "~/stores/product"

const store = useProductStore()
const { categories } = storeToRefs(store)
</script>

<template v-slot:navigation-links>
    <div class="navbar-nav">
        <NuxtLink class="nav-link ps-lg-0 text-danger fw-bold" href="#">Special offers</NuxtLink>
        <template v-for="category in categories" :key="category.id">
            <NuxtLink :href="`${CATEGORY_HANDLE}/` + category.handle" class="nav-link">{{ category.name }}</NuxtLink>
        </template>
        <NuxtLink class="nav-link" href="/blog">Blog</NuxtLink>
        <NuxtLink class="nav-link" href="/about">About us</NuxtLink>
    </div>
</template>
