<script setup lang="ts">
import NotFoundPageContent from "~/components/Shared/NotFoundPageContent.vue"

const route = useRoute()
const event = useRequestEvent()

if (event) {
    setResponseStatus(event, 404)
}

useHead({
    title: "404 | Ecommerce",
    meta: [
        {
            name: "description",
            content: "The requested page could not be found. Continue browsing current products and active storefront pages."
        }
    ]
})
</script>

<template>
    <NotFoundPageContent :requested-path="route.path" />
</template>
