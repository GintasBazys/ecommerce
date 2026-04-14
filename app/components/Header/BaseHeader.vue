<script setup lang="ts">
import debounce from "lodash/debounce"

import type { SearchResponse } from "@/types/interfaces"
import type { ProductDTO } from "@medusajs/types"

import { ALL_PRODUCTS_URL_HANDLE, CATEGORY_HANDLE, PRODUCT_URL_HANDLE } from "~/utils/consts"

const bannerHidden = ref<boolean>(false)
const drawer = ref<boolean>(false)
const searchDialog = ref<boolean>(false)
const searchQuery = ref<string>("")
const searchLoading = ref<boolean>(false)
const searchResults = ref<ProductDTO[]>([])
const searchHasSearched = ref<boolean>(false)
const selectionLoading = ref<boolean>(false)
const normalizedSearchQuery = computed<string>(() => searchQuery.value.trim())

const route = useRoute()

const regionStore = useRegionStore()
const { customer } = storeToRefs(useCustomerStore())
const { itemCount } = storeToRefs(useCartStore())
const { categories } = storeToRefs(useProductStore())
const { regionStoreId, availableCountries, selectedCountryCode } = storeToRefs(regionStore)

const topOffset = computed<number>(() => (bannerHidden.value ? 0 : 32))
const headerHeight = 64
const headerOffset = computed<number>(() => (bannerHidden.value ? headerHeight : headerHeight + 32))
const regionId = computed<string>(() => regionStoreId.value ?? "")

const locationItems = computed(() =>
    availableCountries.value.map((country) => ({
        title: country.display_name || country.iso_2.toUpperCase(),
        value: country.iso_2
    }))
)

const locationValue = computed<string>({
    get: () => selectedCountryCode.value ?? "",
    set: (value) => {
        void updateLocation(value)
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

    try {
        const response = await $fetch<SearchResponse>("/api/search", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            query: {
                ...(regionId.value ? { region_id: regionId.value } : {}),
                ...(selectedCountryCode.value ? { country_code: selectedCountryCode.value } : {})
            },
            body: {
                q: value
            }
        })

        searchResults.value = response.products.slice(0, 8)
    } catch {
        searchResults.value = []
    } finally {
        searchHasSearched.value = true
        searchLoading.value = false
    }
}, 300)

watch(searchDialog, (opened) => {
    if (!opened) {
        searchQuery.value = ""
        searchLoading.value = false
        searchHasSearched.value = false
        searchResults.value = []
        runSearch.cancel()
    }
})

watch(searchQuery, (value) => {
    if (!searchDialog.value) {
        return
    }

    runSearch(value.trim())
})

watch(
    () => route.fullPath,
    () => {
        drawer.value = false
        searchDialog.value = false
    }
)

watch(
    headerOffset,
    (value) => {
        if (!import.meta.client) {
            return
        }

        document.documentElement.style.setProperty("--site-header-offset", `${value}px`)
    },
    { immediate: true }
)

onBeforeUnmount(() => {
    if (!import.meta.client) {
        return
    }

    document.documentElement.style.removeProperty("--site-header-offset")
})

function openSearchDialog(): void {
    searchDialog.value = true
}

function closeSearchDialog(): void {
    searchDialog.value = false
}

async function updateLocation(value: string): Promise<void> {
    if (!value || value === selectedCountryCode.value) {
        return
    }

    selectionLoading.value = true

    try {
        regionStore.setCountry(value)
        drawer.value = false
        searchDialog.value = false

        if (import.meta.client) {
            window.location.assign(route.fullPath)
            return
        }

        await reloadNuxtApp({ path: route.fullPath })
    } finally {
        selectionLoading.value = false
    }
}

function closeDrawer(): void {
    drawer.value = false
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
    <header class="relative z-50">
        <div
            v-if="!bannerHidden"
            class="fixed inset-x-0 top-0 z-50 h-8 border-b border-blue-100 bg-gradient-to-r from-brand-900 via-brand-700 to-sky-500 text-white"
        >
            <div class="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4">
                <p class="truncate text-xs font-semibold tracking-wide">Free shipping on 35 EUR</p>
                <button
                    type="button"
                    class="ui-icon-btn min-h-7 min-w-7 border-white/30 text-white hover:text-white"
                    @click="bannerHidden = true"
                >
                    <span class="sr-only">Dismiss shipping notice</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                        <path
                            d="M5.22 5.22a.75.75 0 0 1 1.06 0L10 8.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L11.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 0-1.06Z"
                        />
                    </svg>
                </button>
            </div>
        </div>

        <div class="fixed inset-x-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur" :style="{ top: `${topOffset}px` }">
            <div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4">
                <NuxtLink to="/" class="shrink-0">
                    <NuxtImage
                        src="/images/logo.svg"
                        alt="Ecommerce logo"
                        width="128"
                        height="28"
                        loading="eager"
                        class="h-6 w-auto sm:h-7"
                    />
                </NuxtLink>

                <nav class="hidden items-center gap-5 xl:flex" aria-label="Main navigation">
                    <NuxtLink class="text-base font-semibold text-slate-700 hover:text-brand-700" :to="ALL_PRODUCTS_URL_HANDLE"
                    >All products</NuxtLink
                    >
                    <NuxtLink class="text-base font-semibold text-slate-700 hover:text-brand-700" to="/special-offers"
                    >Special offers</NuxtLink
                    >
                    <NuxtLink
                        v-for="cat in categories"
                        :key="cat.id"
                        class="text-base font-semibold text-slate-700 hover:text-brand-700"
                        :to="`${CATEGORY_HANDLE}/${cat.handle}`"
                    >
                        {{ cat.name }}
                    </NuxtLink>
                </nav>

                <div class="flex items-center gap-2">
                    <label class="hidden items-center gap-2 lg:flex">
                        <span class="hidden items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 xl:flex">
                            <svg
                                viewBox="0 0 20 20"
                                fill="none"
                                class="h-4 w-4"
                                stroke="currentColor"
                                stroke-width="1.6"
                                aria-hidden="true"
                            >
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
                        <select
                            v-model="locationValue"
                            class="ui-input site-header__country-select max-w-[170px] pr-8 text-sm xl:max-w-[190px]"
                            :disabled="selectionLoading"
                        >
                            <option v-for="country in locationItems" :key="country.value" :value="country.value">
                                {{ country.title }}
                            </option>
                        </select>
                    </label>

                    <button type="button" class="ui-icon-btn" @click="openSearchDialog">
                        <span class="sr-only">Search products</span>
                        <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-3.5-3.5" stroke-linecap="round" />
                        </svg>
                    </button>

                    <NuxtLink to="/cart" class="relative inline-flex">
                        <span class="ui-icon-btn">
                            <span class="sr-only">Open cart</span>
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                class="h-5 w-5"
                                stroke="currentColor"
                                stroke-width="1.8"
                                aria-hidden="true"
                            >
                                <path
                                    d="M3 4h2l1.2 9.2a2 2 0 0 0 2 1.8h7.7a2 2 0 0 0 2-1.5L20 7H7"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                                <circle cx="10" cy="19" r="1.4" />
                                <circle cx="17" cy="19" r="1.4" />
                            </svg>
                        </span>
                        <ClientOnly>
                            <span
                                v-if="itemCount"
                                class="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-semibold text-white"
                            >
                                {{ itemCount < 99 ? itemCount : "99+" }}
                            </span>
                        </ClientOnly>
                    </NuxtLink>

                    <NuxtLink
                        v-if="customer?.id"
                        class="hidden items-center rounded-full border border-slate-200 px-3 py-2 text-base font-semibold text-slate-700 hover:text-brand-700 xl:inline-flex"
                        to="/account"
                    >
                        {{ customer.first_name ?? "Profile" }}
                    </NuxtLink>
                    <NuxtLink
                        v-else
                        class="hidden items-center rounded-full border border-slate-200 px-3 py-2 text-base font-semibold text-slate-700 hover:text-brand-700 xl:inline-flex"
                        to="/signin"
                    >
                        Sign in
                    </NuxtLink>

                    <button type="button" class="ui-icon-btn xl:hidden" @click="drawer = true">
                        <span class="sr-only">Open menu</span>
                        <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                            <path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <transition name="fade">
            <div v-if="drawer" class="fixed inset-0 z-[60] bg-slate-950/40" @click="closeDrawer"></div>
        </transition>

        <aside
            class="fixed right-0 z-[65] h-screen w-[300px] border-l border-slate-200 bg-white px-4 pb-6 pt-4 shadow-panel transition-transform duration-300 sm:w-[320px]"
            :class="drawer ? 'translate-x-0' : 'translate-x-full'"
            :style="{ top: `${topOffset + headerHeight}px`, height: `calc(100vh - ${topOffset + headerHeight}px)` }"
            aria-label="Mobile navigation"
        >
            <div class="flex items-center justify-between">
                <h2 class="text-base font-semibold text-slate-900">Menu</h2>
                <button type="button" class="ui-icon-btn" @click="closeDrawer">
                    <span class="sr-only">Close menu</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                        <path
                            d="M5.22 5.22a.75.75 0 0 1 1.06 0L10 8.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L11.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 0-1.06Z"
                        />
                    </svg>
                </button>
            </div>

            <label class="mt-4 block">
                <span class="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Country</span>
                <select v-model="locationValue" class="ui-input site-header__country-select rounded-xl" :disabled="selectionLoading">
                    <option v-for="country in locationItems" :key="country.value" :value="country.value">
                        {{ country.title }}
                    </option>
                </select>
            </label>

            <nav class="mt-5 grid gap-1" aria-label="Mobile links">
                <NuxtLink
                    class="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    :to="ALL_PRODUCTS_URL_HANDLE"
                    @click="closeDrawer"
                >
                    All products
                </NuxtLink>
                <NuxtLink
                    class="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    to="/special-offers"
                    @click="closeDrawer"
                >
                    Special offers
                </NuxtLink>
                <NuxtLink
                    v-for="cat in categories"
                    :key="cat.id"
                    class="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    :to="`${CATEGORY_HANDLE}/${cat.handle}`"
                    @click="closeDrawer"
                >
                    {{ cat.name }}
                </NuxtLink>
                <NuxtLink
                    v-if="customer?.id"
                    class="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    to="/account"
                    @click="closeDrawer"
                >
                    Profile
                </NuxtLink>
                <NuxtLink
                    v-else
                    class="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    to="/signin"
                    @click="closeDrawer"
                >
                    Sign in
                </NuxtLink>
            </nav>
        </aside>

        <transition name="fade">
            <div v-if="searchDialog" class="fixed inset-0 z-[70] bg-slate-900/60 p-4 md:p-6" @click.self="closeSearchDialog">
                <section
                    class="mx-auto mt-14 max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel"
                >
                    <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3 md:px-6">
                        <h2 class="text-lg font-semibold text-slate-900">Search products</h2>
                        <button type="button" class="ui-icon-btn" @click="closeSearchDialog">
                            <span class="sr-only">Close search</span>
                            <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                                <path
                                    d="M5.22 5.22a.75.75 0 0 1 1.06 0L10 8.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L11.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 0-1.06Z"
                                />
                            </svg>
                        </button>
                    </div>

                    <div class="border-b border-slate-200 px-4 py-3 md:px-6">
                        <label>
                            <span class="sr-only">Search by product name</span>
                            <input
                                v-model="searchQuery"
                                class="ui-input rounded-xl"
                                placeholder="Search by product name (min 3 chars)..."
                            />
                        </label>
                        <p class="mt-2 text-sm text-slate-600">
                            <span v-if="normalizedSearchQuery.length < 3">Type at least 3 characters</span>
                            <span v-else-if="searchLoading">Searching...</span>
                            <span v-else-if="searchHasSearched"
                            >{{ searchResults.length }} result{{ searchResults.length === 1 ? "" : "s" }}</span
                            >
                        </p>
                    </div>

                    <div class="max-h-[58vh] overflow-y-auto px-4 py-2 md:px-6 md:py-3">
                        <div v-if="searchLoading" class="flex items-center justify-center py-12" role="status" aria-live="polite">
                            <span class="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-brand-700"></span>
                        </div>

                        <p v-else-if="searchHasSearched && !searchResults.length" class="py-8 text-sm text-slate-600">No products found.</p>

                        <NuxtLink
                            v-for="product in searchResults"
                            :key="product.id"
                            class="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-slate-50"
                            :to="getProductPath(product.handle)"
                            @click="closeSearchDialog"
                        >
                            <NuxtImage
                                :src="product.thumbnail || product.images?.[0]?.url || '/images/about_banner.webp'"
                                :alt="product.title || 'Product image'"
                                width="80"
                                height="80"
                                class="h-20 w-20 rounded-lg bg-slate-100 object-cover"
                            />
                            <div class="min-w-0 flex-1">
                                <p class="truncate text-sm font-semibold text-slate-900">{{ product.title }}</p>
                                <p class="truncate text-xs font-medium text-slate-600">{{ getProductMeta(product) }}</p>
                            </div>
                            <span class="text-xs font-semibold text-slate-400">Open</span>
                        </NuxtLink>
                    </div>
                </section>
            </div>
        </transition>
    </header>
</template>

<style scoped>
.site-header__country-select {
    border: 2px solid #334155;
    background-color: #ffffff;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
