<script setup lang="ts">
import NotFoundPageContent from "~/components/Shared/NotFoundPageContent.vue"

const route = useRoute()
const event = useRequestEvent()

const requestedPath = computed(() => {
    const source = route.query.from
    return typeof source === "string" && source.trim() ? source : route.path
})

if (event) {
    setResponseStatus(event, 404)
}

useHead({
    title: "404 | Medusa Commerce",
    meta: [
        {
            name: "description",
            content: "The requested page could not be found. Continue browsing current products and active storefront pages."
        }
    ]
})
</script>

<template>
    <NotFoundPageContent :requested-path="requestedPath" />
</template>
