<script setup lang="ts">
import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"

defineProps<{
    requestedPath: string
}>()

const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: "404" }])

const quickLinks = [
    {
        title: "Back to homepage",
        description: "Return to the main storefront and keep browsing current collections.",
        to: "/"
    },
    {
        title: "Browse offers",
        description: "Jump into active promotions and featured products available right now.",
        to: "/special-offers"
    }
] as const
</script>

<template>
    <section class="min-h-screen bg-linear-to-b from-brand-50 via-white to-brand-50">
        <div class="mx-auto w-full max-w-7xl px-4 pt-15 pb-12 sm:px-6 sm:pt-18 sm:pb-16 xl:pt-23 xl:pb-18">
            <div class="mx-auto max-w-6xl">
                <AppBreadcrumbs :items="breadcrumbItems" class="mb-4" />

                <div class="overflow-hidden rounded-panel border border-white/80 bg-linear-to-b from-white to-slate-50 shadow-panel sm:rounded-4xl">
                    <div class="grid gap-6 p-5 sm:p-7 lg:grid-cols-5 lg:gap-8 lg:p-9 xl:p-10">
                        <div class="max-w-3xl lg:col-span-3">
                            <span
                                class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                            >
                                Page not found
                            </span>
                            <h1
                                class="mt-4 max-w-md text-4xl leading-none font-bold tracking-tighter text-slate-950 sm:text-5xl lg:text-7xl"
                            >
                                This page is no longer available.
                            </h1>
                            <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                                We could not find
                                <strong class="font-semibold text-slate-950">{{ requestedPath }}</strong>
                                in the storefront. Return to the homepage or continue browsing live product pages and current offers.
                            </p>

                            <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <NuxtLink to="/" class="ui-btn-accent min-h-12 px-6"> Back to homepage </NuxtLink>
                                <NuxtLink
                                    to="/special-offers"
                                    class="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300/80 bg-white px-6 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-hidden"
                                >
                                    Browse offers
                                </NuxtLink>
                            </div>
                        </div>

                        <div class="grid gap-4 self-start lg:col-span-2">
                            <div
                                class="rounded-card border border-slate-200/80 bg-white/80 p-5 shadow-card"
                            >
                                <p class="text-label-eyebrow tracking-label font-bold text-slate-500 uppercase">Requested path</p>
                                <p class="mt-3 break-all text-lg font-semibold tracking-tighter text-slate-950">
                                    {{ requestedPath }}
                                </p>
                                <p class="mt-2 text-sm leading-6 text-slate-600">
                                    Check the URL for typos or continue through one of the storefront entry points below.
                                </p>
                            </div>

                            <div class="grid gap-3">
                                <NuxtLink
                                    v-for="link in quickLinks"
                                    :key="link.to"
                                    :to="link.to"
                                    class="rounded-card-sm border border-slate-200/80 bg-white/85 p-4 transition hover:border-slate-300 hover:bg-white"
                                >
                                    <p class="text-sm font-semibold text-slate-950">{{ link.title }}</p>
                                    <p class="mt-1 text-sm leading-6 text-slate-600">{{ link.description }}</p>
                                </NuxtLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
