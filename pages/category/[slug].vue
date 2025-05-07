<script setup lang="ts">
definePageMeta({
    layout: "default"
})

interface CategoryInterface {
    category: string
    metadata: { [x: string]: never }
    id: string
    handle: string
    name: string
}

const route = useRoute()
const category = ref<CategoryInterface | null>(null)
const { data } = await useFetch<CategoryInterface>(`/api/categories/${route.params.slug}`)
if (data.value && "error" in data.value) {
    await navigateTo("/page-not-found")
} else {
    category.value = data.value || null
}

useHead({
    title: `${category.value?.name} | Ecommerce`
})
</script>

<template>
    <section class="spacer">
        <section class="container mx-auto px-4">
            <h1 class="font-bold text-2xl whitespace-nowrap">
                {{ category?.name }}
            </h1>
        </section>
    </section>
</template>
