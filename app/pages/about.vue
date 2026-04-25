<script setup lang="ts">
import type { SchemaNode } from "~/composables/useStructuredData"

import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"

const route = useRoute()
const { absoluteUrl } = useSiteIdentity()

const breadcrumbItems = [{ label: "Home", to: "/" }, { label: "About" }]

useHead({
    title: "About | Ecommerce"
})

useSeoMeta({
    description:
        "Learn how Ecommerce curates products, supports customers, and builds a calmer shopping experience from discovery to delivery."
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
    <section
        class="bg-[radial-gradient(circle_at_top_left,rgba(1,12,128,0.08),transparent_24%),linear-gradient(180deg,#f7faff_0%,#ffffff_36%,#f6f9ff_100%)]"
    >
        <div class="px-0 pt-[3.75rem] pb-4 sm:pt-[4.5rem] md:pt-[4.5rem] xl:pt-[5.75rem]">
            <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
                <div class="max-w-[42rem]">
                    <AppBreadcrumbs :items="breadcrumbItems" class="mb-4" />
                    <span
                        class="bg-brand-100 text-label-sm tracking-label text-brand-700 inline-flex min-h-9 items-center rounded-full px-4 py-2 font-bold uppercase"
                    >
                        About the store
                    </span>
                    <h1
                        class="mt-4 text-[2rem] leading-[1] font-bold tracking-[-0.06rem] text-slate-950 sm:text-[2.75rem] sm:leading-[0.98] xl:text-[4.25rem] xl:leading-[0.96]"
                    >
                        Get the story behind the curated storefront experience.
                    </h1>
                    <p class="mt-4 text-base leading-7 text-slate-600">
                        Learn how the brand approaches product selection, delivery standards, and the overall experience behind the shop.
                    </p>
                </div>
            </div>
        </div>
        <AboutCta :extra-spacer-class="'pb-0'" />
        <AboutCards />
        <AboutColumns />
    </section>
</template>
