<script setup lang="ts">
type FacetItem = {
    id: string
    label: string
    count: number
}

type PriceRange = [number, number]

type CategoryProductsFacets = {
    categories: FacetItem[]
    collections: FacetItem[]
    types: FacetItem[]
    tags: FacetItem[]
    price: {
        min: number
        max: number
        currencyCode: string | null
    }
}

type FilterSection = {
    id: string
    title: string
}

type SelectionGroup = "child" | "collection" | "type" | "tag"

const props = defineProps<{
    sidebarTitle: string
    activeFilterCount: number
    childCategoryFacets: FacetItem[]
    facets: CategoryProductsFacets
    priceSummary: string
    priceStep: number
    showMobileClose?: boolean
}>()

const selectedChildCategoryIds = defineModel<string[]>("selectedChildCategoryIds", { default: [] })
const selectedCollectionIds = defineModel<string[]>("selectedCollectionIds", { default: [] })
const selectedTypeIds = defineModel<string[]>("selectedTypeIds", { default: [] })
const selectedTagIds = defineModel<string[]>("selectedTagIds", { default: [] })
const inStockOnly = defineModel<boolean>("inStockOnly", { default: false })
const priceRange = defineModel<PriceRange>("priceRange", { default: [0, 0] })

const emit = defineEmits<{
    clearAll: []
    resetPriceRange: []
    applyPriceRange: []
    close: []
}>()

const sectionIds = computed<FilterSection[]>(() => {
    const sections: FilterSection[] = []

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

    sections.push({ id: "availability", title: "Availability" })

    if (props.facets.price.max > props.facets.price.min) {
        sections.push({ id: "price", title: "Price" })
    }

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

const priceRangeMin = computed<number>({
    get: () => priceRange.value[0],
    set: (value) => {
        const nextValue = Math.min(Number(value), priceRange.value[1])
        priceRange.value = [nextValue, priceRange.value[1]]
    }
})

const priceRangeMax = computed<number>({
    get: () => priceRange.value[1],
    set: (value) => {
        const nextValue = Math.max(Number(value), priceRange.value[0])
        priceRange.value = [priceRange.value[0], nextValue]
    }
})

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

function getSelectionModel(group: SelectionGroup): typeof selectedChildCategoryIds {
    if (group === "child") {
        return selectedChildCategoryIds
    }

    if (group === "collection") {
        return selectedCollectionIds
    }

    if (group === "type") {
        return selectedTypeIds
    }

    return selectedTagIds
}

function toggleSelection(group: SelectionGroup, itemId: string, checked: boolean): void {
    const model = getSelectionModel(group)
    const current = Array.isArray(model.value) ? model.value : []

    if (checked) {
        if (!current.includes(itemId)) {
            model.value = [...current, itemId]
        }
        return
    }

    model.value = current.filter((id) => id !== itemId)
}

function getCheckboxValue(event: Event): boolean {
    return event.target instanceof HTMLInputElement ? event.target.checked : false
}

const sectionClass =
    "overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white/95 shadow-[0_10px_28px_rgba(15,23,42,0.045)] transition hover:border-brand-100 hover:shadow-[0_14px_34px_rgba(15,23,42,0.07)]"
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
        class="rounded-4xl border border-white/85 bg-[radial-gradient(circle_at_top_left,rgba(219,234,254,0.72),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.09)] ring-1 ring-slate-900/5 sm:p-6 xl:p-7"
    >
        <div class="mb-6 flex items-start justify-between gap-4">
            <div>
                <span
                    class="text-label-sm tracking-label inline-flex min-h-10 items-center rounded-full bg-brand-100 px-5 py-2 font-bold text-brand-700 uppercase shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]"
                >
                    Filters
                </span>
                <h2 class="mt-4 max-w-60 text-[1.55rem] leading-[1.03] font-bold tracking-[-0.04em] text-slate-950 sm:text-[1.85rem]">
                    {{ props.sidebarTitle }}
                </h2>
                <p class="mt-2 max-w-64 text-sm leading-6 text-slate-600">
                    Narrow the catalogue by fit, availability, and price.
                </p>
            </div>
            <div class="flex shrink-0 items-center gap-2">
                <span
                    v-if="props.activeFilterCount"
                    class="inline-flex min-h-8 min-w-8 items-center justify-center rounded-full bg-slate-950 px-2 text-xs font-bold text-white"
                    :aria-label="`${props.activeFilterCount} active filters`"
                >
                    {{ props.activeFilterCount }}
                </span>
                <button
                    v-if="props.activeFilterCount"
                    type="button"
                    class="inline-flex min-h-9 items-center rounded-full border border-slate-200 bg-white/90 px-3 text-xs font-bold text-slate-700 transition hover:border-brand-200 hover:text-brand-800 focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:outline-hidden"
                    @click="emit('clearAll')"
                >
                    Clear
                </button>
                <button
                    v-if="props.showMobileClose"
                    type="button"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:outline-hidden"
                    @click="emit('close')"
                >
                    <span class="sr-only">Close filters</span>
                    <svg viewBox="0 0 20 20" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.8">
                        <path d="M5 5L15 15" stroke-linecap="round" />
                        <path d="M15 5L5 15" stroke-linecap="round" />
                    </svg>
                </button>
            </div>
        </div>

        <div class="grid gap-4">
            <section v-if="props.childCategoryFacets.length" :class="sectionClass">
                <button
                    type="button"
                    :class="sectionButtonClass"
                    :aria-expanded="isSectionOpen('subcategories')"
                    @click="toggleSection('subcategories')"
                >
                    <span class="text-[1.05rem] font-bold text-slate-950">Subcategories</span>
                    <span
                        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-xl font-semibold text-slate-500 transition"
                        :style="isSectionOpen('subcategories') ? 'transform: rotate(45deg)' : ''"
                    >+</span
                    >
                </button>
                <div v-if="isSectionOpen('subcategories')" :class="sectionContentClass">
                    <label
                        v-for="item in props.childCategoryFacets"
                        :key="item.id"
                        :class="optionLabelClass"
                    >
                        <input
                            :checked="selectedChildCategoryIds.includes(item.id)"
                            type="checkbox"
                            :class="checkboxClass"
                            @change="toggleSelection('child', item.id, getCheckboxValue($event))"
                        />
                        <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
                        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{{ item.count }}</span>
                    </label>
                </div>
            </section>

            <section v-if="props.facets.types.length" :class="sectionClass">
                <button
                    type="button"
                    :class="sectionButtonClass"
                    :aria-expanded="isSectionOpen('types')"
                    @click="toggleSection('types')"
                >
                    <span class="text-[1.05rem] font-bold text-slate-950">Product types</span>
                    <span
                        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-xl font-semibold text-slate-500 transition"
                        :style="isSectionOpen('types') ? 'transform: rotate(45deg)' : ''"
                    >+</span
                    >
                </button>
                <div v-if="isSectionOpen('types')" :class="sectionContentClass">
                    <label
                        v-for="item in props.facets.types"
                        :key="item.id"
                        :class="optionLabelClass"
                    >
                        <input
                            :checked="selectedTypeIds.includes(item.id)"
                            type="checkbox"
                            :class="checkboxClass"
                            @change="toggleSelection('type', item.id, getCheckboxValue($event))"
                        />
                        <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
                        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{{ item.count }}</span>
                    </label>
                </div>
            </section>

            <section v-if="props.facets.collections.length" :class="sectionClass">
                <button
                    type="button"
                    :class="sectionButtonClass"
                    :aria-expanded="isSectionOpen('collections')"
                    @click="toggleSection('collections')"
                >
                    <span class="text-[1.05rem] font-bold text-slate-950">Collections</span>
                    <span
                        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-xl font-semibold text-slate-500 transition"
                        :style="isSectionOpen('collections') ? 'transform: rotate(45deg)' : ''"
                    >+</span
                    >
                </button>
                <div v-if="isSectionOpen('collections')" :class="sectionContentClass">
                    <label
                        v-for="item in props.facets.collections"
                        :key="item.id"
                        :class="optionLabelClass"
                    >
                        <input
                            :checked="selectedCollectionIds.includes(item.id)"
                            type="checkbox"
                            :class="checkboxClass"
                            @change="toggleSelection('collection', item.id, getCheckboxValue($event))"
                        />
                        <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
                        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{{ item.count }}</span>
                    </label>
                </div>
            </section>

            <section v-if="props.facets.tags.length" :class="sectionClass">
                <button
                    type="button"
                    :class="sectionButtonClass"
                    :aria-expanded="isSectionOpen('tags')"
                    @click="toggleSection('tags')"
                >
                    <span class="text-[1.05rem] font-bold text-slate-950">Tags</span>
                    <span
                        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-xl font-semibold text-slate-500 transition"
                        :style="isSectionOpen('tags') ? 'transform: rotate(45deg)' : ''"
                    >+</span
                    >
                </button>
                <div v-if="isSectionOpen('tags')" :class="sectionContentClass">
                    <label
                        v-for="item in props.facets.tags"
                        :key="item.id"
                        :class="optionLabelClass"
                    >
                        <input
                            :checked="selectedTagIds.includes(item.id)"
                            type="checkbox"
                            :class="checkboxClass"
                            @change="toggleSelection('tag', item.id, getCheckboxValue($event))"
                        />
                        <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
                        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{{ item.count }}</span>
                    </label>
                </div>
            </section>

            <section :class="sectionClass">
                <button
                    type="button"
                    :class="sectionButtonClass"
                    :aria-expanded="isSectionOpen('availability')"
                    @click="toggleSection('availability')"
                >
                    <span class="text-[1.05rem] font-bold text-slate-950">Availability</span>
                    <span
                        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-xl font-semibold text-slate-500 transition"
                        :style="isSectionOpen('availability') ? 'transform: rotate(45deg)' : ''"
                    >+</span
                    >
                </button>
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

            <section
                v-if="props.facets.price.max > props.facets.price.min"
                :class="sectionClass"
            >
                <button
                    type="button"
                    :class="sectionButtonClass"
                    :aria-expanded="isSectionOpen('price')"
                    @click="toggleSection('price')"
                >
                    <span class="text-[1.05rem] font-bold text-slate-950">Price</span>
                    <span
                        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-xl font-semibold text-slate-500 transition"
                        :style="isSectionOpen('price') ? 'transform: rotate(45deg)' : ''"
                    >+</span
                    >
                </button>
                <div v-if="isSectionOpen('price')" :class="sectionContentClass">
                    <div class="grid gap-4">
                        <div class="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm font-bold text-slate-950">
                            {{ props.priceSummary }}
                        </div>
                        <div class="grid gap-3">
                            <input
                                v-model="priceRangeMin"
                                :min="props.facets.price.min"
                                :max="props.facets.price.max"
                                :step="props.priceStep"
                                type="range"
                                class="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-700"
                            />
                            <input
                                v-model="priceRangeMax"
                                :min="props.facets.price.min"
                                :max="props.facets.price.max"
                                :step="props.priceStep"
                                type="range"
                                class="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-700"
                            />
                            <div class="grid grid-cols-2 gap-3 text-sm font-semibold text-slate-700">
                                <div class="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-[0_6px_16px_rgba(15,23,42,0.035)]">
                                    <span class="block text-xs font-bold text-slate-400 uppercase">Min</span>
                                    {{ priceRange[0] }}
                                </div>
                                <div class="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-[0_6px_16px_rgba(15,23,42,0.035)]">
                                    <span class="block text-xs font-bold text-slate-400 uppercase">Max</span>
                                    {{ priceRange[1] }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div v-if="props.facets.price.max > props.facets.price.min" class="grid gap-3 pt-2 sm:grid-cols-2">
                <button
                    type="button"
                    class="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white/95 px-4 text-sm font-bold text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:outline-hidden"
                    @click="emit('resetPriceRange')"
                >
                    Reset price
                </button>
                <button
                    type="button"
                    class="ui-btn-accent min-h-12 px-4 font-bold shadow-[0_12px_26px_rgba(180,132,48,0.22)]"
                    @click="emit('applyPriceRange')"
                >
                    Apply price
                </button>
            </div>
        </div>
    </div>
</template>
