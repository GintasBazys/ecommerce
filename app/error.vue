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
    title: `${statusCode.value} | Ecommerce`,
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
    <main
        class="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(1,12,128,0.07),transparent_24%),linear-gradient(180deg,#f7faff_0%,#ffffff_38%,#f6f9ff_100%)]"
    >
        <div class="mx-auto w-full max-w-7xl px-4 pt-15 pb-12 sm:px-6 sm:pt-18 sm:pb-16 xl:pt-23 xl:pb-18">
            <div class="mx-auto max-w-6xl">
                <AppBreadcrumbs :items="breadcrumbItems" class="mb-4" />

                <div
                    class="shadow-panel overflow-hidden rounded-panel border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] sm:rounded-4xl"
                >
                    <div class="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,24rem)] lg:gap-8 lg:p-9 xl:p-10">
                        <div class="max-w-3xl">
                            <span
                                class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                            >
                                Storefront error
                            </span>
                            <p class="mt-4 text-4xl leading-none font-bold tracking-[-0.06rem] text-slate-950 sm:text-5xl lg:text-6xl">
                                {{ statusCode }}
                            </p>
                            <h1
                                class="mt-3 max-w-[12ch] text-[2rem] leading-[0.96] font-bold tracking-[-0.06rem] text-slate-950 sm:text-[2.7rem] lg:text-[3.7rem]"
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
                            <div
                                class="rounded-[1.4rem] border border-slate-200/80 bg-white/80 p-5 shadow-card"
                            >
                                <p class="text-label-eyebrow tracking-label font-bold text-slate-500 uppercase">Error status</p>
                                <p class="mt-3 text-lg font-semibold tracking-[-0.03em] text-slate-950">
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
                                    class="rounded-[1.25rem] border border-slate-200/80 bg-white/85 p-4 transition hover:border-slate-300 hover:bg-white"
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
