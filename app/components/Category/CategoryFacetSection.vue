<script setup lang="ts">
import type { FacetItem } from "~/types/category-listing"

import BaseButton from "~/components/Shared/BaseButton.vue"

defineProps<{
    sectionId: string
    title: string
    items: FacetItem[]
    open: boolean
}>()

const selectedIds = defineModel<string[]>("selectedIds", { default: [] })

const emit = defineEmits<{
    toggle: [sectionId: string]
}>()

const sectionClass =
    "overflow-hidden rounded-card border border-slate-200/80 bg-white/95 shadow-card transition hover:border-brand-100 hover:shadow-panel"
const sectionButtonClass =
    "flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:outline-hidden"
const sectionContentClass = "border-t border-slate-200/80 bg-linear-to-b from-white to-slate-50/80 px-5 py-4"
const optionLabelClass =
    "group flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl px-1 py-2 text-sm font-medium text-slate-700 transition hover:text-slate-950"
const checkboxClass =
    "mt-0 h-5 w-5 shrink-0 rounded-md border-slate-300 text-brand-700 accent-brand-700 focus:ring-2 focus:ring-brand-100 focus:ring-offset-1"

function updateSelection(itemId: string, checked: boolean): void {
    const current = Array.isArray(selectedIds.value) ? selectedIds.value : []

    if (checked) {
        if (!current.includes(itemId)) {
            selectedIds.value = [...current, itemId]
        }
        return
    }

    selectedIds.value = current.filter((id) => id !== itemId)
}

function getCheckboxValue(event: Event): boolean {
    return event.target instanceof HTMLInputElement ? event.target.checked : false
}
</script>

<template>
    <section v-if="items.length" :class="sectionClass">
        <BaseButton
            type="button"
            :class="sectionButtonClass"
            :aria-expanded="open"
            @click="emit('toggle', sectionId)"
        >
            <span class="text-lg font-bold text-slate-950">{{ title }}</span>
            <span
                class="inline-flex h-8 w-8 items-center justify-center rounded-full text-xl font-semibold text-slate-500 transition"
                :style="open ? 'transform: rotate(45deg)' : ''"
            >+</span>
        </BaseButton>
        <div v-if="open" :class="sectionContentClass">
            <label v-for="item in items" :key="item.id" :class="optionLabelClass">
                <input
                    :checked="selectedIds.includes(item.id)"
                    type="checkbox"
                    :class="checkboxClass"
                    @change="updateSelection(item.id, getCheckboxValue($event))"
                />
                <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
                <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{{ item.count }}</span>
            </label>
        </div>
    </section>
</template>
