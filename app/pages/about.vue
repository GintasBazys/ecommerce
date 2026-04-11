<script setup lang="ts">
const breadcrumbItems = [{ label: "Home", to: "/" }, { label: "About" }]

useHead({
    title: "About | Ecommerce"
})
</script>

<template>
    <section class="aboutPage">
        <div class="aboutPage__hero">
            <VContainer class="aboutPage__container">
                <div class="aboutPage__heroCopy">
                    <AppBreadcrumbs :items="breadcrumbItems" class="aboutPage__breadcrumbs" />
                    <span class="aboutPage__eyebrow">About the store</span>
                    <h1 class="aboutPage__title">Get the story behind the curated storefront experience.</h1>
                    <p class="aboutPage__description">
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
.aboutPage {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f7faff 0%, #ffffff 36%, #f6f9ff 100%);
}

.aboutPage__hero {
    padding: clamp(4.25rem, 7vw, 5.75rem) 0 1.5rem;
}

.aboutPage__container {
    position: relative;
    z-index: 1;
}

.aboutPage__heroCopy {
    max-width: 42rem;
}

.aboutPage__breadcrumbs,
.aboutPage__eyebrow {
    margin-bottom: 1rem;
}

.aboutPage__eyebrow {
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

.aboutPage__title {
    margin: 0 0 1rem;
    color: #08173f;
    font-size: clamp(2.25rem, 4.4vw, 4.25rem);
    line-height: 0.96;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.aboutPage__description {
    margin: 0;
    color: #4b5874;
    font-size: 1rem;
    line-height: 1.75;
}

@media screen and (max-width: 767px) {
    .aboutPage__hero {
        padding: 3.75rem 0 1rem;
    }

    .aboutPage__title {
        font-size: clamp(2rem, 8vw, 3rem);
    }
}
</style>
