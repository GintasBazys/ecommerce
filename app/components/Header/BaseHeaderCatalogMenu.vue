<script setup lang="ts">
import type { NavigationCategory } from "~/types/navigation"

import BaseButton from "~/components/Shared/BaseButton.vue"
import NuxtImage from "~/components/Shared/NuxtImage.vue"

type HeaderCategory = NavigationCategory & {
    imageUrl?: string | null
}

const props = defineProps<{
    open: boolean
    categories: HeaderCategory[]
}>()

const emit = defineEmits<{
    "update:open": [value: boolean]
}>()

const catalogMenuRef = ref<HTMLElement | null>(null)

function toggleCatalogMenu(): void {
    emit("update:open", !props.open)
}

function closeCatalogMenu(): void {
    emit("update:open", false)
}

function onDocumentPointerDown(event: PointerEvent): void {
    if (!props.open || !catalogMenuRef.value || !(event.target instanceof Node)) {
        return
    }

    if (!catalogMenuRef.value.contains(event.target)) {
        closeCatalogMenu()
    }
}

function onCatalogKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
        closeCatalogMenu()
    }
}

onMounted(() => {
    document.addEventListener("pointerdown", onDocumentPointerDown)
})

onBeforeUnmount(() => {
    document.removeEventListener("pointerdown", onDocumentPointerDown)
})
</script>

<template>
    <div ref="catalogMenuRef" class="relative" @keydown="onCatalogKeydown">
        <BaseButton
            type="button"
            class="group inline-flex items-center gap-1.5 text-base font-semibold text-slate-700 transition hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
            :aria-expanded="open"
            aria-controls="catalog-menu"
            @click="toggleCatalogMenu"
        >
            Catalog
            <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                class="h-4 w-4 transition-transform duration-200"
                :class="open ? 'rotate-180' : ''"
                aria-hidden="true"
            >
                <path
                    fill-rule="evenodd"
                    d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                    clip-rule="evenodd"
                />
            </svg>
        </BaseButton>

        <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="translate-y-2 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="translate-y-2 opacity-0"
        >
            <div
                v-if="open"
                id="catalog-menu"
                class="absolute top-full left-1/2 mt-5 w-screen max-w-5xl -translate-x-1/2 overflow-hidden rounded-4xl border border-white/70 bg-white/96 p-5 shadow-2xl ring-1 ring-slate-900/5 backdrop-blur-xl"
            >
                <div class="mb-4 flex items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
                    <div>
                        <p class="text-label-xs tracking-label font-bold text-amber-800 uppercase">Catalog</p>
                        <h2 class="mt-1 text-xl font-semibold tracking-tight text-slate-950">Shop by category</h2>
                    </div>
                    <NuxtLink
                        to="/category/all-products"
                        class="inline-flex min-h-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-amber-200 hover:bg-white hover:text-amber-900"
                        @click="closeCatalogMenu"
                    >
                        View all
                    </NuxtLink>
                </div>

                <div class="grid max-h-96 grid-cols-2 gap-3 overflow-y-auto pr-1 lg:grid-cols-3 xl:grid-cols-4" aria-label="Product categories">
                    <NuxtLink
                        v-for="(cat, index) in categories"
                        :key="cat.id"
                        class="group rounded-3xl border border-slate-200/80 bg-linear-to-b from-slate-50 to-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
                        :to="`/category/${cat.handle}`"
                        @click="closeCatalogMenu"
                    >
                        <span class="relative flex aspect-4/3 items-end overflow-hidden rounded-2xl bg-linear-to-br from-slate-100 via-amber-50 to-slate-200 p-3">
                            <NuxtImage
                                v-if="cat.imageUrl"
                                :src="cat.imageUrl"
                                :alt="`${cat.name} category image`"
                                width="360"
                                height="270"
                                loading="lazy"
                                class="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                            <span class="absolute inset-0 bg-linear-to-t from-slate-950/28 via-transparent to-white/8"></span>
                            <span class="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-amber-900 shadow-lg" aria-hidden="true">
                                {{ index + 1 }}
                            </span>
                        </span>
                        <span class="mt-3 block truncate text-base font-semibold tracking-tight text-slate-950">
                            {{ cat.name }}
                        </span>
                        <span class="mt-1 block text-xs font-semibold tracking-widest text-slate-500 uppercase group-hover:text-amber-900">
                            Open category
                        </span>
                    </NuxtLink>
                </div>
            </div>
        </transition>
    </div>
</template>
