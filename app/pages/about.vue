<script setup lang="ts">
import type { SchemaNode } from "~/composables/useStructuredData"

import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"
import NuxtImage from "~/components/Shared/NuxtImage.vue"

const route = useRoute()
const { absoluteUrl } = useSiteIdentity()

const breadcrumbItems = [{ label: "Home", to: "/" }, { label: "About" }]

const heroStats = [
    { value: "12+", label: "years curating online retail" },
    { value: "24/7", label: "secure shopping access" },
    { value: "Global", label: "delivery support network" }
]

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
    <div class="bg-linear-to-b from-slate-950 via-brand-900 to-white">
        <section class="relative isolate overflow-hidden text-white">
            <div class="absolute inset-0 -z-10 bg-linear-to-br from-accent-300/20 via-transparent to-brand-700/20"></div>
            <div class="absolute -top-24 -left-24 -z-10 h-80 w-80 rounded-full bg-accent-300/20 blur-3xl"></div>
            <div class="absolute top-10 right-12 -z-10 h-72 w-72 rounded-full bg-blue-300/15 blur-3xl"></div>

            <div class="mx-auto w-full max-w-7xl px-4 pt-12 pb-6 sm:px-6 sm:pt-14 lg:pt-16 lg:pb-8 xl:pt-18">
                <div class="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                    <div class="max-w-3xl">
                        <AppBreadcrumbs :items="breadcrumbItems" tone="inverse" class="mb-4" />
                        <span
                            class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-accent-300/30 bg-white/10 px-4 py-2 font-bold text-accent-100 uppercase backdrop-blur"
                        >
                            About Medusa Commerce
                        </span>

                        <h1 class="mt-5 max-w-3xl text-4xl leading-none font-bold tracking-tighter text-white sm:text-6xl xl:text-6xl">
                            Curated commerce with a quieter, more considered point of view.
                        </h1>

                        <p class="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                            We build a cleaner way to shop: fewer distractions, better product context, and dependable support from discovery to
                            delivery.
                        </p>

                        <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <NuxtLink to="/special-offers" class="ui-btn-accent min-w-44 px-7">Shop curated picks</NuxtLink>
                            <NuxtLink
                                to="/contact"
                                class="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-7 text-sm font-semibold text-white transition hover:border-accent-200 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-focus-inverse focus-visible:outline-hidden"
                            >
                                Contact support
                            </NuxtLink>
                        </div>

                        <div class="mt-9 grid gap-3 sm:grid-cols-3">
                            <article
                                v-for="stat in heroStats"
                                :key="stat.label"
                                class="rounded-3xl border border-white/12 bg-white/8 p-4 backdrop-blur"
                            >
                                <strong class="block text-2xl leading-none font-semibold text-accent-100 sm:text-3xl">{{ stat.value }}</strong>
                                <span class="mt-2 block text-sm leading-5 text-slate-200">{{ stat.label }}</span>
                            </article>
                        </div>
                    </div>

                    <div class="relative lg:pb-3">
                        <div class="absolute -top-5 -right-5 h-28 w-28 rounded-full bg-accent-300/20 blur-2xl"></div>
                        <div class="relative rounded-4xl border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur">
                            <NuxtImage
                                src="/images/about/about-premium.jpg"
                                alt="Premium living space with elegant furniture and warm styling"
                                width="900"
                                height="1080"
                                sizes="(max-width: 1023px) 92vw, 480px"
                                densities="x1"
                                format="webp"
                                quality="70"
                                class="aspect-square w-full rounded-3xl object-cover lg:aspect-4/3"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <AboutCta :extra-spacer-class="'pb-0'" />
        <AboutColumns />
    </div>
</template>
