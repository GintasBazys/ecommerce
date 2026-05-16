<script setup lang="ts">
import ProductCard from "~/components/Product/ProductCard.vue"
import BaseButton from "~/components/Shared/BaseButton.vue"
import { useSnackbar } from "~/composables/shared/useSnackbar"

definePageMeta({
    layout: "account",
    middleware: ["auth"]
})

useHead({ title: "Wishlist | Medusa Commerce" })

const wishlistStore = useWishlistStore()
const { items, itemCount, loading } = storeToRefs(wishlistStore)
const { showSnackbar } = useSnackbar()

await wishlistStore.loadWishlist()

const availableItems = computed(() => items.value.filter((item) => item.product))
const missingItems = computed(() => items.value.filter((item) => !item.product))

async function removeWishlistItem(wishlistItemId: string): Promise<void> {
    try {
        await wishlistStore.removeItem(wishlistItemId)
        showSnackbar("Removed from wishlist", "success")
    } catch (error) {
        console.error("Failed to remove wishlist item", error)
        showSnackbar("Could not remove this item. Please try again.", "error")
    }
}
</script>

<template>
    <div class="grid gap-6">
        <section class="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span class="text-label-xs tracking-label-tight font-bold text-slate-500 uppercase">Saved for later</span>
                    <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                        {{ itemCount }} {{ itemCount === 1 ? "item" : "items" }} saved
                    </h2>
                    <p class="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                        Wishlist prices and availability refresh from the store, so saved products stay ready for your next cart.
                    </p>
                </div>

                <BaseButton
                    type="button"
                    class="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
                    :disabled="loading"
                    @click="wishlistStore.loadWishlist"
                >
                    Refresh
                </BaseButton>
            </div>
        </section>

        <div v-if="loading && !items.length" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite">
            <div v-for="index in 3" :key="index" class="h-96 animate-pulse rounded-3xl border border-slate-200 bg-slate-100"></div>
        </div>

        <section v-else-if="availableItems.length" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <article v-for="item in availableItems" :key="item.id" class="grid gap-3">
                <ProductCard v-if="item.product" :product="item.product" />
                <BaseButton
                    type="button"
                    class="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-rose-200 hover:text-rose-700 focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:outline-hidden"
                    :disabled="wishlistStore.isProductMutating(item.product_id)"
                    @click="removeWishlistItem(item.id)"
                >
                    Remove from wishlist
                </BaseButton>
            </article>
        </section>

        <section v-else class="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-10">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-900">
                <svg viewBox="0 0 24 24" class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                    <path
                        d="M12 20.2S4.5 15.7 4.5 9.4A4.4 4.4 0 0 1 12 6.2a4.4 4.4 0 0 1 7.5 3.2c0 6.3-7.5 10.8-7.5 10.8Z"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </div>
            <h2 class="mt-5 text-2xl font-bold tracking-tight text-slate-950">Your wishlist is empty</h2>
            <p class="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-600">
                Save products from any product card and they will appear here whenever you sign in.
            </p>
            <NuxtLink
                to="/category/all-products"
                class="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
            >
                Start shopping
            </NuxtLink>
        </section>

        <section v-if="missingItems.length" class="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
            {{ missingItems.length }} saved {{ missingItems.length === 1 ? "product is" : "products are" }} currently unavailable and hidden from this list.
        </section>
    </div>
</template>
