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
const regionId = computed<string>(() => regionStoreId.value ?? "")
const locationItems = computed(() =>
    availableCountries.value.map((country) => ({
        title: country.display_name || country.iso_2.toUpperCase(),
        value: country.iso_2
    }))
)
const locationLabel = computed<string>(() => "Country")
const locationValue = computed<string>({
    get: () => selectedCountryCode.value ?? "",
    set: (value) => {
        void updateLocation(value)
    }
})

const runSearch = debounce(async (value: string) => {
    if (value.length < 2) {
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
}, 260)

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
    const query = value.trim()
    if (!searchDialog.value) {
        return
    }
    runSearch(query)
})

function openSearchDialog(): void {
    searchDialog.value = true
}

function closeSearchDialog(): void {
    searchDialog.value = false
}

async function updateLocation(value: string): Promise<void> {
    if (!value) {
        return
    }

    const isSameSelection = value === selectedCountryCode.value
    if (isSameSelection) {
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
</script>

<template>
    <header class="site-header">
        <div v-if="!bannerHidden" class="site-header__notice">
            <div class="site-header__notice-inner">
                <div class="site-header__notice-content">
                    <VIcon size="18" class="site-header__notice-icon">mdi-truck-fast</VIcon>
                    <span>Free shipping on 35 €</span>
                </div>
                <VBtn icon size="x-small" variant="text" class="site-header__notice-close" @click="bannerHidden = true">
                    <VIcon size="18">mdi-close</VIcon>
                </VBtn>
            </div>
        </div>

        <VAppBar app color="white" elevation="0" height="64" class="site-header__app-bar" :style="{ top: `${topOffset}px` }">
            <VContainer>
                <VRow align="center" justify="space-between" no-gutters class="w-100 no-wrap">
                    <VCol class="site-header__logo-col" cols="auto">
                        <NuxtLink class="site-header__logo-link" to="/">
                            <NuxtImg src="/images/logo.svg" alt="Ecommerce logo" />
                        </NuxtLink>
                    </VCol>

                    <nav class="hidden-md-and-down site-header__nav">
                        <NuxtLink class="site-header__nav-link" :to="ALL_PRODUCTS_URL_HANDLE">All products</NuxtLink>
                        <NuxtLink class="site-header__nav-link" to="/special-offers">Special offers</NuxtLink>
                        <NuxtLink
                            v-for="cat in categories"
                            :key="cat.id"
                            class="site-header__nav-link"
                            :to="`${CATEGORY_HANDLE}/${cat.handle}`"
                        >
                            {{ cat.name }}
                        </NuxtLink>
                    </nav>

                    <VCol cols="auto" class="d-flex align-center">
                        <VToolbarItems class="d-flex align-center">
                            <VSelect
                                v-model="locationValue"
                                :items="locationItems"
                                :label="locationLabel"
                                item-title="title"
                                item-value="value"
                                density="compact"
                                variant="outlined"
                                hide-details
                                rounded="pill"
                                class="hidden-sm-and-down site-header__location-select"
                                :loading="selectionLoading"
                            />

                            <VBtn icon class="site-header__icon-btn" @click="openSearchDialog">
                                <VIcon>mdi-magnify</VIcon>
                            </VBtn>

                            <NuxtLink to="/cart" class="position-relative">
                                <VBtn icon class="site-header__icon-btn">
                                    <VIcon>mdi-cart</VIcon>
                                    <ClientOnly>
                                        <VBadge
                                            v-if="itemCount"
                                            :content="itemCount < 99 ? itemCount : '99+'"
                                            color="error"
                                            overlap
                                            bordered
                                            class="site-header__cart-counter"
                                        />
                                    </ClientOnly>
                                </VBtn>
                            </NuxtLink>

                            <NuxtLink v-if="customer?.id" class="hidden-md-and-down" to="/account">
                                <VBtn variant="text" class="site-header__account-btn">
                                    <VIcon>mdi-account</VIcon>
                                    <span class="ms-2 site-header__truncate">{{ customer.first_name ?? "Profile" }}</span>
                                </VBtn>
                            </NuxtLink>
                            <NuxtLink v-else class="hidden-md-and-down" to="/signin">
                                <VBtn variant="text" class="site-header__account-btn">
                                    <VIcon>mdi-account</VIcon>
                                    <span class="ms-2">Sign In</span>
                                </VBtn>
                            </NuxtLink>
                        </VToolbarItems>

                        <VBtn icon class="hidden-lg-and-up site-header__icon-btn" @click="drawer = !drawer">
                            <VIcon>mdi-menu</VIcon>
                        </VBtn>
                    </VCol>
                </VRow>
            </VContainer>
        </VAppBar>

        <VNavigationDrawer v-model="drawer" temporary touchless location="right" width="260" :style="{ paddingTop: `${topOffset}px` }">
            <VList nav>
                <VListItem>
                    <VSelect
                        v-model="locationValue"
                        :items="locationItems"
                        :label="locationLabel"
                        item-title="title"
                        item-value="value"
                        density="comfortable"
                        variant="outlined"
                        hide-details
                        rounded="pill"
                        class="site-header__drawer-select"
                        :loading="selectionLoading"
                    />
                </VListItem>
                <VListItem>
                    <NuxtLink class="site-header__drawer-link" :to="ALL_PRODUCTS_URL_HANDLE">All products</NuxtLink>
                </VListItem>
                <VListItem>
                    <NuxtLink class="site-header__drawer-link" to="/special-offers">Special offers</NuxtLink>
                </VListItem>
                <VListItem v-for="cat in categories" :key="cat.id">
                    <NuxtLink class="site-header__drawer-link" :to="`${CATEGORY_HANDLE}/${cat.handle}`">
                        {{ cat.name }}
                    </NuxtLink>
                </VListItem>
                <VListItem>
                    <NuxtLink v-if="customer?.id" class="site-header__drawer-link" to="/account">Profile</NuxtLink>
                    <NuxtLink v-else class="site-header__drawer-link" to="/signin">Sign In</NuxtLink>
                </VListItem>
            </VList>
        </VNavigationDrawer>

        <VDialog v-model="searchDialog" max-width="760" scrollable>
            <VCard class="search-window">
                <div class="search-window__top">
                    <h2 class="search-window__title">Search products</h2>
                    <VBtn icon variant="text" @click="closeSearchDialog">
                        <VIcon>mdi-close</VIcon>
                    </VBtn>
                </div>

                <VTextField
                    v-model="searchQuery"
                    placeholder="Search by product name..."
                    density="comfortable"
                    variant="solo-filled"
                    hide-details
                    clearable
                    prepend-inner-icon="mdi-magnify"
                    class="search-window__input"
                />

                <div class="search-window__summary">
                    <span v-if="normalizedSearchQuery.length < 2">Type at least 2 characters</span>
                    <span v-else-if="searchLoading">Searching...</span>
                    <span v-else-if="searchHasSearched">{{ searchResults.length }} result{{ searchResults.length === 1 ? "" : "s" }}</span>
                </div>

                <div class="search-window__results">
                    <div v-if="searchLoading" class="search-window__state">
                        <VProgressCircular indeterminate size="28" color="primary" />
                    </div>

                    <div v-else-if="searchHasSearched && !searchResults.length" class="search-window__state">No products found.</div>

                    <NuxtLink
                        v-for="product in searchResults"
                        :key="product.id"
                        :to="product.handle ? `${PRODUCT_URL_HANDLE}/${product.handle}` : '#'"
                        class="search-window__item"
                        @click="closeSearchDialog"
                    >
                        <NuxtImg
                            :src="product.thumbnail || product.images?.[0]?.url || '/images/about_banner.webp'"
                            :alt="product.title || 'Product image'"
                            width="80"
                            height="80"
                            format="webp"
                            class="search-window__thumb"
                        />
                        <div class="search-window__item-content">
                            <p class="search-window__item-title">{{ product.title }}</p>
                            <p class="search-window__item-meta">{{ product.subtitle || product.handle }}</p>
                        </div>
                        <VIcon size="18" class="search-window__item-arrow">mdi-chevron-right</VIcon>
                    </NuxtLink>
                </div>
            </VCard>
        </VDialog>
    </header>
</template>

<style scoped lang="scss">
.site-header {
    position: sticky;
    top: 0;
    z-index: 1100;
}

.site-header__notice {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 32px;
    background: linear-gradient(90deg, #010c80 0%, #0043c8 100%);
    color: #ffffff;
    z-index: 1102;
}

.site-header__notice-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 0.75rem;
}

.site-header__notice-content {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.83rem;
    font-weight: 600;
    line-height: 1.2;
}

.site-header__notice-close {
    color: #ffffff;
}

.site-header__app-bar {
    border-bottom: 1px solid rgba(1, 12, 128, 0.08);
    background: rgba(255, 255, 255, 0.92) !important;
    backdrop-filter: blur(10px);
}

.site-header__logo-col {
    max-width: 200px;
    flex-grow: 1;
    flex-shrink: 1;
}

.site-header__logo-link {
    display: flex;
    align-items: center;
}

.site-header__logo-link img {
    max-width: 100%;
    height: auto;
    object-fit: contain;
}

.site-header__nav {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 0.35rem;
}

.site-header__nav-link {
    padding: 0.4rem 0.75rem;
    border-radius: 999px;
    color: #203255;
    font-size: 0.92rem;
    font-weight: 600;
    text-decoration: none;
    transition:
        color 0.22s ease,
        background-color 0.22s ease;
}

.site-header__nav-link:hover {
    background: rgba(1, 12, 128, 0.08);
    color: #010c80;
}

.site-header__icon-btn {
    color: #1d2f53;
}

.site-header__location-select {
    width: 180px;
    margin-right: 0.25rem;
}

.site-header__account-btn {
    color: #1d2f53;
    font-weight: 600;
    text-transform: none;
}

.site-header__cart-counter {
    position: absolute;
    top: 0;
    right: 10px;
}

.site-header__truncate {
    display: inline-block;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
}

.site-header__drawer-link {
    color: #23365b;
    font-weight: 600;
    text-decoration: none;
}

.site-header__drawer-select {
    margin: 0.35rem 0;
}

.search-window {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.2rem;
    background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
    box-shadow: 0 18px 50px rgba(9, 29, 88, 0.12);
}

.search-window__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.95rem 1rem 0.7rem;
    border-bottom: 1px solid rgba(8, 23, 63, 0.06);
}

.search-window__title {
    margin: 0;
    color: #08173f;
    font-size: 1.15rem;
    font-weight: 700;
}

.search-window__input {
    padding: 0.75rem 1rem 0.35rem;
}

.search-window__summary {
    padding: 0 1rem 0.7rem;
    color: #667694;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.02em;
}

.search-window__results {
    max-height: 420px;
    overflow-y: auto;
    padding: 0 1rem 1rem;
    display: grid;
    gap: 0.45rem;
}

.search-window__state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 120px;
    color: #53607b;
    font-size: 0.95rem;
    text-align: center;
}

.search-window__item {
    display: grid;
    grid-template-columns: 72px 1fr auto;
    gap: 0.8rem;
    align-items: center;
    padding: 0.55rem 0.65rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 0.8rem;
    background: rgba(255, 255, 255, 0.82);
    text-decoration: none;
    transition:
        background-color 0.22s ease,
        border-color 0.22s ease,
        transform 0.22s ease;
}

.search-window__item:hover {
    background: rgba(1, 12, 128, 0.04);
    border-color: rgba(1, 12, 128, 0.18);
    transform: translateY(-1px);
}

.search-window__thumb {
    width: 72px;
    height: 72px;
    border-radius: 0.65rem;
    object-fit: cover;
}

.search-window__item-content {
    min-width: 0;
}

.search-window__item-title {
    margin: 0 0 0.2rem;
    color: #08173f;
    font-size: 0.95rem;
    font-weight: 700;
    line-height: 1.35;
}

.search-window__item-meta {
    margin: 0;
    color: #607090;
    font-size: 0.82rem;
    line-height: 1.45;
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}

.search-window__item-arrow {
    color: #6c7d9d;
}

@media screen and (max-width: 1024px) {
    .site-header__notice-inner {
        padding: 0 0.55rem;
    }

    .search-window__item {
        grid-template-columns: 64px 1fr auto;
        gap: 0.65rem;
    }

    .search-window__thumb {
        width: 64px;
        height: 64px;
    }
}
</style>
