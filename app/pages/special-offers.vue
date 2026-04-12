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
    <section class="special-offers-page">
        <div class="special-offers-page__hero">
            <VContainer class="special-offers-page__container">
                <div class="special-offers-page__hero-grid">
                    <div class="special-offers-page__hero-copy">
                        <AppBreadcrumbs :items="breadcrumbItems" class="special-offers-page__breadcrumbs" />
                        <span class="special-offers-page__eyebrow">Special offers</span>
                        <h1 class="special-offers-page__title">All current sale products, gathered into one calmer place to browse.</h1>
                        <p class="special-offers-page__description">
                            Explore every discounted product in the catalog without jumping through categories. The page keeps the same
                            polished feel as the newer shop experience.
                        </p>
                    </div>

                    <div class="special-offers-page__hero-panel">
                        <span class="special-offers-page__panel-label">What to expect</span>
                        <h2 class="special-offers-page__panel-title">Designed like a campaign page, powered by live sale pricing.</h2>
                        <ul class="special-offers-page__promise-list">
                            <li v-for="highlight in saleHighlights" :key="highlight" class="special-offers-page__promise-item">
                                <VIcon size="18" color="primary">mdi-check-circle-outline</VIcon>
                                <span>{{ highlight }}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="special-offers-page__stat-row">
                    <div class="special-offers-page__stat-card">
                        <span class="special-offers-page__stat-label">Sale products</span>
                        <strong class="special-offers-page__stat-value">{{ saleProducts.length }}</strong>
                    </div>
                    <div class="special-offers-page__stat-card">
                        <span class="special-offers-page__stat-label">Sorted by</span>
                        <strong class="special-offers-page__stat-value">Newest offers first</strong>
                    </div>
                </div>

                <div v-if="pending" class="special-offers-page__loading-state">
                    <VProgressCircular indeterminate color="primary" size="40" />
                    <p class="special-offers-page__loading-text">Loading sale products...</p>
                </div>

                <VAlert v-else-if="error" type="error" variant="tonal"> Could not load special offers right now. </VAlert>

                <div v-else-if="saleProducts.length" class="special-offers-page__results">
                    <div class="special-offers-page__section-intro">
                        <span class="special-offers-page__section-eyebrow">On sale now</span>
                        <h2 class="special-offers-page__section-title">Every discounted product currently available.</h2>
                    </div>

                    <VRow align="stretch" class="special-offers-page__grid">
                        <VCol v-for="product in saleProducts" :key="product.id" cols="12" sm="6" lg="4" xl="3">
                            <ProductCard :product="product" />
                        </VCol>
                    </VRow>
                </div>

                <div v-else class="special-offers-page__empty-state">
                    <div class="special-offers-page__empty-icon">
                        <VIcon size="26">mdi-tag-outline</VIcon>
                    </div>
                    <h2 class="special-offers-page__empty-title">No sale products live right now</h2>
                    <p class="special-offers-page__empty-text">
                        The next offer drop will appear here automatically once discounted products are available.
                    </p>
                    <VBtn color="primary" rounded="pill" class="text-none px-6" to="/">Browse the full shop</VBtn>
                </div>
            </VContainer>
        </div>
    </section>
</template>

<style scoped lang="scss">
.special-offers-page {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.special-offers-page__hero {
    padding: 5.5rem 0 5rem;
}

.special-offers-page__container {
    position: relative;
    z-index: 1;
}

.special-offers-page__hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(18rem, 0.9fr);
    gap: 2rem;
    align-items: end;
}

.special-offers-page__hero-copy,
.special-offers-page__hero-panel,
.special-offers-page__results,
.special-offers-page__empty-state {
    animation: offers-rise 0.8s ease both;
}

.special-offers-page__hero-panel,
.special-offers-page__results,
.special-offers-page__empty-state {
    animation-delay: 0.12s;
}

.special-offers-page__breadcrumbs {
    margin-bottom: 1rem;
}

.special-offers-page__eyebrow,
.special-offers-page__panel-label,
.special-offers-page__section-eyebrow {
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

.special-offers-page__title,
.special-offers-page__panel-title,
.special-offers-page__section-title,
.special-offers-page__empty-title {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.special-offers-page__title {
    max-width: 11ch;
    margin: 1rem 0;
    font-size: 4.5rem;
    line-height: 0.95;
}

.special-offers-page__description,
.special-offers-page__empty-text,
.special-offers-page__loading-text {
    margin: 0;
    color: #4b5874;
    line-height: 1.75;
}

.special-offers-page__hero-panel,
.special-offers-page__stat-card,
.special-offers-page__empty-state {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.special-offers-page__hero-panel {
    padding: 1.9rem;
}

.special-offers-page__panel-label {
    margin-bottom: 1rem;
}

.special-offers-page__panel-title,
.special-offers-page__section-title,
.special-offers-page__empty-title {
    margin-bottom: 0.85rem;
    font-size: 2.2rem;
    line-height: 1.08;
}

.special-offers-page__promise-list {
    display: grid;
    gap: 0.85rem;
    margin: 1.2rem 0 0;
    padding: 0;
    list-style: none;
}

.special-offers-page__promise-item {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    color: #33415f;
    line-height: 1.6;
}

.special-offers-page__stat-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin: 2rem 0 3rem;
}

.special-offers-page__stat-card {
    display: grid;
    gap: 0.2rem;
    padding: 0.95rem 1.1rem;
}

.special-offers-page__stat-label {
    color: #6a7590;
    font-size: 0.88rem;
}

.special-offers-page__stat-value {
    color: #08173f;
    font-size: 1rem;
    line-height: 1.45;
}

.special-offers-page__section-intro {
    margin-bottom: 1.35rem;
}

.special-offers-page__grid {
    margin-top: 0;
}

.special-offers-page__empty-state {
    display: grid;
    justify-items: start;
    gap: 0.85rem;
    padding: 1.9rem;
}

.special-offers-page__empty-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3.15rem;
    height: 3.15rem;
    border-radius: 1rem;
    background: linear-gradient(145deg, rgba(1, 12, 128, 0.1), rgba(0, 128, 255, 0.08));
    color: #010c80;
}

.special-offers-page__loading-state {
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
    .special-offers-page__hero-grid,
    .special-offers-page__stat-row {
        grid-template-columns: 1fr;
    }

    .special-offers-page__hero {
        padding: 5rem 0 4.5rem;
    }

    .special-offers-page__hero-grid {
        gap: 1.5rem;
    }

    .special-offers-page__title {
        max-width: 100%;
        font-size: 3.2rem;
    }

    .special-offers-page__panel-title,
    .special-offers-page__section-title,
    .special-offers-page__empty-title {
        font-size: 1.9rem;
    }
}

@media screen and (max-width: 700px) {
    .special-offers-page__hero {
        padding: 3.75rem 0 3.5rem;
    }

    .special-offers-page__title {
        font-size: 2.4rem;
        line-height: 1;
    }

    .special-offers-page__hero-panel,
    .special-offers-page__stat-card,
    .special-offers-page__empty-state {
        border-radius: 1.2rem;
    }

    .special-offers-page__hero-panel,
    .special-offers-page__empty-state {
        padding: 1.4rem;
    }

    .special-offers-page__stat-row {
        margin: 1.5rem 0 2rem;
    }

    .special-offers-page__panel-title,
    .special-offers-page__section-title,
    .special-offers-page__empty-title {
        font-size: 1.6rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .special-offers-page__hero-copy,
    .special-offers-page__hero-panel,
    .special-offers-page__results,
    .special-offers-page__empty-state {
        animation: none;
    }
}
</style>
