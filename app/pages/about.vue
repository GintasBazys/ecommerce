<script setup lang="ts">
import type { SchemaNode } from "~/composables/useStructuredData"

import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"

const route = useRoute()
const { absoluteUrl } = useSiteIdentity()

const breadcrumbItems = [{ label: "Home", to: "/" }, { label: "About" }]

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
    <section class="bg-linear-to-b from-brand-50 via-white to-brand-50">
        <div class="px-0 pt-15 pb-4 sm:pt-18 md:pt-18 xl:pt-23">
            <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
                <div class="max-w-2xl">
                    <AppBreadcrumbs :items="breadcrumbItems" class="mb-4" />
                    <span
                        class="bg-brand-100 text-label-sm tracking-label text-brand-700 inline-flex min-h-9 items-center rounded-full px-4 py-2 font-bold uppercase"
                    >
                        About the store
                    </span>
                    <h1 class="mt-4 text-3xl leading-none font-bold tracking-tighter text-slate-950 sm:text-5xl xl:text-7xl">
                        Get the story behind the curated storefront experience.
                    </h1>
                    <p class="mt-4 text-base leading-7 text-slate-600">
                        Learn how the brand approaches product selection, delivery standards, and the overall experience behind the shop.
                    </p>
                </div>
            </div>
        </div>
        <AboutCta :extra-spacer-class="'pb-0'" />
        <AboutColumns />
    </section>
</template>
