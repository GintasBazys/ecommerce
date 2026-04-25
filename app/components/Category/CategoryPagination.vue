<script setup lang="ts">
import type { LocationQueryRaw } from "vue-router"

const props = defineProps<{
    currentPage: number
    totalPages: number
    paginationItems: (number | string)[]
    paginationLabel: string
    buildPageLink: (_page: number) => { query: LocationQueryRaw }
}>()
</script>

<template>
    <nav v-if="props.totalPages > 1" class="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Category pagination">
        <NuxtLink
            v-if="props.currentPage > 1"
            :to="props.buildPageLink(props.currentPage - 1)"
            class="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-[0_8px_20px_rgba(8,27,90,0.04)] transition hover:border-slate-300 hover:bg-slate-50"
        >
            Previous
        </NuxtLink>
        <span
            v-else
            class="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-400"
        >
            Previous
        </span>

        <template v-for="item in props.paginationItems" :key="String(item)">
            <span
                v-if="typeof item === 'string'"
                class="inline-flex min-h-11 min-w-11 items-center justify-center px-1 text-sm font-semibold text-slate-500"
                aria-hidden="true"
            >
                ...
            </span>
            <NuxtLink
                v-else-if="item !== props.currentPage"
                :to="props.buildPageLink(item)"
                class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-[0_8px_20px_rgba(8,27,90,0.04)] transition hover:border-slate-300 hover:bg-slate-50"
            >
                {{ item }}
            </NuxtLink>
            <span
                v-else
                aria-current="page"
                class="border-brand-700 bg-brand-700 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(8,27,90,0.08)]"
            >
                {{ item }}
            </span>
        </template>

        <NuxtLink
            v-if="props.currentPage < props.totalPages"
            :to="props.buildPageLink(props.currentPage + 1)"
            class="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-[0_8px_20px_rgba(8,27,90,0.04)] transition hover:border-slate-300 hover:bg-slate-50"
        >
            Next
        </NuxtLink>
        <span
            v-else
            class="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-400"
        >
            Next
        </span>

        <span class="w-full text-center text-sm text-slate-600">{{ props.paginationLabel }}</span>
    </nav>
</template>
