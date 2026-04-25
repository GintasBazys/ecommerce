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
    disablePanelTransitions: boolean
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
</script>

<template>
    <div
        class="rounded-[1.6rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] p-4 shadow-[0_14px_36px_rgba(8,27,90,0.06)] sm:p-5"
    >
        <div class="mb-4 flex items-start justify-between gap-3">
            <div>
                <span
                    class="bg-brand-100 text-brand-700 inline-flex min-h-9 items-center rounded-full px-4 py-2 text-label-sm font-bold tracking-label uppercase"
                >
                    Filters
                </span>
                <h2 class="mt-3 text-[1.3rem] leading-[1.1] font-semibold text-slate-950">{{ props.sidebarTitle }}</h2>
            </div>
            <div class="flex items-center gap-3">
                <button
                    v-if="props.activeFilterCount"
                    type="button"
                    class="text-brand-700 hover:text-brand-900 text-sm font-semibold transition"
                    @click="emit('clearAll')"
                >
                    Clear all
                </button>
                <button
                    v-if="props.showMobileClose"
                    type="button"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
                    @click="emit('close')"
                >
                    <svg viewBox="0 0 20 20" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.8">
                        <path d="M5 5L15 15" stroke-linecap="round" />
                        <path d="M15 5L5 15" stroke-linecap="round" />
                    </svg>
                </button>
            </div>
        </div>

        <div class="grid gap-3">
            <section v-if="props.childCategoryFacets.length" class="rounded-card-sm overflow-hidden border border-slate-200 bg-white">
                <button
                    type="button"
                    class="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
                    @click="toggleSection('subcategories')"
                >
                    <span class="font-semibold text-slate-950">Subcategories</span>
                    <span
                        class="text-slate-500"
                        :class="props.disablePanelTransitions ? '' : 'transition-transform duration-200'"
                        :style="isSectionOpen('subcategories') ? 'transform: rotate(45deg)' : ''"
                    >+</span
                    >
                </button>
                <div v-if="isSectionOpen('subcategories')" class="border-t border-slate-200 px-4 py-3">
                    <label
                        v-for="item in props.childCategoryFacets"
                        :key="item.id"
                        class="flex cursor-pointer items-start gap-3 py-2 text-sm text-slate-700"
                    >
                        <input
                            :checked="selectedChildCategoryIds.includes(item.id)"
                            type="checkbox"
                            class="text-brand-700 focus:ring-brand-200 mt-1 h-4 w-4 rounded border-slate-300"
                            @change="toggleSelection('child', item.id, getCheckboxValue($event))"
                        />
                        <span>{{ item.label }} ({{ item.count }})</span>
                    </label>
                </div>
            </section>

            <section v-if="props.facets.types.length" class="rounded-card-sm overflow-hidden border border-slate-200 bg-white">
                <button
                    type="button"
                    class="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
                    @click="toggleSection('types')"
                >
                    <span class="font-semibold text-slate-950">Product types</span>
                    <span
                        class="text-slate-500"
                        :class="props.disablePanelTransitions ? '' : 'transition-transform duration-200'"
                        :style="isSectionOpen('types') ? 'transform: rotate(45deg)' : ''"
                    >+</span
                    >
                </button>
                <div v-if="isSectionOpen('types')" class="border-t border-slate-200 px-4 py-3">
                    <label
                        v-for="item in props.facets.types"
                        :key="item.id"
                        class="flex cursor-pointer items-start gap-3 py-2 text-sm text-slate-700"
                    >
                        <input
                            :checked="selectedTypeIds.includes(item.id)"
                            type="checkbox"
                            class="text-brand-700 focus:ring-brand-200 mt-1 h-4 w-4 rounded border-slate-300"
                            @change="toggleSelection('type', item.id, getCheckboxValue($event))"
                        />
                        <span>{{ item.label }} ({{ item.count }})</span>
                    </label>
                </div>
            </section>

            <section v-if="props.facets.collections.length" class="rounded-card-sm overflow-hidden border border-slate-200 bg-white">
                <button
                    type="button"
                    class="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
                    @click="toggleSection('collections')"
                >
                    <span class="font-semibold text-slate-950">Collections</span>
                    <span
                        class="text-slate-500"
                        :class="props.disablePanelTransitions ? '' : 'transition-transform duration-200'"
                        :style="isSectionOpen('collections') ? 'transform: rotate(45deg)' : ''"
                    >+</span
                    >
                </button>
                <div v-if="isSectionOpen('collections')" class="border-t border-slate-200 px-4 py-3">
                    <label
                        v-for="item in props.facets.collections"
                        :key="item.id"
                        class="flex cursor-pointer items-start gap-3 py-2 text-sm text-slate-700"
                    >
                        <input
                            :checked="selectedCollectionIds.includes(item.id)"
                            type="checkbox"
                            class="text-brand-700 focus:ring-brand-200 mt-1 h-4 w-4 rounded border-slate-300"
                            @change="toggleSelection('collection', item.id, getCheckboxValue($event))"
                        />
                        <span>{{ item.label }} ({{ item.count }})</span>
                    </label>
                </div>
            </section>

            <section v-if="props.facets.tags.length" class="rounded-card-sm overflow-hidden border border-slate-200 bg-white">
                <button
                    type="button"
                    class="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
                    @click="toggleSection('tags')"
                >
                    <span class="font-semibold text-slate-950">Tags</span>
                    <span
                        class="text-slate-500"
                        :class="props.disablePanelTransitions ? '' : 'transition-transform duration-200'"
                        :style="isSectionOpen('tags') ? 'transform: rotate(45deg)' : ''"
                    >+</span
                    >
                </button>
                <div v-if="isSectionOpen('tags')" class="border-t border-slate-200 px-4 py-3">
                    <label
                        v-for="item in props.facets.tags"
                        :key="item.id"
                        class="flex cursor-pointer items-start gap-3 py-2 text-sm text-slate-700"
                    >
                        <input
                            :checked="selectedTagIds.includes(item.id)"
                            type="checkbox"
                            class="text-brand-700 focus:ring-brand-200 mt-1 h-4 w-4 rounded border-slate-300"
                            @change="toggleSelection('tag', item.id, getCheckboxValue($event))"
                        />
                        <span>{{ item.label }} ({{ item.count }})</span>
                    </label>
                </div>
            </section>

            <section class="rounded-card-sm overflow-hidden border border-slate-200 bg-white">
                <button
                    type="button"
                    class="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
                    @click="toggleSection('availability')"
                >
                    <span class="font-semibold text-slate-950">Availability</span>
                    <span
                        class="text-slate-500"
                        :class="props.disablePanelTransitions ? '' : 'transition-transform duration-200'"
                        :style="isSectionOpen('availability') ? 'transform: rotate(45deg)' : ''"
                    >+</span
                    >
                </button>
                <div v-if="isSectionOpen('availability')" class="border-t border-slate-200 px-4 py-3">
                    <label class="flex cursor-pointer items-start gap-3 py-2 text-sm text-slate-700">
                        <input
                            v-model="inStockOnly"
                            type="checkbox"
                            class="text-brand-700 focus:ring-brand-200 mt-1 h-4 w-4 rounded border-slate-300"
                        />
                        <span>Only show products in stock</span>
                    </label>
                </div>
            </section>

            <section
                v-if="props.facets.price.max > props.facets.price.min"
                class="rounded-card-sm overflow-hidden border border-slate-200 bg-white"
            >
                <button
                    type="button"
                    class="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
                    @click="toggleSection('price')"
                >
                    <span class="font-semibold text-slate-950">Price</span>
                    <span
                        class="text-slate-500"
                        :class="props.disablePanelTransitions ? '' : 'transition-transform duration-200'"
                        :style="isSectionOpen('price') ? 'transform: rotate(45deg)' : ''"
                    >+</span
                    >
                </button>
                <div v-if="isSectionOpen('price')" class="border-t border-slate-200 px-4 py-4">
                    <div class="grid gap-4">
                        <div class="font-semibold text-slate-950">{{ props.priceSummary }}</div>
                        <div class="grid gap-3">
                            <input
                                v-model="priceRangeMin"
                                :min="props.facets.price.min"
                                :max="props.facets.price.max"
                                :step="props.priceStep"
                                type="range"
                                class="accent-brand-700 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200"
                            />
                            <input
                                v-model="priceRangeMax"
                                :min="props.facets.price.min"
                                :max="props.facets.price.max"
                                :step="props.priceStep"
                                type="range"
                                class="accent-brand-700 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200"
                            />
                            <div class="grid grid-cols-2 gap-3 text-sm text-slate-600">
                                <div class="rounded-[0.9rem] border border-slate-200 bg-slate-50 px-3 py-2">Min: {{ priceRange[0] }}</div>
                                <div class="rounded-[0.9rem] border border-slate-200 bg-slate-50 px-3 py-2">Max: {{ priceRange[1] }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div v-if="props.facets.price.max > props.facets.price.min" class="grid gap-3 pt-2 sm:grid-cols-2">
                <button
                    type="button"
                    class="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
                    @click="emit('resetPriceRange')"
                >
                    Reset price
                </button>
                <button type="button" class="ui-btn-accent px-4" @click="emit('applyPriceRange')">Apply price</button>
            </div>
        </div>
    </div>
</template>
