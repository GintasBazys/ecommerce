<script setup lang="ts">
import { useProductStore } from "~/stores/product"

const store = useProductStore()
const { collections } = storeToRefs(store)
</script>

<template v-slot:navigation-links>
    <div class="navbar-nav">
        <NuxtLink class="nav-link ps-lg-0 text-danger fw-bold" href="#">Special offers</NuxtLink>
        <template v-for="collection in collections" :key="collection.id">
            <NuxtLink :href="'/collection/' + collection.handle" class="nav-link">{{ collection.title }}</NuxtLink>
        </template>
        <NuxtLink class="nav-link" href="/blog">Blog</NuxtLink>
        <NuxtLink class="nav-link" href="/about">About us</NuxtLink>
    </div>
</template>
