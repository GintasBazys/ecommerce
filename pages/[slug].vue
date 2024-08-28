<script setup lang="ts">
interface CollectionInterface {
    title: string
    metadata: { [x: string]: never }
    id: string
    handle: string
    deleted_at: string | null
    created_at: string
    updated_at: string
}

const route = useRoute()
const { data: collection } = await useFetch<CollectionInterface>(`/api/${route.params.slug}`)
if (!collection.value) {
    throw createError({
        fatal: true,
        statusCode: 404
    })
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
