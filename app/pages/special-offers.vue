<script setup lang="ts">
import type { ProductDTO } from "@medusajs/types"

interface ProductListResponse {
    products?: ProductDTO[]
}

const { regionStoreId, selectedCountryCode } = storeToRefs(useRegionStore())
const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: "Special Offers" }])

const saleHighlights = [
    "Curated discounts across the current catalog",
    "Same polished product experience as the rest of the shop",
    "Quick add-to-cart from the listing view"
]

const { data, pending, error } = await useFetch<ProductListResponse>("/api/products/products", {
    params: {
        ...(regionStoreId.value ? { region_id: regionStoreId.value } : {}),
        ...(selectedCountryCode.value ? { country_code: selectedCountryCode.value } : {}),
        limit: 100,
        order: "-created_at"
    }
})

const saleProducts = computed<ProductDTO[]>(() =>
    (data.value?.products ?? []).filter((product) =>
        product.variants?.some(
            (variant) =>
                variant.calculated_price?.calculated_price?.price_list_type === "sale" && Boolean(variant.calculated_price?.original_amount)
        )
    )
)

useHead({
    title: "Special Offers | Ecommerce"
})
</script>

<template>
    <section class="specialOffersPage">
        <div class="specialOffersPage__hero">
            <VContainer class="specialOffersPage__container">
                <div class="specialOffersPage__heroGrid">
                    <div class="specialOffersPage__heroCopy">
                        <AppBreadcrumbs :items="breadcrumbItems" class="specialOffersPage__breadcrumbs" />
                        <span class="specialOffersPage__eyebrow">Special offers</span>
                        <h1 class="specialOffersPage__title">All current sale products, gathered into one calmer place to browse.</h1>
                        <p class="specialOffersPage__description">
                            Explore every discounted product in the catalog without jumping through categories. The page keeps the same
                            polished feel as the newer shop experience.
                        </p>
                    </div>

                    <div class="specialOffersPage__heroPanel">
                        <span class="specialOffersPage__panelLabel">What to expect</span>
                        <h2 class="specialOffersPage__panelTitle">Designed like a campaign page, powered by live sale pricing.</h2>
                        <ul class="specialOffersPage__promiseList">
                            <li v-for="highlight in saleHighlights" :key="highlight" class="specialOffersPage__promiseItem">
                                <VIcon size="18" color="primary">mdi-check-circle-outline</VIcon>
                                <span>{{ highlight }}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="specialOffersPage__statRow">
                    <div class="specialOffersPage__statCard">
                        <span class="specialOffersPage__statLabel">Sale products</span>
                        <strong class="specialOffersPage__statValue">{{ saleProducts.length }}</strong>
                    </div>
                    <div class="specialOffersPage__statCard">
                        <span class="specialOffersPage__statLabel">Sorted by</span>
                        <strong class="specialOffersPage__statValue">Newest offers first</strong>
                    </div>
                </div>

                <div v-if="pending" class="specialOffersPage__loadingState">
                    <VProgressCircular indeterminate color="primary" size="40" />
                    <p class="specialOffersPage__loadingText">Loading sale products...</p>
                </div>

                <VAlert v-else-if="error" type="error" variant="tonal"> Could not load special offers right now. </VAlert>

                <div v-else-if="saleProducts.length" class="specialOffersPage__results">
                    <div class="specialOffersPage__sectionIntro">
                        <span class="specialOffersPage__sectionEyebrow">On sale now</span>
                        <h2 class="specialOffersPage__sectionTitle">Every discounted product currently available.</h2>
                    </div>

                    <VRow align="stretch" class="specialOffersPage__grid">
                        <VCol v-for="product in saleProducts" :key="product.id" cols="12" sm="6" lg="4" xl="3">
                            <ProductCard :product="product" />
                        </VCol>
                    </VRow>
                </div>

                <div v-else class="specialOffersPage__emptyState">
                    <div class="specialOffersPage__emptyIcon">
                        <VIcon size="26">mdi-tag-outline</VIcon>
                    </div>
                    <h2 class="specialOffersPage__emptyTitle">No sale products live right now</h2>
                    <p class="specialOffersPage__emptyText">
                        The next offer drop will appear here automatically once discounted products are available.
                    </p>
                    <VBtn color="primary" rounded="pill" class="text-none px-6" to="/">Browse the full shop</VBtn>
                </div>
            </VContainer>
        </div>
    </section>
</template>

<style scoped lang="scss">
.specialOffersPage {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.specialOffersPage__hero {
    padding: clamp(4.75rem, 7vw, 6.5rem) 0 clamp(4rem, 7vw, 6rem);
}

.specialOffersPage__container {
    position: relative;
    z-index: 1;
}

.specialOffersPage__heroGrid {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(18rem, 0.9fr);
    gap: clamp(1.5rem, 3vw, 2rem);
    align-items: end;
}

.specialOffersPage__heroCopy,
.specialOffersPage__heroPanel,
.specialOffersPage__results,
.specialOffersPage__emptyState {
    animation: offers-rise 0.8s ease both;
}

.specialOffersPage__heroPanel,
.specialOffersPage__results,
.specialOffersPage__emptyState {
    animation-delay: 0.12s;
}

.specialOffersPage__breadcrumbs {
    margin-bottom: 1rem;
}

.specialOffersPage__eyebrow,
.specialOffersPage__panelLabel,
.specialOffersPage__sectionEyebrow {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    background: rgba(1, 12, 128, 0.07);
    color: #010c80;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.specialOffersPage__title,
.specialOffersPage__panelTitle,
.specialOffersPage__sectionTitle,
.specialOffersPage__emptyTitle {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.specialOffersPage__title {
    max-width: 11ch;
    margin: 1rem 0;
    font-size: clamp(2.4rem, 4.4vw, 4.5rem);
    line-height: 0.95;
}

.specialOffersPage__description,
.specialOffersPage__emptyText,
.specialOffersPage__loadingText {
    margin: 0;
    color: #4b5874;
    line-height: 1.75;
}

.specialOffersPage__heroPanel,
.specialOffersPage__statCard,
.specialOffersPage__emptyState {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.specialOffersPage__heroPanel {
    padding: clamp(1.4rem, 2vw, 1.9rem);
}

.specialOffersPage__panelLabel {
    margin-bottom: 1rem;
}

.specialOffersPage__panelTitle,
.specialOffersPage__sectionTitle,
.specialOffersPage__emptyTitle {
    margin-bottom: 0.85rem;
    font-size: clamp(1.6rem, 2.4vw, 2.2rem);
    line-height: 1.08;
}

.specialOffersPage__promiseList {
    display: grid;
    gap: 0.85rem;
    margin: 1.2rem 0 0;
    padding: 0;
    list-style: none;
}

.specialOffersPage__promiseItem {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    color: #33415f;
    line-height: 1.6;
}

.specialOffersPage__statRow {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin: clamp(1.5rem, 3vw, 2rem) 0 clamp(2rem, 4vw, 3rem);
}

.specialOffersPage__statCard {
    display: grid;
    gap: 0.2rem;
    padding: 0.95rem 1.1rem;
}

.specialOffersPage__statLabel {
    color: #6a7590;
    font-size: 0.88rem;
}

.specialOffersPage__statValue {
    color: #08173f;
    font-size: 1rem;
    line-height: 1.45;
}

.specialOffersPage__sectionIntro {
    margin-bottom: 1.35rem;
}

.specialOffersPage__grid {
    margin-top: 0;
}

.specialOffersPage__emptyState {
    display: grid;
    justify-items: start;
    gap: 0.85rem;
    padding: clamp(1.4rem, 2vw, 1.9rem);
}

.specialOffersPage__emptyIcon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3.15rem;
    height: 3.15rem;
    border-radius: 1rem;
    background: linear-gradient(145deg, rgba(1, 12, 128, 0.1), rgba(0, 128, 255, 0.08));
    color: #010c80;
}

.specialOffersPage__loadingState {
    display: grid;
    justify-items: center;
    gap: 0.9rem;
    padding: 4rem 0;
}

@keyframes offers-rise {
    from {
        opacity: 0;
        transform: translateY(26px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (max-width: 1100px) {
    .specialOffersPage__heroGrid,
    .specialOffersPage__statRow {
        grid-template-columns: 1fr;
    }

    .specialOffersPage__title {
        max-width: 100%;
    }
}

@media screen and (max-width: 700px) {
    .specialOffersPage__hero {
        padding: 3.75rem 0 3.5rem;
    }

    .specialOffersPage__title {
        font-size: clamp(2rem, 9vw, 2.8rem);
        line-height: 1;
    }

    .specialOffersPage__heroPanel,
    .specialOffersPage__statCard,
    .specialOffersPage__emptyState {
        border-radius: 1.2rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .specialOffersPage__heroCopy,
    .specialOffersPage__heroPanel,
    .specialOffersPage__results,
    .specialOffersPage__emptyState {
        animation: none;
    }
}
</style>
