<script setup lang="ts">
import { ref } from "vue"
import { useRoute, useFetch, navigateTo } from "nuxt/app"

interface CollectionInterface {
    name: string
    metadata: { [x: string]: never }
    id: string
    handle: string
    title: string
    deleted_at: string | null
    created_at: string
    updated_at: string
}

const route = useRoute()
const collection = ref<CollectionInterface | null>(null)
const { data } = await useFetch<CollectionInterface>(`/api/${route.params.slug}`)
if (data.value && "error" in data.value) {
    await navigateTo("/page-not-found")
} else {
    collection.value = data.value || null
}
</script>

<template>
    <main>
        <section class="container mx-auto px-4">
            <h1 class="font-bold text-2xl whitespace-nowrap">
                {{ collection?.title }}
            </h1>
        </section>
    </main>
</template>
