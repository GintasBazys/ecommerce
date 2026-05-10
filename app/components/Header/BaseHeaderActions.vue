<script setup lang="ts">
import type { LocationItem } from "~/types/navigation"

import BaseButton from "~/components/Shared/BaseButton.vue"
import BaseSelect from "~/components/Shared/BaseSelect.vue"

defineProps<{
    locationItems: LocationItem[]
    locationValue: string
    selectionLoading: boolean
    itemCount: number
    isAuthenticated: boolean
}>()

const emit = defineEmits<{
    search: []
    menu: []
    "update-location": [value: string]
}>()
</script>

<template>
    <div class="flex items-center gap-2">
        <label class="hidden items-center gap-2 lg:flex">
            <span class="hidden items-center gap-1 text-xs font-semibold tracking-wide text-slate-500 uppercase xl:flex">
                <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                    <path
                        d="M10 18c3.866-3.588 5.8-6.422 5.8-8.5A5.8 5.8 0 1 0 4.2 9.5C4.2 11.578 6.134 14.412 10 18Z"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                    <circle cx="10" cy="9" r="2" />
                </svg>
                Ship to
            </span>
            <span class="sr-only">Choose shipping country</span>
            <BaseSelect
                id="country-select"
                :model-value="locationValue"
                class="max-w-44 xl:max-w-48"
                :options="locationItems"
                option-label-key="title"
                :disabled="selectionLoading"
                @update:model-value="emit('update-location', String($event))"
            />
        </label>

        <BaseButton
            type="button"
            class="shadow-card inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-300/50 bg-linear-to-b from-white to-slate-50 text-slate-700 transition hover:border-amber-200 hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
            @click="emit('search')"
        >
            <span class="sr-only">Search products</span>
            <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" stroke-linecap="round" />
            </svg>
        </BaseButton>

        <NuxtLink to="/cart" class="relative inline-flex">
            <span class="shadow-card inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-300/50 bg-linear-to-b from-white to-slate-50 text-slate-700 transition hover:border-amber-200 hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden">
                <span class="sr-only">Open cart</span>
                <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                    <path d="M3 4h2l1.2 9.2a2 2 0 0 0 2 1.8h7.7a2 2 0 0 0 2-1.5L20 7H7" stroke-linecap="round" stroke-linejoin="round" />
                    <circle cx="10" cy="19" r="1.4" />
                    <circle cx="17" cy="19" r="1.4" />
                </svg>
            </span>
            <span
                v-if="itemCount"
                class="bg-accent-500 text-label-xs absolute -top-1 -right-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 font-semibold text-slate-950 ring-2 ring-white"
            >
                {{ itemCount < 99 ? itemCount : "99+" }}
            </span>
        </NuxtLink>

        <NuxtLink
            v-if="isAuthenticated"
            class="shadow-card hidden items-center rounded-full border border-slate-200 bg-white/85 px-3 py-2 text-base font-semibold text-slate-700 transition hover:border-amber-200 hover:text-amber-900 xl:inline-flex"
            to="/account"
        >
            Profile
        </NuxtLink>
        <NuxtLink
            v-else
            class="shadow-card hidden items-center rounded-full border border-slate-200 bg-white/85 px-3 py-2 text-base font-semibold text-slate-700 transition hover:border-amber-200 hover:text-amber-900 xl:inline-flex"
            to="/signin"
        >
            Sign in
        </NuxtLink>

        <BaseButton
            type="button"
            class="shadow-card inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-300/50 bg-linear-to-b from-white to-slate-50 text-slate-700 transition hover:border-amber-200 hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden xl:hidden"
            @click="emit('menu')"
        >
            <span class="sr-only">Open menu</span>
            <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" />
            </svg>
        </BaseButton>
    </div>
</template>
