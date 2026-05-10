<script setup lang="ts">
import BaseButton from "~/components/Shared/BaseButton.vue"
import { PRODUCT_URL_HANDLE } from "~/utils/consts"

defineProps<{
    status: "loading" | "error" | "not-found"
}>()

const emit = defineEmits<{
    retry: []
}>()
</script>

<template>
    <main v-if="status === 'loading'" class="bg-slate-50 px-4 pt-28 pb-16 sm:px-6 sm:pt-32">
        <div class="mx-auto grid w-full max-w-7xl gap-6 xl:grid-cols-2">
            <div class="aspect-square animate-pulse rounded-panel bg-slate-200"></div>
            <div class="grid content-start gap-4 rounded-panel border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div class="h-8 w-2/3 animate-pulse rounded bg-slate-200"></div>
                <div class="h-5 w-1/2 animate-pulse rounded bg-slate-200"></div>
                <div class="h-24 animate-pulse rounded-2xl bg-slate-200"></div>
                <div class="h-12 w-44 animate-pulse rounded-full bg-slate-200"></div>
            </div>
        </div>
    </main>

    <main v-else-if="status === 'error'" class="bg-slate-50 px-4 pt-28 pb-16 sm:px-6 sm:pt-32">
        <div class="mx-auto grid max-w-2xl justify-items-center gap-4 rounded-panel border border-rose-200 bg-rose-50 px-6 py-10 text-center shadow-panel" role="alert">
            <h1 class="text-3xl font-bold tracking-tight text-slate-950">Product could not be loaded.</h1>
            <p class="text-sm leading-6 text-rose-700">Please try again. If the issue continues, return to the catalog and choose another product.</p>
            <div class="flex flex-wrap justify-center gap-3">
                <BaseButton type="button" variant="accent" @click="emit('retry')">Try again</BaseButton>
                <NuxtLink :to="PRODUCT_URL_HANDLE" class="ui-btn-secondary min-h-12 px-5">Browse products</NuxtLink>
            </div>
        </div>
    </main>

    <main v-else class="bg-slate-50 px-4 pt-28 pb-16 sm:px-6 sm:pt-32">
        <div class="mx-auto grid max-w-2xl justify-items-center gap-4 rounded-panel border border-slate-200 bg-white px-6 py-10 text-center shadow-panel">
            <h1 class="text-3xl font-bold tracking-tight text-slate-950">Product not found.</h1>
            <p class="text-sm leading-6 text-slate-600">This product may no longer be available. Browse the catalog to find similar products.</p>
            <NuxtLink :to="PRODUCT_URL_HANDLE" class="ui-btn-accent min-h-12 px-5">Browse products</NuxtLink>
        </div>
    </main>
</template>
