<script setup lang="ts">
import type {
    CategoryFilterSection,
    CategoryPriceRange,
    CategoryProductsFacets,
    FacetItem
} from "~/types/category-listing"

import CategoryFacetSection from "~/components/Category/CategoryFacetSection.vue"
import CategoryPriceFilter from "~/components/Category/CategoryPriceFilter.vue"
import BaseButton from "~/components/Shared/BaseButton.vue"

const props = defineProps<{
    sidebarTitle: string
    activeFilterCount: number
    childCategoryFacets: FacetItem[]
    facets: CategoryProductsFacets
    priceRange: CategoryPriceRange
    showMobileClose?: boolean
}>()

const selectedChildCategoryIds = defineModel<string[]>("selectedChildCategoryIds", { default: [] })
const selectedCollectionIds = defineModel<string[]>("selectedCollectionIds", { default: [] })
const selectedTypeIds = defineModel<string[]>("selectedTypeIds", { default: [] })
const selectedTagIds = defineModel<string[]>("selectedTagIds", { default: [] })
const selectedMinPrice = defineModel<number | null>("selectedMinPrice", { default: null })
const selectedMaxPrice = defineModel<number | null>("selectedMaxPrice", { default: null })
const inStockOnly = defineModel<boolean>("inStockOnly", { default: false })

const emit = defineEmits<{
    clearAll: []
    close: []
}>()

const sectionIds = computed<CategoryFilterSection[]>(() => {
    const sections: CategoryFilterSection[] = []

    if (props.childCategoryFacets.length) {
        sections.push({ id: "subcategories", title: "Subcategories" })
    }

    if (props.facets.types.length) {
        sections.push({ id: "types", title: "Product types" })
    }

    if (props.facets.collections.length) {
        sections.push({ id: "collections", title: "Collections" })
    }

    if (props.facets.tags.length) {
        sections.push({ id: "tags", title: "Tags" })
    }

    if (props.priceRange.min !== null && props.priceRange.max !== null) {
        sections.push({ id: "price", title: "Price" })
    }

    sections.push({ id: "availability", title: "Availability" })

    return sections
})

const openSectionIds = ref<string[]>([])

watch(
    sectionIds,
    (sections) => {
        const validIds = new Set(sections.map((section) => section.id))
        const nextOpenIds = openSectionIds.value.filter((id) => validIds.has(id))

        if (!nextOpenIds.length) {
            openSectionIds.value = sections.slice(0, 2).map((section) => section.id)
            return
        }

        openSectionIds.value = nextOpenIds
    },
    { immediate: true }
)

function isSectionOpen(sectionId: string): boolean {
    return openSectionIds.value.includes(sectionId)
}

function toggleSection(sectionId: string): void {
    if (isSectionOpen(sectionId)) {
        openSectionIds.value = openSectionIds.value.filter((id) => id !== sectionId)
        return
    }

    openSectionIds.value = [...openSectionIds.value, sectionId]
}

const sectionClass =
    "overflow-hidden rounded-card border border-slate-200/80 bg-white/95 shadow-card transition hover:border-brand-100 hover:shadow-panel"
const sectionButtonClass =
    "flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:outline-hidden"
const sectionContentClass = "border-t border-slate-200/80 bg-linear-to-b from-white to-slate-50/80 px-5 py-4"
const optionLabelClass =
    "group flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl px-1 py-2 text-sm font-medium text-slate-700 transition hover:text-slate-950"
const checkboxClass =
    "mt-0 h-5 w-5 shrink-0 rounded-md border-slate-300 text-brand-700 accent-brand-700 focus:ring-2 focus:ring-brand-100 focus:ring-offset-1"
</script>

<template>
    <div
        class="rounded-4xl border border-white/85 bg-linear-to-b from-white to-slate-50 p-4 shadow-panel ring-1 ring-slate-900/5 sm:p-6 xl:p-7"
    >
        <div class="mb-6 flex items-start justify-between gap-4">
            <div>
                <span
                    class="text-label-sm tracking-label inline-flex min-h-10 items-center rounded-full bg-brand-100 px-5 py-2 font-bold text-brand-700 uppercase shadow-inner"
                >
                    Filters
                </span>
                <h2 class="mt-4 max-w-60 text-2xl leading-tight font-bold tracking-tighter text-slate-950 sm:text-3xl">
                    {{ sidebarTitle }}
                </h2>
                <p class="mt-2 max-w-64 text-sm leading-6 text-slate-600">
                    Narrow the catalogue by fit, category, and availability.
                </p>
            </div>
            <div class="flex shrink-0 items-center gap-2">
                <span
                    v-if="activeFilterCount"
                    class="inline-flex min-h-8 min-w-8 items-center justify-center rounded-full bg-slate-950 px-2 text-xs font-bold text-white"
                    :aria-label="`${activeFilterCount} active filters`"
                >
                    {{ activeFilterCount }}
                </span>
                <BaseButton
                    v-if="activeFilterCount"
                    type="button"
                    class="inline-flex min-h-9 items-center rounded-full border border-slate-200 bg-white/90 px-3 text-xs font-bold text-slate-700 transition hover:border-brand-200 hover:text-brand-800 focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:outline-hidden"
                    @click="emit('clearAll')"
                >
                    Clear
                </BaseButton>
                <BaseButton
                    v-if="showMobileClose"
                    type="button"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:outline-hidden"
                    @click="emit('close')"
                >
                    <span class="sr-only">Close filters</span>
                    <svg viewBox="0 0 20 20" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.8">
                        <path d="M5 5L15 15" stroke-linecap="round" />
                        <path d="M15 5L5 15" stroke-linecap="round" />
                    </svg>
                </BaseButton>
            </div>
        </div>

        <div class="grid gap-4">
            <CategoryFacetSection
                v-model:selected-ids="selectedChildCategoryIds"
                section-id="subcategories"
                title="Subcategories"
                :items="childCategoryFacets"
                :open="isSectionOpen('subcategories')"
                @toggle="toggleSection"
            />

            <CategoryFacetSection
                v-model:selected-ids="selectedTypeIds"
                section-id="types"
                title="Product types"
                :items="facets.types"
                :open="isSectionOpen('types')"
                @toggle="toggleSection"
            />

            <CategoryFacetSection
                v-model:selected-ids="selectedCollectionIds"
                section-id="collections"
                title="Collections"
                :items="facets.collections"
                :open="isSectionOpen('collections')"
                @toggle="toggleSection"
            />

            <CategoryFacetSection
                v-model:selected-ids="selectedTagIds"
                section-id="tags"
                title="Tags"
                :items="facets.tags"
                :open="isSectionOpen('tags')"
                @toggle="toggleSection"
            />

            <section v-if="priceRange.min !== null && priceRange.max !== null" :class="sectionClass">
                <BaseButton
                    type="button"
                    :class="sectionButtonClass"
                    :aria-expanded="isSectionOpen('price')"
                    @click="toggleSection('price')"
                >
                    <span class="text-lg font-bold text-slate-950">Price</span>
                    <span
                        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-xl font-semibold text-slate-500 transition"
                        :style="isSectionOpen('price') ? 'transform: rotate(45deg)' : ''"
                    >+</span
                    >
                </BaseButton>
                <div v-if="isSectionOpen('price')" :class="sectionContentClass">
                    <CategoryPriceFilter
                        v-model:selected-min-price="selectedMinPrice"
                        v-model:selected-max-price="selectedMaxPrice"
                        :price-range="priceRange"
                    />
                </div>
            </section>

            <section :class="sectionClass">
                <BaseButton
                    type="button"
                    :class="sectionButtonClass"
                    :aria-expanded="isSectionOpen('availability')"
                    @click="toggleSection('availability')"
                >
                    <span class="text-lg font-bold text-slate-950">Availability</span>
                    <span
                        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-xl font-semibold text-slate-500 transition"
                        :style="isSectionOpen('availability') ? 'transform: rotate(45deg)' : ''"
                    >+</span
                    >
                </BaseButton>
                <div v-if="isSectionOpen('availability')" :class="sectionContentClass">
                    <label :class="optionLabelClass">
                        <input
                            v-model="inStockOnly"
                            type="checkbox"
                            :class="checkboxClass"
                        />
                        <span>Only show products in stock</span>
                    </label>
                </div>
            </section>

        </div>
    </div>
</template>
