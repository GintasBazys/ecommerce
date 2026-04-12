<script setup lang="ts">
const breadcrumbItems = [{ label: "Home", to: "/" }, { label: "About" }]

useHead({
    title: "About | Ecommerce"
})
</script>

<template>
    <section class="about-page">
        <div class="about-page__hero">
            <VContainer class="about-page__container">
                <div class="about-page__hero-copy">
                    <AppBreadcrumbs :items="breadcrumbItems" class="about-page__breadcrumbs" />
                    <span class="about-page__eyebrow">About the store</span>
                    <h1 class="about-page__title">Get the story behind the curated storefront experience.</h1>
                    <p class="about-page__description">
                        Learn how the brand approaches product selection, delivery standards, and the overall experience behind the shop.
                    </p>
                </div>
            </VContainer>
        </div>
        <AboutCta :extra-spacer-class="'pb-0'" />
        <AboutCards />
        <AboutColumns />
    </section>
</template>

<style scoped lang="scss">
.about-page {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f7faff 0%, #ffffff 36%, #f6f9ff 100%);
}

.about-page__hero {
    padding: 5.75rem 0 1.5rem;
}

.about-page__container {
    position: relative;
    z-index: 1;
}

.about-page__hero-copy {
    max-width: 42rem;
}

.about-page__breadcrumbs,
.about-page__eyebrow {
    margin-bottom: 1rem;
}

.about-page__eyebrow {
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

.about-page__title {
    margin: 0 0 1rem;
    color: #08173f;
    font-size: 4.25rem;
    line-height: 0.96;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.about-page__description {
    margin: 0;
    color: #4b5874;
    font-size: 1rem;
    line-height: 1.75;
}

@media screen and (max-width: 1199px) {
    .about-page__hero {
        padding-top: 5rem;
    }

    .about-page__title {
        font-size: 3.5rem;
    }
}

@media screen and (max-width: 959px) {
    .about-page__hero {
        padding-top: 4.5rem;
    }

    .about-page__title {
        font-size: 2.75rem;
    }
}

@media screen and (max-width: 767px) {
    .about-page__hero {
        padding: 3.75rem 0 1rem;
    }

    .about-page__title {
        font-size: 2rem;
    }
}
</style>
