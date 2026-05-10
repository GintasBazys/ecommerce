<script setup lang="ts">
import type { SearchResponse } from "@/types/interfaces"
import type { ProductDTO } from "@medusajs/types"

import BaseButton from "~/components/Shared/BaseButton.vue"
import BaseModal from "~/components/Shared/BaseModal.vue"
import NuxtImage from "~/components/Shared/NuxtImage.vue"
import { ALL_PRODUCTS_URL_HANDLE, PRODUCT_URL_HANDLE } from "~/utils/consts"
import { debounce } from "~/utils/debounce"

const props = defineProps<{
    open: boolean
    regionId: string
    selectedCountryCode: string
}>()

const emit = defineEmits<{
    close: []
}>()

const searchInputRef = useTemplateRef<HTMLInputElement>("searchInputRef")
const searchQuery = ref<string>("")
const searchLoading = ref<boolean>(false)
const searchError = ref<string | null>(null)
const searchResults = ref<ProductDTO[]>([])
const searchHasSearched = ref<boolean>(false)
const normalizedSearchQuery = computed<string>(() => searchQuery.value.trim())
const searchTitleId = useId()
const searchDialogModel = computed<boolean>({
    get: () => props.open,
    set: (value) => {
        if (!value) {
            closeSearchDialog()
        }
    }
})

const runSearch = debounce(async (value: string) => {
    if (value.length < 3) {
        searchResults.value = []
        searchHasSearched.value = false
        searchLoading.value = false
        return
    }

    searchLoading.value = true
    searchError.value = null

    try {
        const response = await $fetch<SearchResponse>("/api/search", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            query: {
                ...(props.regionId ? { region_id: props.regionId } : {}),
                ...(props.selectedCountryCode ? { country_code: props.selectedCountryCode } : {})
            },
            body: {
                q: value
            }
        })

        searchResults.value = response.products.slice(0, 8)
    } catch {
        searchResults.value = []
        searchError.value = "Search could not be loaded. Please try again."
    } finally {
        searchHasSearched.value = true
        searchLoading.value = false
    }
}, 300)

watch(searchQuery, (value) => {
    if (!props.open) {
        return
    }

    runSearch(value.trim())
})

watch(
    () => props.open,
    async (opened) => {
        if (!opened) {
            searchQuery.value = ""
        searchLoading.value = false
        searchError.value = null
        searchHasSearched.value = false
            searchResults.value = []
            runSearch.cancel()
            return
        }

        await nextTick()
        searchInputRef.value?.focus()
    },
    { immediate: true }
)

onBeforeUnmount(() => {
    runSearch.cancel()
})

function closeSearchDialog(): void {
    emit("close")
}

async function submitSearch(): Promise<void> {
    const query = normalizedSearchQuery.value

    if (query.length < 3) {
        return
    }

    closeSearchDialog()
    await navigateTo({ path: "/search", query: { q: query } })
}

function getProductPath(handle?: string | null): string {
    return handle ? `${PRODUCT_URL_HANDLE}/${handle}` : ALL_PRODUCTS_URL_HANDLE
}

function getProductMeta(product: ProductDTO): string {
    if (product.collection?.title) {
        return product.collection.title
    }

    if (product.type?.value) {
        return product.type.value
    }

    if (product.subtitle) {
        return product.subtitle
    }

    return "View product details"
}
</script>

<template>
    <BaseModal
        v-model="searchDialogModel"
        :title-id="searchTitleId"
        close-label="Close search"
        size="lg"
        overlay-class="z-70 items-start justify-center bg-slate-950/70 p-4 backdrop-blur-sm md:p-6"
        panel-class="mt-14 rounded-4xl border-white/60 bg-linear-to-b from-white to-slate-50"
        content-class="min-h-0"
    >
        <div class="border-b border-slate-200/80 px-4 py-4 md:px-6">
            <div class="mb-4 h-px w-full bg-linear-to-r from-slate-400/0 via-amber-500/45 to-slate-400/0"></div>
            <div class="flex items-center justify-between gap-3">
                <div>
                    <p
                        class="text-label-2xs tracking-label inline-flex rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 font-semibold text-amber-900 uppercase"
                    >
                        Search
                    </p>
                    <h2 :id="searchTitleId" class="mt-3 text-lg font-semibold tracking-tight text-slate-950">Search products</h2>
                </div>
            </div>
        </div>

        <div class="border-b border-slate-200/80 px-4 py-4 md:px-6">
            <form class="grid gap-3 sm:grid-cols-[1fr_auto]" @submit.prevent="submitSearch">
                <label>
                    <span class="sr-only">Search by product name</span>
                    <input
                        ref="searchInputRef"
                        v-model="searchQuery"
                        data-autofocus
                        name="q"
                        type="search"
                        autocomplete="off"
                        class="ui-input shadow-card rounded-2xl border-slate-300 bg-linear-to-b from-white to-slate-50 text-slate-900"
                        placeholder="Search by product name…"
                    />
                </label>
                <BaseButton type="submit" variant="accent" class="min-h-12 px-5" :disabled="normalizedSearchQuery.length < 3">
                    View results
                </BaseButton>
            </form>
            <p class="mt-2 text-sm text-slate-600" aria-live="polite">
                <span v-if="normalizedSearchQuery.length < 3">Type at least 3 characters</span>
                <span v-else-if="searchLoading">Searching…</span>
                <span v-else-if="searchError">{{ searchError }}</span>
                <span v-else-if="searchHasSearched">
                    {{ searchResults.length }} result{{ searchResults.length === 1 ? "" : "s" }}
                </span>
            </p>
        </div>

        <div class="px-4 py-3 md:px-6 md:py-4">
            <div v-if="searchLoading" class="flex items-center justify-center py-12" role="status" aria-live="polite">
                <span class="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-amber-700"></span>
            </div>

            <div
                v-else-if="searchHasSearched && !searchResults.length"
                class="shadow-card rounded-3xl border border-white/80 bg-white/80 px-4 py-8 text-center text-sm text-slate-600"
            >
                No products found.
            </div>

            <ul v-if="searchResults.length" class="grid gap-2">
                <li v-for="product in searchResults" :key="product.id">
                    <NuxtLink
                        class="shadow-card flex items-center gap-3 rounded-2xl border border-transparent bg-white/72 px-3 py-3 transition hover:border-amber-200 hover:bg-white"
                        :to="getProductPath(product.handle)"
                        @click="closeSearchDialog"
                    >
                        <NuxtImage
                            :src="product.thumbnail || product.images?.[0]?.url || '/images/about/about-premium.jpg'"
                            :alt="product.title || 'Product image'"
                            width="80"
                            height="80"
                            class="h-20 w-20 rounded-xl bg-slate-100 object-cover"
                        />
                        <div class="min-w-0 flex-1">
                            <p class="truncate text-sm font-semibold text-slate-950">{{ product.title }}</p>
                            <p class="truncate text-xs font-medium tracking-wide text-slate-600">{{ getProductMeta(product) }}</p>
                        </div>
                        <span class="text-xs font-semibold tracking-widest text-amber-900">Open</span>
                    </NuxtLink>
                </li>
            </ul>
        </div>
    </BaseModal>
</template>
