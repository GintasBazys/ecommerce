<script setup lang="ts">
import { createBreadcrumbSchema, type SchemaNode, useSiteIdentity, useStructuredData } from "~/composables/shared/useStructuredData"

const route = useRoute()
const { absoluteUrl } = useSiteIdentity()

useHead({
    title: "About | Medusa Commerce"
})

useSeoMeta({
    description:
        "Learn how Medusa Commerce curates products, supports customers, and builds a calmer shopping experience from discovery to delivery."
})

const breadcrumbSchema = computed<SchemaNode>(() =>
    createBreadcrumbSchema(
        [
            { name: "Home", path: "/" },
            { name: "About", path: route.path }
        ],
        absoluteUrl
    )
)

useStructuredData(() => [breadcrumbSchema.value], "about-structured-data")
</script>

<template>
    <NuxtIsland name="AboutPageContent" />
</template>
