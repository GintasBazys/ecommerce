<script setup lang="ts">
import BaseHeaderActions from "./BaseHeaderActions.vue"
import BaseHeaderCatalogMenu from "./BaseHeaderCatalogMenu.vue"

import type { AnnouncementBarResponse, AnnouncementMessage, LocationItem } from "~/types/navigation"

const LazyHeaderSearchDialog = defineAsyncComponent(() => import("~/components/Header/BaseHeaderSearchDialog.vue"))
const LazyHeaderMobileDrawer = defineAsyncComponent(() => import("~/components/Header/BaseHeaderMobileDrawer.vue"))

const drawer = ref<boolean>(false)
const searchDialog = ref<boolean>(false)
const catalogMenuOpen = ref<boolean>(false)
const selectionLoading = ref<boolean>(false)
const currentAnnouncementIndex = ref<number>(0)
const announcementTextWrap = ref<HTMLElement | null>(null)
const announcementText = ref<HTMLElement | null>(null)
const announcementTextOverflows = ref<boolean>(false)
const announcementMarqueeDistance = ref<number>(0)
const announcementMarqueeDuration = ref<number>(0)

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
const { isAuthenticated } = storeToRefs(useCustomerStore())
const { itemCount } = storeToRefs(useCartStore())
const { categories } = storeToRefs(useProductStore())
const { regionStoreId, availableCountries, selectedCountryCode } = storeToRefs(regionStore)

const announcementMessages = computed<AnnouncementMessage[]>(() => announcementBarData.value?.announcement_messages || [])
const currentAnnouncement = computed<AnnouncementMessage | null>(() => announcementMessages.value[currentAnnouncementIndex.value] || null)
const hasMultipleAnnouncements = computed<boolean>(() => announcementMessages.value.length > 1)
const announcementBarVisible = computed<boolean>(() => announcementMessages.value.length > 0)
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
let announcementResizeObserver: ResizeObserver | null = null
let announcementMeasureFrame: number | null = null
const announcementMarqueeGap = 48

const locationItems = computed<LocationItem[]>(() =>
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
        catalogMenuOpen.value = false
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
    cancelAnnouncementTextMeasure()
    announcementResizeObserver?.disconnect()
    document.documentElement.style.removeProperty("--site-header-offset")
})

onMounted(() => {
    syncAnnouncementRotation()
    scheduleAnnouncementTextMeasure()

    announcementResizeObserver = new ResizeObserver(() => {
        scheduleAnnouncementTextMeasure()
    })

    observeAnnouncementTextElements()
})

watch([announcementBarVisible, hasMultipleAnnouncements], () => {
    if (!import.meta.client) {
        return
    }

    syncAnnouncementRotation()

    if (announcementBarVisible.value) {
        scheduleAnnouncementTextMeasure()
        return
    }

    cancelAnnouncementTextMeasure()
    resetAnnouncementTextOverflow()
})

watch(currentAnnouncement, async () => {
    await nextTick()
    observeAnnouncementTextElements()
    scheduleAnnouncementTextMeasure()
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

function cancelAnnouncementTextMeasure(): void {
    if (announcementMeasureFrame !== null) {
        window.cancelAnimationFrame(announcementMeasureFrame)
        announcementMeasureFrame = null
    }
}

function resetAnnouncementTextOverflow(): void {
    announcementTextOverflows.value = false
    announcementMarqueeDistance.value = 0
    announcementMarqueeDuration.value = 0
}

function scheduleAnnouncementTextMeasure(): void {
    if (!import.meta.client) {
        return
    }

    cancelAnnouncementTextMeasure()

    announcementMeasureFrame = window.requestAnimationFrame(() => {
        announcementMeasureFrame = null
        syncAnnouncementTextOverflow()
    })
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

function syncAnnouncementTextOverflow(): void {
    if (!import.meta.client || !announcementBarVisible.value || !announcementTextWrap.value || !announcementText.value) {
        resetAnnouncementTextOverflow()
        return
    }

    const overflowDistance = announcementText.value.scrollWidth - announcementTextWrap.value.clientWidth
    const marqueeDistance = Math.max(announcementText.value.scrollWidth + announcementMarqueeGap, 0)

    announcementTextOverflows.value = overflowDistance > 1
    announcementMarqueeDistance.value = marqueeDistance
    announcementMarqueeDuration.value = Math.min(Math.max(marqueeDistance / 80, 3), 12)
}

function observeAnnouncementTextElements(): void {
    if (!import.meta.client || !announcementResizeObserver) {
        return
    }

    announcementResizeObserver.disconnect()

    if (announcementTextWrap.value) {
        announcementResizeObserver.observe(announcementTextWrap.value)
    }

    if (announcementText.value) {
        announcementResizeObserver.observe(announcementText.value)
    }
}
</script>

<template>
    <header class="relative z-50">
        <div
            v-if="announcementBarVisible && currentAnnouncement"
            class="fixed inset-x-0 top-0 z-50 h-10 border-b border-white/10 bg-linear-to-r from-slate-900 via-slate-800 to-slate-700 text-white"
        >
            <div class="mx-auto flex h-full w-full max-w-7xl items-center px-3 sm:px-4">
                <div class="relative h-full min-w-0 flex-1 overflow-hidden text-center">
                    <Transition name="announcement-slide">
                        <component
                            :is="currentAnnouncement.link_url ? 'a' : 'div'"
                            :key="currentAnnouncement.id"
                            :href="currentAnnouncement.link_url || undefined"
                            class="absolute inset-0 flex min-w-0 items-center justify-center overflow-hidden"
                        >
                            <p ref="announcementTextWrap" class="max-w-full overflow-hidden" aria-live="polite">
                                <span
                                    class="announcement-message-track inline-flex whitespace-nowrap"
                                    :class="[announcementTextOverflows ? 'announcement-message-text--marquee' : '']"
                                    :style="{
                                        '--announcement-marquee-distance': `${announcementMarqueeDistance}px`,
                                        '--announcement-marquee-duration': `${announcementMarqueeDuration}s`
                                    }"
                                >
                                    <span
                                        ref="announcementText"
                                        class="announcement-message-text text-label-xs tracking-label-tight inline-block font-semibold whitespace-nowrap text-slate-100 uppercase"
                                        :class="currentAnnouncement.link_url ? 'transition hover:text-white hover:underline' : ''"
                                    >
                                        {{ currentAnnouncement.message }}
                                    </span>
                                    <span
                                        v-if="announcementTextOverflows"
                                        class="announcement-message-text text-label-xs tracking-label-tight ml-12 inline-block font-semibold whitespace-nowrap text-slate-100 uppercase"
                                        :class="currentAnnouncement.link_url ? 'transition hover:text-white hover:underline' : ''"
                                        aria-hidden="true"
                                    >
                                        {{ currentAnnouncement.message }}
                                    </span>
                                </span>
                            </p>
                        </component>
                    </Transition>
                </div>
            </div>
        </div>

        <div
            class="shadow-panel fixed inset-x-0 z-40 border-b border-white/70 bg-linear-to-b from-white/95 to-slate-50/90 backdrop-blur-xl"
            :style="{ top: `${topOffset}px` }"
        >
            <div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4">
                <NuxtLink to="/" class="inline-flex shrink-0 items-center">
                    <img :src="'/images/logo.svg'" alt="Medusa Commerce" width="640" height="144" class="block h-8 w-auto sm:h-9" />
                </NuxtLink>

                <nav class="hidden items-center gap-5 xl:flex" aria-label="Main navigation">
                    <NuxtLink class="text-base font-semibold text-slate-700 transition hover:text-amber-900" to="/category/all-products">
                        All products
                    </NuxtLink>
                    <NuxtLink class="text-base font-semibold text-slate-700 transition hover:text-amber-900" to="/special-offers">
                        Special offers
                    </NuxtLink>
                    <BaseHeaderCatalogMenu v-model:open="catalogMenuOpen" :categories="categories" />
                </nav>

                <BaseHeaderActions
                    :location-items="locationItems"
                    :location-value="locationValue"
                    :selection-loading="selectionLoading"
                    :item-count="itemCount"
                    :is-authenticated="isAuthenticated"
                    @search="openSearchDialog"
                    @menu="drawer = true"
                    @update-location="updateLocation"
                />
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
            :is-signed-in="isAuthenticated"
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

<style scoped>
.announcement-message-text {
    --announcement-marquee-distance: 0px;
    --announcement-marquee-duration: 6s;
}

.announcement-message-text--marquee {
    animation: announcement-message-scroll var(--announcement-marquee-duration, 4s) linear infinite;
    will-change: transform;
}

.announcement-slide-enter-active,
.announcement-slide-leave-active {
    transition:
        opacity 220ms ease,
        transform 220ms ease;
}

.announcement-slide-enter-from {
    opacity: 0;
    transform: translateX(1.25rem);
}

.announcement-slide-leave-to {
    opacity: 0;
    transform: translateX(-1.25rem);
}

@keyframes announcement-message-scroll {
    from {
        transform: translateX(0);
    }

    to {
        transform: translateX(calc(var(--announcement-marquee-distance, 0px) * -1));
    }
}

@media (prefers-reduced-motion: reduce) {
    .announcement-message-text--marquee {
        animation: none;
        transform: translateX(0);
    }

    .announcement-slide-enter-active,
    .announcement-slide-leave-active {
        transition: none;
    }
}
</style>
