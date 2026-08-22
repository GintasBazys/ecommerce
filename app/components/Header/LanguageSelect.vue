<script setup lang="ts">
import type { LocationItem } from "~/types/navigation"

const props = defineProps<{
    languageItems: LocationItem[]
    languageValue: string
    languageLabel: string
    disabled: boolean
}>()

const emit = defineEmits<{
    "update-language": [value: string]
}>()

const flagSrc = computed<string>(() => (props.languageValue === "lt" ? "/images/flags/lt.svg" : "/images/flags/en.svg"))

function updateLanguage(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
        emit("update-language", event.target.value)
    }
}
</script>

<template>
    <span class="relative inline-flex h-11 w-18 shrink-0 items-center">
        <select
            :value="languageValue"
            class="focus:border-brand-500 focus:ring-brand-100 shadow-card h-11 w-full appearance-none rounded-full border border-slate-300 bg-linear-to-b from-white to-slate-50 px-3 pr-8 text-transparent outline-hidden transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70 [&_option]:text-slate-900"
            :disabled="disabled"
            :aria-label="languageLabel"
            @change="updateLanguage"
        >
            <option v-for="item in languageItems" :key="item.value" :value="item.value">
                {{ item.title }}
            </option>
        </select>

        <img :src="flagSrc" alt="" class="pointer-events-none absolute left-4 h-4 w-6 rounded-xs object-cover shadow-sm" width="24" height="16" />
        <svg
            viewBox="0 0 20 20"
            class="pointer-events-none absolute right-3 h-4 w-4 text-slate-600"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            aria-hidden="true"
        >
            <path d="M5 7.5 10 12.5 15 7.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    </span>
</template>
