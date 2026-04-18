<script setup lang="ts">
import debounce from "lodash-es/debounce"

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
const isClientHydrated = ref<boolean>(false)

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

onMounted(() => {
    isClientHydrated.value = true
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

        reloadNuxtApp({ path: route.fullPath })
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
            class="fixed inset-x-0 top-0 z-50 h-8 border-b border-white/10 bg-[linear-gradient(90deg,#0f172a_0%,#1e293b_52%,#334155_100%)] text-white"
        >
            <div class="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4">
                <p class="truncate text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-slate-100">
                    Free shipping on orders over 35 EUR
                </p>
                <button
                    type="button"
                    class="inline-flex min-h-7 min-w-7 items-center justify-center rounded-full border border-white/15 bg-white/8 text-slate-100 transition hover:bg-white/14 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/25"
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

        <div
            class="fixed inset-x-0 z-40 border-b border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] shadow-[0_14px_38px_rgba(8,27,90,0.06)] backdrop-blur-xl"
            :style="{ top: `${topOffset}px` }"
        >
            <div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4">
                <NuxtLink to="/" class="inline-flex shrink-0 items-center">
                    <img
                        src="/images/logo.svg"
                        alt="Medusa Commerce"
                        width="640"
                        height="144"
                        fetchpriority="high"
                        class="site-header__logo"
                    />
                </NuxtLink>

                <nav class="hidden items-center gap-5 xl:flex" aria-label="Main navigation">
                    <NuxtLink class="text-base font-semibold text-slate-700 transition hover:text-amber-900" :to="ALL_PRODUCTS_URL_HANDLE">
                        All products
                    </NuxtLink>
                    <NuxtLink class="text-base font-semibold text-slate-700 transition hover:text-amber-900" to="/special-offers">
                        Special offers
                    </NuxtLink>
                    <NuxtLink
                        v-for="cat in categories"
                        :key="cat.id"
                        class="text-base font-semibold text-slate-700 transition hover:text-amber-900"
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
                            v-if="isClientHydrated"
                            v-model="locationValue"
                            class="ui-input site-header__country-select max-w-42.5 pr-8 text-sm xl:max-w-47.5"
                            :disabled="selectionLoading"
                        >
                            <option v-for="country in locationItems" :key="country.value" :value="country.value">
                                {{ country.title }}
                            </option>
                        </select>
                        <span
                            v-else
                            class="ui-input site-header__country-select inline-flex max-w-42.5 items-center pr-8 text-sm xl:max-w-47.5"
                        >
                            Country
                        </span>
                    </label>

                    <button type="button" class="site-header__icon-btn" @click="openSearchDialog">
                        <span class="sr-only">Search products</span>
                        <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-3.5-3.5" stroke-linecap="round" />
                        </svg>
                    </button>

                    <NuxtLink to="/cart" class="relative inline-flex">
                        <span class="site-header__icon-btn">
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
                        <span
                            v-if="isClientHydrated && itemCount"
                            class="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#cda45e] px-1 text-[11px] font-semibold text-slate-950 ring-2 ring-white"
                        >
                            {{ itemCount < 99 ? itemCount : "99+" }}
                        </span>
                    </NuxtLink>

                    <NuxtLink
                        v-if="isClientHydrated && customer?.id"
                        class="hidden items-center rounded-full border border-slate-200 bg-white/85 px-3 py-2 text-base font-semibold text-slate-700 shadow-[0_10px_24px_rgba(8,27,90,0.05)] transition hover:border-amber-200 hover:text-amber-900 xl:inline-flex"
                        to="/account"
                    >
                        Profile
                    </NuxtLink>
                    <NuxtLink
                        v-else
                        class="hidden items-center rounded-full border border-slate-200 bg-white/85 px-3 py-2 text-base font-semibold text-slate-700 shadow-[0_10px_24px_rgba(8,27,90,0.05)] transition hover:border-amber-200 hover:text-amber-900 xl:inline-flex"
                        to="/signin"
                    >
                        Sign in
                    </NuxtLink>

                    <button type="button" class="site-header__icon-btn xl:hidden" @click="drawer = true">
                        <span class="sr-only">Open menu</span>
                        <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                            <path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <transition name="fade">
            <div
                v-if="drawer"
                class="fixed inset-0 z-60 bg-[linear-gradient(180deg,rgba(2,6,23,0.5),rgba(2,6,23,0.66))] backdrop-blur-[2px]"
                @click="closeDrawer"
            ></div>
        </transition>

        <aside
            class="site-drawer fixed right-0 bottom-0 z-65 w-75 border-l border-white/60 sm:w-85"
            :class="drawer ? 'site-drawer--open' : 'site-drawer--closed'"
            :style="{ top: `${topOffset + headerHeight}px` }"
            aria-label="Mobile navigation"
        >
            <div class="site-drawer__inner">
                <div class="site-drawer__top px-4 pb-4 pt-4">
                    <div
                        class="mb-4 h-px w-full bg-[linear-gradient(90deg,rgba(148,163,184,0),rgba(202,138,4,0.45),rgba(148,163,184,0))]"
                    ></div>

                    <div class="flex items-center justify-between gap-3">
                        <div>
                            <p
                                class="inline-flex rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-amber-900"
                            >
                                Navigation
                            </p>
                            <h2 class="mt-3 text-lg font-semibold tracking-[-0.03em] text-slate-950">Menu</h2>
                        </div>

                        <button type="button" class="site-header__icon-btn" @click="closeDrawer">
                            <span class="sr-only">Close menu</span>
                            <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                                <path
                                    d="M5.22 5.22a.75.75 0 0 1 1.06 0L10 8.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L11.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 0-1.06Z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="site-drawer__scroll px-4 pb-6">
                    <label
                        class="mt-1 block rounded-[1.4rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-4 shadow-[0_14px_32px_rgba(8,27,90,0.06)]"
                    >
                        <span class="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500">Country</span>

                        <select
                            v-if="isClientHydrated"
                            v-model="locationValue"
                            class="ui-input site-header__country-select rounded-xl"
                            :disabled="selectionLoading"
                        >
                            <option v-for="country in locationItems" :key="country.value" :value="country.value">
                                {{ country.title }}
                            </option>
                        </select>

                        <span v-else class="ui-input site-header__country-select inline-flex w-full items-center rounded-xl">
                            Country
                        </span>
                    </label>

                    <nav class="mt-5 grid gap-2" aria-label="Mobile links">
                        <NuxtLink
                            class="rounded-[1.1rem] border border-transparent bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 shadow-[0_10px_24px_rgba(8,27,90,0.04)] transition hover:border-amber-200 hover:bg-white"
                            :to="ALL_PRODUCTS_URL_HANDLE"
                            @click="closeDrawer"
                        >
                            All products
                        </NuxtLink>

                        <NuxtLink
                            class="rounded-[1.1rem] border border-transparent bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 shadow-[0_10px_24px_rgba(8,27,90,0.04)] transition hover:border-amber-200 hover:bg-white"
                            to="/special-offers"
                            @click="closeDrawer"
                        >
                            Special offers
                        </NuxtLink>

                        <NuxtLink
                            v-for="cat in categories"
                            :key="cat.id"
                            class="rounded-[1.1rem] border border-transparent bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 shadow-[0_10px_24px_rgba(8,27,90,0.04)] transition hover:border-amber-200 hover:bg-white"
                            :to="`${CATEGORY_HANDLE}/${cat.handle}`"
                            @click="closeDrawer"
                        >
                            {{ cat.name }}
                        </NuxtLink>

                        <NuxtLink
                            v-if="isClientHydrated && customer?.id"
                            class="rounded-[1.1rem] border border-transparent bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 shadow-[0_10px_24px_rgba(8,27,90,0.04)] transition hover:border-amber-200 hover:bg-white"
                            to="/account"
                            @click="closeDrawer"
                        >
                            Profile
                        </NuxtLink>

                        <NuxtLink
                            v-else
                            class="rounded-[1.1rem] border border-transparent bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 shadow-[0_10px_24px_rgba(8,27,90,0.04)] transition hover:border-amber-200 hover:bg-white"
                            to="/signin"
                            @click="closeDrawer"
                        >
                            Sign in
                        </NuxtLink>
                    </nav>
                </div>
            </div>
        </aside>

        <transition name="fade">
            <div
                v-if="searchDialog"
                class="fixed inset-0 z-70 bg-[linear-gradient(180deg,rgba(2,6,23,0.6),rgba(2,6,23,0.74))] p-4 backdrop-blur-xs md:p-6"
                @click.self="closeSearchDialog"
            >
                <section
                    class="mx-auto mt-14 max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-[1.8rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,248,252,0.94))] shadow-[0_30px_90px_rgba(2,6,23,0.26)]"
                >
                    <div class="border-b border-slate-200/80 px-4 py-4 md:px-6">
                        <div
                            class="mb-4 h-px w-full bg-[linear-gradient(90deg,rgba(148,163,184,0),rgba(202,138,4,0.45),rgba(148,163,184,0))]"
                        ></div>
                        <div class="flex items-center justify-between gap-3">
                            <div>
                                <p
                                    class="inline-flex rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-amber-900"
                                >
                                    Search
                                </p>
                                <h2 class="mt-3 text-lg font-semibold tracking-[-0.03em] text-slate-950">Search products</h2>
                            </div>
                            <button type="button" class="site-header__icon-btn" @click="closeSearchDialog">
                                <span class="sr-only">Close search</span>
                                <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                                    <path
                                        d="M5.22 5.22a.75.75 0 0 1 1.06 0L10 8.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L11.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 0-1.06Z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="border-b border-slate-200/80 px-4 py-4 md:px-6">
                        <label>
                            <span class="sr-only">Search by product name</span>
                            <input
                                v-model="searchQuery"
                                class="ui-input site-header__search-input rounded-2xl"
                                placeholder="Search by product name (min 3 chars)..."
                            />
                        </label>
                        <p class="mt-2 text-sm text-slate-600">
                            <span v-if="normalizedSearchQuery.length < 3">Type at least 3 characters</span>
                            <span v-else-if="searchLoading">Searching...</span>
                            <span v-else-if="searchHasSearched">
                                {{ searchResults.length }} result{{ searchResults.length === 1 ? "" : "s" }}
                            </span>
                        </p>
                    </div>

                    <div class="max-h-[58vh] overflow-y-auto px-4 py-3 md:px-6 md:py-4">
                        <div v-if="searchLoading" class="flex items-center justify-center py-12" role="status" aria-live="polite">
                            <span class="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-amber-700"></span>
                        </div>

                        <div
                            v-else-if="searchHasSearched && !searchResults.length"
                            class="rounded-[1.4rem] border border-white/80 bg-white/80 px-4 py-8 text-center text-sm text-slate-600 shadow-[0_14px_30px_rgba(8,27,90,0.05)]"
                        >
                            No products found.
                        </div>

                        <NuxtLink
                            v-for="product in searchResults"
                            :key="product.id"
                            class="flex items-center gap-3 rounded-[1.2rem] border border-transparent bg-white/72 px-3 py-3 shadow-[0_10px_24px_rgba(8,27,90,0.04)] transition hover:border-amber-200 hover:bg-white"
                            :to="getProductPath(product.handle)"
                            @click="closeSearchDialog"
                        >
                            <NuxtImage
                                :src="product.thumbnail || product.images?.[0]?.url || '/images/about_banner.webp'"
                                :alt="product.title || 'Product image'"
                                width="80"
                                height="80"
                                class="h-20 w-20 rounded-[0.95rem] bg-slate-100 object-cover"
                            />
                            <div class="min-w-0 flex-1">
                                <p class="truncate text-sm font-semibold text-slate-950">{{ product.title }}</p>
                                <p class="truncate text-xs font-medium tracking-[0.03em] text-slate-600">{{ getProductMeta(product) }}</p>
                            </div>
                            <span class="text-xs font-semibold tracking-[0.08em] text-amber-900">Open</span>
                        </NuxtLink>
                    </div>
                </section>
            </div>
        </transition>
    </header>
</template>

<style scoped>
.site-header__country-select {
    border: 1px solid rgba(148, 163, 184, 0.45);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
    box-shadow: 0 10px 24px rgba(8, 27, 90, 0.05);
    color: #0f172a;
}

.site-header__search-input {
    border: 1px solid rgba(148, 163, 184, 0.45);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
    box-shadow: 0 10px 24px rgba(8, 27, 90, 0.05);
    color: #0f172a;
}

.site-header__icon-btn {
    display: inline-flex;
    min-height: 2.75rem;
    min-width: 2.75rem;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(148, 163, 184, 0.32);
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9));
    color: #334155;
    box-shadow: 0 10px 24px rgba(8, 27, 90, 0.05);
    transition:
        color 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.site-header__icon-btn:hover {
    color: #78350f;
    border-color: rgba(253, 230, 138, 0.9);
    box-shadow: 0 14px 30px rgba(8, 27, 90, 0.08);
    transform: translateY(-1px);
}

.site-header__icon-btn:focus-visible {
    outline: 2px solid rgba(253, 230, 138, 0.9);
    outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
    .site-header__icon-btn {
        transition: none;
    }
}

.site-header__logo {
    display: block;
    height: 2rem;
    width: auto;
}

@media (min-width: 640px) {
    .site-header__logo {
        height: 2.25rem;
    }
}

.site-drawer {
    background: linear-gradient(180deg, #fbfcfe 0%, #f6f8fc 58%, #f2f5fa 100%);
    box-shadow: -12px 0 32px rgba(2, 6, 23, 0.14);
    transform: translate3d(100%, 0, 0);
    transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
    backface-visibility: hidden;
    contain: layout paint style;
    overflow: hidden;
}

.site-drawer--open {
    transform: translate3d(0, 0, 0);
}

.site-drawer--closed {
    transform: translate3d(100%, 0, 0);
}

.site-drawer__inner {
    display: flex;
    height: 100%;
    min-height: 0;
    flex-direction: column;
}

.site-drawer__top {
    flex: 0 0 auto;
}

.site-drawer__scroll {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
}
</style>
