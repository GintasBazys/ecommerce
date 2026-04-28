<script setup lang="ts">
import BaseSelect from "~/components/Shared/BaseSelect.vue"
import { ALL_PRODUCTS_URL_HANDLE, CATEGORY_HANDLE } from "~/utils/consts"

type NavigationCategory = {
    id: string
    handle: string
    name: string
}

type LocationItem = {
    title: string
    value: string
}

const props = defineProps<{
    open: boolean
    topOffset: number
    headerHeight: number
    categories: NavigationCategory[]
    locationItems: LocationItem[]
    locationValue: string
    selectionLoading: boolean
    isSignedIn: boolean
}>()

const emit = defineEmits<{
    close: []
    "update-location": [value: string]
}>()

const locationModel = computed<string>({
    get: () => props.locationValue,
    set: (value) => emit("update-location", value)
})

function closeDrawer(): void {
    emit("close")
}
</script>

<template>
    <transition name="fade">
        <div v-if="open" class="fixed inset-0 z-60 bg-slate-950/55 backdrop-blur-sm" @click="closeDrawer"></div>
    </transition>

    <aside
        class="fixed right-0 bottom-0 z-65 w-72 overflow-hidden border-l border-white/60 bg-linear-to-b from-slate-50 to-slate-100 shadow-2xl transition-transform duration-300 ease-out sm:w-80"
        :class="open ? 'translate-x-0' : 'translate-x-full'"
        :style="{ top: `${topOffset + headerHeight}px` }"
        aria-label="Mobile navigation"
    >
        <div class="flex h-full min-h-0 flex-col">
            <div class="shrink-0 px-4 pt-4 pb-4">
                <div class="mb-4 h-px w-full bg-linear-to-r from-slate-400/0 via-amber-500/45 to-slate-400/0"></div>

                <div class="flex items-center justify-between gap-3">
                    <div>
                        <p
                            class="text-label-2xs tracking-label inline-flex rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 font-semibold text-amber-900 uppercase"
                        >
                            Navigation
                        </p>
                        <h2 class="mt-3 text-lg font-semibold tracking-tight text-slate-950">Menu</h2>
                    </div>

                    <button
                        type="button"
                        class="shadow-card inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-300/50 bg-linear-to-b from-white to-slate-50 text-slate-700 transition hover:border-amber-200 hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
                        @click="closeDrawer"
                    >
                        <span class="sr-only">Close menu</span>
                        <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                            <path
                                d="M5.22 5.22a.75.75 0 0 1 1.06 0L10 8.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L11.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 0-1.06Z"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <div class="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-6">
                <label class="shadow-panel mt-1 block rounded-3xl border border-white/80 bg-linear-to-b from-white to-slate-50 p-4">
                    <span class="text-label-xs tracking-label mb-2 block font-semibold text-slate-500 uppercase">Country</span>

                    <BaseSelect
                        v-model="locationModel"
                        class="rounded-xl"
                        :options="locationItems"
                        option-label-key="title"
                        :disabled="selectionLoading"
                    />
                </label>

                <nav class="mt-5 grid gap-2" aria-label="Mobile links">
                    <NuxtLink
                        class="shadow-card rounded-2xl border border-transparent bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:bg-white"
                        :to="ALL_PRODUCTS_URL_HANDLE"
                        @click="closeDrawer"
                    >
                        All products
                    </NuxtLink>

                    <NuxtLink
                        class="shadow-card rounded-2xl border border-transparent bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:bg-white"
                        to="/special-offers"
                        @click="closeDrawer"
                    >
                        Special offers
                    </NuxtLink>

                    <NuxtLink
                        v-for="cat in categories"
                        :key="cat.id"
                        class="shadow-card rounded-2xl border border-transparent bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:bg-white"
                        :to="`${CATEGORY_HANDLE}/${cat.handle}`"
                        @click="closeDrawer"
                    >
                        {{ cat.name }}
                    </NuxtLink>

                    <NuxtLink
                        v-if="isSignedIn"
                        class="shadow-card rounded-2xl border border-transparent bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:bg-white"
                        to="/account"
                        @click="closeDrawer"
                    >
                        Profile
                    </NuxtLink>

                    <NuxtLink
                        v-else
                        class="shadow-card rounded-2xl border border-transparent bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:bg-white"
                        to="/signin"
                        @click="closeDrawer"
                    >
                        Sign in
                    </NuxtLink>
                </nav>
            </div>
        </div>
    </aside>
</template>
