<script setup lang="ts">
type BreadcrumbItem = {
    label: string
    to?: string
}

withDefaults(
    defineProps<{
        items: BreadcrumbItem[]
        tone?: "default" | "inverse"
    }>(),
    {
        tone: "default"
    }
)
</script>

<template>
    <nav
        class="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border px-4 py-2 text-sm leading-snug backdrop-blur-sm"
        :class="
            tone === 'inverse'
                ? 'border-white/15 bg-white/10 text-white/75'
                : 'border-slate-200 bg-white/80 text-slate-500 shadow-lg'
        "
        aria-label="Breadcrumb"
    >
        <template v-for="(item, index) in items" :key="`${item.label}-${index}`">
            <NuxtLink
                v-if="item.to && index < items.length - 1"
                :to="item.to"
                class="transition"
                :class="tone === 'inverse' ? 'text-white/85 hover:text-white' : 'hover:text-brand-700 text-slate-600'"
            >
                {{ item.label }}
            </NuxtLink>
            <span v-else :class="tone === 'inverse' ? 'font-semibold text-white' : 'font-semibold text-slate-900'">{{ item.label }}</span>
            <span
                v-if="index < items.length - 1"
                aria-hidden="true"
                class="text-base leading-none"
                :class="tone === 'inverse' ? 'text-white/55' : 'text-slate-400'"
            >
                ›
            </span>
        </template>
    </nav>
</template>
