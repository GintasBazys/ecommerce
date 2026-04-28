<script setup lang="ts">
import BaseSelect from "~/components/Shared/BaseSelect.vue"

const LazyHeaderSearchDialog = defineAsyncComponent(() => import("~/components/Header/BaseHeaderSearchDialog.vue"))
const LazyHeaderMobileDrawer = defineAsyncComponent(() => import("~/components/Header/BaseHeaderMobileDrawer.vue"))

const drawer = ref<boolean>(false)
const searchDialog = ref<boolean>(false)
const selectionLoading = ref<boolean>(false)
const currentAnnouncementIndex = ref<number>(0)
const announcementBarDismissed = useCookie<boolean>("announcement_bar_dismissed", {
    default: () => false,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    path: "/"
})

type AnnouncementMessage = {
    id: string
    message: string
    link_url?: string | null
    is_active: boolean
    starts_at?: string | null
    ends_at?: string | null
    sort_order: number
}

type AnnouncementBarResponse = {
    announcement_messages: AnnouncementMessage[]
}

const route = useRoute()

const { data: announcementBarData } = await useAsyncData<AnnouncementBarResponse>(
    "announcement-bar-messages",
    () => $fetch("/api/announcement-bar/messages"),
    {
        default: () => ({
            announcement_messages: []
        })
    }
)

const regionStore = useRegionStore()
const { customer } = storeToRefs(useCustomerStore())
const { itemCount } = storeToRefs(useCartStore())
const { categories } = storeToRefs(useProductStore())
const { regionStoreId, availableCountries, selectedCountryCode } = storeToRefs(regionStore)

const announcementMessages = computed<AnnouncementMessage[]>(() => announcementBarData.value?.announcement_messages || [])
const currentAnnouncement = computed<AnnouncementMessage | null>(() => announcementMessages.value[currentAnnouncementIndex.value] || null)
const hasMultipleAnnouncements = computed<boolean>(() => announcementMessages.value.length > 1)
const announcementBarVisible = computed<boolean>(() => announcementMessages.value.length > 0 && !announcementBarDismissed.value)
const topOffset = computed<number>(() => (announcementBarVisible.value ? 40 : 0))
const headerHeight = 64
const headerOffset = computed<number>(() => (announcementBarVisible.value ? headerHeight + 40 : headerHeight))
const regionId = computed<string>(() => regionStoreId.value ?? "")

useHead(() => ({
    style: [
        {
            key: "site-header-offset-css",
            textContent: `:root{--site-header-offset:${headerOffset.value}px}`
        }
    ]
}))

let announcementRotationInterval: number | null = null

const locationItems = computed(() =>
    availableCountries.value.map((country) => ({
        title: country.display_name || country.iso_2.toUpperCase(),
        value: country.iso_2
    }))
)

const locationValue = computed<string>(() => selectedCountryCode.value ?? "")

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

watch(
    announcementMessages,
    (messages) => {
        if (!messages.length) {
            currentAnnouncementIndex.value = 0
            return
        }

        if (currentAnnouncementIndex.value >= messages.length) {
            currentAnnouncementIndex.value = 0
        }
    },
    { immediate: true }
)

onBeforeUnmount(() => {
    if (!import.meta.client) {
        return
    }

    stopAnnouncementRotation()
    document.documentElement.style.removeProperty("--site-header-offset")
})

onMounted(() => {
    syncAnnouncementRotation()
})

watch([announcementBarVisible, hasMultipleAnnouncements], () => {
    if (!import.meta.client) {
        return
    }

    syncAnnouncementRotation()
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

function showPreviousAnnouncement(): void {
    if (!announcementMessages.value.length) {
        return
    }

    currentAnnouncementIndex.value =
        (currentAnnouncementIndex.value - 1 + announcementMessages.value.length) % announcementMessages.value.length
}

function showNextAnnouncement(): void {
    if (!announcementMessages.value.length) {
        return
    }

    currentAnnouncementIndex.value = (currentAnnouncementIndex.value + 1) % announcementMessages.value.length
}

function stopAnnouncementRotation(): void {
    if (announcementRotationInterval !== null) {
        window.clearInterval(announcementRotationInterval)
        announcementRotationInterval = null
    }
}

function syncAnnouncementRotation(): void {
    stopAnnouncementRotation()

    if (!announcementBarVisible.value || !hasMultipleAnnouncements.value) {
        return
    }

    announcementRotationInterval = window.setInterval(() => {
        showNextAnnouncement()
    }, 5000)
}

function dismissAnnouncementBar(): void {
    announcementBarDismissed.value = true
    stopAnnouncementRotation()
}
</script>

<template>
    <header class="relative z-50">
        <div
            v-if="announcementBarVisible && currentAnnouncement"
            class="fixed inset-x-0 top-0 z-50 h-10 border-b border-white/10 bg-linear-to-r from-slate-900 via-slate-800 to-slate-700 text-white"
        >
            <div class="mx-auto flex h-full w-full max-w-7xl items-center gap-2 px-3 sm:px-4">
                <div class="flex w-20 shrink-0 items-center gap-1">
                    <button
                        v-if="hasMultipleAnnouncements"
                        type="button"
                        class="inline-flex min-h-8 min-w-8 items-center justify-center rounded-full border border-white/15 bg-white/8 text-slate-100 transition hover:bg-white/14 hover:text-white focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:outline-hidden"
                        @click="showPreviousAnnouncement"
                    >
                        <span class="sr-only">Previous announcement</span>
                        <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                            <path
                                fill-rule="evenodd"
                                d="M12.78 4.47a.75.75 0 0 1 0 1.06L8.31 10l4.47 4.47a.75.75 0 0 1-1.06 1.06l-5-5a.75.75 0 0 1 0-1.06l5-5a.75.75 0 0 1 1.06 0Z"
                                clip-rule="evenodd"
                            />
                        </svg>
                    </button>
                </div>

                <component
                    :is="currentAnnouncement.link_url ? 'a' : 'div'"
                    :href="currentAnnouncement.link_url || undefined"
                    class="min-w-0 flex-1 text-center"
                >
                    <p
                        class="text-label-xs tracking-label-tight truncate font-semibold text-slate-100 uppercase"
                        :class="currentAnnouncement.link_url ? 'transition hover:text-white hover:underline' : ''"
                        aria-live="polite"
                    >
                        {{ currentAnnouncement.message }}
                    </p>
                </component>

                <div class="flex w-20 shrink-0 items-center justify-end gap-1">
                    <button
                        v-if="hasMultipleAnnouncements"
                        type="button"
                        class="inline-flex min-h-8 min-w-8 items-center justify-center rounded-full border border-white/15 bg-white/8 text-slate-100 transition hover:bg-white/14 hover:text-white focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:outline-hidden"
                        @click="showNextAnnouncement"
                    >
                        <span class="sr-only">Next announcement</span>
                        <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                            <path
                                fill-rule="evenodd"
                                d="M7.22 15.53a.75.75 0 0 1 0-1.06L11.69 10 7.22 5.53a.75.75 0 1 1 1.06-1.06l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 0 1-1.06 0Z"
                                clip-rule="evenodd"
                            />
                        </svg>
                    </button>

                    <button
                        type="button"
                        class="inline-flex min-h-8 min-w-8 items-center justify-center rounded-full border border-white/15 bg-white/8 text-slate-100 transition hover:bg-white/14 hover:text-white focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:outline-hidden"
                        @click="dismissAnnouncementBar"
                    >
                        <span class="sr-only">Dismiss announcement bar</span>
                        <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                            <path
                                d="M5.22 5.22a.75.75 0 0 1 1.06 0L10 8.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L11.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 0-1.06Z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <div
            class="shadow-panel fixed inset-x-0 z-40 border-b border-white/70 bg-linear-to-b from-white/95 to-slate-50/90 backdrop-blur-xl"
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
                        class="block h-8 w-auto sm:h-9"
                    />
                </NuxtLink>

                <nav class="hidden items-center gap-5 xl:flex" aria-label="Main navigation">
                    <NuxtLink class="text-base font-semibold text-slate-700 transition hover:text-amber-900" to="/category/all-products">
                        All products
                    </NuxtLink>
                    <NuxtLink class="text-base font-semibold text-slate-700 transition hover:text-amber-900" to="/special-offers">
                        Special offers
                    </NuxtLink>
                    <NuxtLink
                        v-for="cat in categories"
                        :key="cat.id"
                        class="text-base font-semibold text-slate-700 transition hover:text-amber-900"
                        :to="`/category/${cat.handle}`"
                    >
                        {{ cat.name }}
                    </NuxtLink>
                </nav>

                <div class="flex items-center gap-2">
                    <label class="hidden items-center gap-2 lg:flex">
                        <span class="hidden items-center gap-1 text-xs font-semibold tracking-wide text-slate-500 uppercase xl:flex">
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
                        <BaseSelect
                            :model-value="locationValue"
                            class="max-w-44 xl:max-w-48"
                            :options="locationItems"
                            option-label-key="title"
                            :disabled="selectionLoading"
                            @update:model-value="updateLocation(String($event))"
                        />
                    </label>

                    <button
                        type="button"
                        class="shadow-card inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-300/50 bg-linear-to-b from-white to-slate-50 text-slate-700 transition hover:border-amber-200 hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
                        @click="openSearchDialog"
                    >
                        <span class="sr-only">Search products</span>
                        <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-3.5-3.5" stroke-linecap="round" />
                        </svg>
                    </button>

                    <NuxtLink to="/cart" class="relative inline-flex">
                        <span
                            class="shadow-card inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-300/50 bg-linear-to-b from-white to-slate-50 text-slate-700 transition hover:border-amber-200 hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
                        >
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
                            v-if="itemCount"
                            class="bg-accent-500 text-label-xs absolute -top-1 -right-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 font-semibold text-slate-950 ring-2 ring-white"
                        >
                            {{ itemCount < 99 ? itemCount : "99+" }}
                        </span>
                    </NuxtLink>

                    <NuxtLink
                        v-if="customer?.id"
                        class="shadow-card hidden items-center rounded-full border border-slate-200 bg-white/85 px-3 py-2 text-base font-semibold text-slate-700 transition hover:border-amber-200 hover:text-amber-900 xl:inline-flex"
                        to="/account"
                    >
                        Profile
                    </NuxtLink>
                    <NuxtLink
                        v-else
                        class="shadow-card hidden items-center rounded-full border border-slate-200 bg-white/85 px-3 py-2 text-base font-semibold text-slate-700 transition hover:border-amber-200 hover:text-amber-900 xl:inline-flex"
                        to="/signin"
                    >
                        Sign in
                    </NuxtLink>

                    <button
                        type="button"
                        class="shadow-card inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-300/50 bg-linear-to-b from-white to-slate-50 text-slate-700 transition hover:border-amber-200 hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden xl:hidden"
                        @click="drawer = true"
                    >
                        <span class="sr-only">Open menu</span>
                        <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                            <path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <LazyHeaderMobileDrawer
            v-if="drawer"
            :open="drawer"
            :top-offset="topOffset"
            :header-height="headerHeight"
            :categories="categories"
            :location-items="locationItems"
            :location-value="locationValue"
            :selection-loading="selectionLoading"
            :is-signed-in="Boolean(customer?.id)"
            @close="closeDrawer"
            @update-location="updateLocation"
        />

        <LazyHeaderSearchDialog
            v-if="searchDialog"
            :open="searchDialog"
            :region-id="regionId"
            :selected-country-code="selectedCountryCode ?? ''"
            @close="closeSearchDialog"
        />
    </header>
</template>
