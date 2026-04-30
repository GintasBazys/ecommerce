<script setup lang="ts">
import { type NuxtError, clearError } from "nuxt/app"
import { computed } from "vue"

import AppBreadcrumbs from "~/components/Shared/AppBreadcrumbs.vue"

const props = defineProps<{
    error: NuxtError
}>()

const statusCode = computed(() => props.error?.status || 500)
const message = computed(() => props.error?.statusText || "Internal error")
const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: "Error" }])
const quickLinks = [
    {
        title: "Back to homepage",
        description: "Return to the storefront homepage and continue browsing active collections.",
        to: "/"
    },
    {
        title: "Browse offers",
        description: "Jump into current promotions and featured product listings.",
        to: "/special-offers"
    }
] as const

useHead(() => ({
    title: `${statusCode.value} | Medusa Commerce`,
    meta: [
        {
            name: "description",
            content: "A storefront error occurred. Return to the homepage or continue browsing available catalog pages."
        }
    ]
}))

function backToHome() {
    clearError({ redirect: "/" })
}
</script>

<template>
    <main class="min-h-screen bg-linear-to-b from-blue-50 via-white to-slate-50">
        <div class="mx-auto w-full max-w-7xl px-4 pt-15 pb-12 sm:px-6 sm:pt-18 sm:pb-16 xl:pt-23 xl:pb-18">
            <div class="mx-auto max-w-6xl">
                <AppBreadcrumbs :items="breadcrumbItems" class="mb-4" />

                <div
                    class="shadow-panel rounded-panel overflow-hidden border border-white/80 bg-linear-to-b from-white to-slate-50 sm:rounded-4xl"
                >
                    <div class="grid gap-6 p-5 sm:p-7 lg:grid-cols-3 lg:gap-8 lg:p-9 xl:p-10">
                        <div class="max-w-3xl lg:col-span-2">
                            <span
                                class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                            >
                                Storefront error
                            </span>
                            <p class="mt-4 text-4xl leading-none font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                                {{ statusCode }}
                            </p>
                            <h1
                                class="mt-3 max-w-xl text-3xl leading-none font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-6xl"
                            >
                                Something went wrong while loading this page.
                            </h1>
                            <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                                {{ message }}. Return to the homepage, browse current offers, or retry the storefront from a safer entry
                                point.
                            </p>

                            <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <button type="button" class="ui-btn-accent min-h-12 px-6" @click="backToHome">Back to home</button>
                                <NuxtLink
                                    to="/special-offers"
                                    class="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300/80 bg-white px-6 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-hidden"
                                >
                                    Browse offers
                                </NuxtLink>
                            </div>
                        </div>

                        <div class="grid gap-4 self-start">
                            <div class="shadow-card rounded-3xl border border-slate-200/80 bg-white/80 p-5">
                                <p class="text-label-eyebrow tracking-label font-bold text-slate-500 uppercase">Error status</p>
                                <p class="mt-3 text-lg font-semibold tracking-tight text-slate-950">
                                    {{ statusCode }}
                                </p>
                                <p class="mt-2 text-sm leading-6 text-slate-600">
                                    {{ message }}
                                </p>
                            </div>

                            <div class="grid gap-3">
                                <NuxtLink
                                    v-for="link in quickLinks"
                                    :key="link.to"
                                    :to="link.to"
                                    class="rounded-3xl border border-slate-200/80 bg-white/85 p-4 transition hover:border-slate-300 hover:bg-white"
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
    </main>
</template>
