<script setup lang="ts">
const route = useRoute()
const event = useRequestEvent()

const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: "404" }])

if (event) {
    setResponseStatus(event, 404)
}

useHead({
    title: "404 | Ecommerce"
})
</script>

<template>
    <section class="not-found-page">
        <div class="not-found-page__hero">
            <VContainer class="not-found-page__container">
                <div class="not-found-page__content">
                    <AppBreadcrumbs :items="breadcrumbItems" class="not-found-page__breadcrumbs" />
                    <span class="not-found-page__eyebrow">Page not found</span>
                    <h1 class="not-found-page__title">This page has moved, expired, or never existed in the first place.</h1>
                    <p class="not-found-page__description">
                        We could not find
                        <strong>{{ route.path }}</strong>
                        in the storefront. Jump back to the homepage or continue exploring active categories.
                    </p>
                    <div class="not-found-page__actions">
                        <VBtn color="primary" rounded="pill" size="large" class="text-none px-7" to="/">Back to homepage</VBtn>
                        <VBtn color="primary" variant="outlined" rounded="pill" size="large" class="text-none px-7" to="/special-offers">
                            Browse offers
                        </VBtn>
                    </div>
                </div>
            </VContainer>
        </div>
    </section>
</template>

<style scoped lang="scss">
.not-found-page {
    min-height: calc(100vh - 98px);
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 38%, #f7faff 100%);
}

.not-found-page__hero {
    padding: 5.75rem 0 4rem;
}

.not-found-page__container {
    position: relative;
    z-index: 1;
}

.not-found-page__content {
    max-width: 45rem;
    animation: not-found-rise 0.8s ease both;
}

.not-found-page__breadcrumbs {
    margin-bottom: 1rem;
}

.not-found-page__eyebrow {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: 0.45rem 0.9rem;
    margin-bottom: 1rem;
    border-radius: 999px;
    background: rgba(1, 12, 128, 0.07);
    color: #010c80;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.not-found-page__title {
    max-width: 12ch;
    margin: 0 0 1rem;
    color: #08173f;
    font-size: 4rem;
    line-height: 0.95;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.not-found-page__description {
    max-width: 58ch;
    margin: 0;
    color: #4b5874;
    font-size: 1rem;
    line-height: 1.75;
}

.not-found-page__description strong {
    color: #08173f;
}

.not-found-page__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.8rem;
}

@keyframes not-found-rise {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (max-width: 1199px) {
    .not-found-page__hero {
        padding-top: 5rem;
    }

    .not-found-page__title {
        font-size: 3.45rem;
    }
}

@media screen and (max-width: 959px) {
    .not-found-page__hero {
        padding-top: 4.5rem;
    }

    .not-found-page__title {
        font-size: 2.65rem;
    }
}

@media screen and (max-width: 767px) {
    .not-found-page {
        min-height: auto;
    }

    .not-found-page__hero {
        padding: 3.75rem 0 3rem;
    }

    .not-found-page__title {
        font-size: 2rem;
    }

    .not-found-page__actions {
        flex-direction: column;
    }
}

@media (prefers-reduced-motion: reduce) {
    .not-found-page__content {
        animation: none;
    }
}
</style>
