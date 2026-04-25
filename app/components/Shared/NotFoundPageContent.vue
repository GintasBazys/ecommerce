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
    <section
        class="min-h-[calc(100vh-98px)] bg-[radial-gradient(circle_at_top_left,rgba(1,12,128,0.07),transparent_24%),linear-gradient(180deg,#f7faff_0%,#ffffff_38%,#f6f9ff_100%)]"
    >
        <div class="mx-auto w-full max-w-7xl px-4 pt-15 pb-12 sm:px-6 sm:pt-18 sm:pb-16 xl:pt-23 xl:pb-18">
            <div class="mx-auto max-w-6xl">
                <AppBreadcrumbs :items="breadcrumbItems" class="mb-4" />

                <div
                    class="overflow-hidden rounded-[1.75rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-[0_18px_48px_rgba(8,27,90,0.08)] sm:rounded-[2rem]"
                >
                    <div class="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,24rem)] lg:gap-8 lg:p-9 xl:p-10">
                        <div class="max-w-3xl">
                            <span
                                class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                            >
                                Page not found
                            </span>
                            <h1
                                class="mt-4 max-w-[11ch] text-[2.25rem] leading-[0.96] font-bold tracking-[-0.06rem] text-slate-950 sm:text-[3rem] lg:text-[4.1rem]"
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

                        <div class="grid gap-4 self-start">
                            <div
                                class="rounded-[1.4rem] border border-slate-200/80 bg-white/80 p-5 shadow-[0_10px_26px_rgba(8,27,90,0.05)]"
                            >
                                <p class="text-label-eyebrow tracking-label font-bold text-slate-500 uppercase">Requested path</p>
                                <p class="mt-3 text-lg font-semibold tracking-[-0.03em] break-all text-slate-950">
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
    </section>
</template>
