<script setup lang="ts">
const storePillars = [
    {
        image: "/images/about_store-curated.svg",
        title: "Curated selection",
        description: "We pick practical, design-forward products that are easy to mix into daily routines."
    },
    {
        image: "/images/about_store-value.svg",
        title: "Clear value",
        description: "Every item is priced with transparent value in mind, with no clutter around the buying flow."
    },
    {
        image: "/images/about_store-delivery.svg",
        title: "Reliable delivery",
        description: "Orders move quickly, updates stay clear, and support is available when details matter."
    }
]
</script>

<template>
    <section class="aboutStore">
        <VContainer class="aboutStore__container">
            <div class="aboutStore__intro">
                <span class="aboutStore__eyebrow">Our Store</span>
                <h2 class="aboutStore__title">Built for shoppers who want less noise and better decisions.</h2>
                <p class="aboutStore__description">
                    Our store is designed around clarity: thoughtful products, cleaner browsing, and a checkout flow that removes friction
                    instead of adding it.
                </p>
            </div>

            <VRow class="aboutStore__grid" align="stretch">
                <VCol v-for="item in storePillars" :key="item.title" cols="12" md="4" class="aboutStore__col">
                    <article class="aboutStore__card">
                        <div class="aboutStore__imageWrap">
                            <NuxtImg
                                :src="item.image"
                                :alt="item.title"
                                width="140"
                                height="140"
                                class="aboutStore__image"
                            />
                        </div>
                        <h3 class="aboutStore__cardTitle">{{ item.title }}</h3>
                        <p class="aboutStore__cardText">{{ item.description }}</p>
                    </article>
                </VCol>
            </VRow>
        </VContainer>
    </section>
</template>

<style scoped lang="scss">
.aboutStore {
    position: relative;
    overflow: hidden;
    padding: clamp(4rem, 6vw, 5.5rem) 0;
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.07), transparent 24%),
        linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);

    &__container {
        position: relative;
        z-index: 1;
    }

    &__intro {
        max-width: 840px;
        margin: 0 auto 2rem;
        text-align: center;
        animation: about-store-rise 0.75s ease both;
    }

    &__eyebrow {
        display: inline-flex;
        align-items: center;
        min-height: 2.3rem;
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

    &__title {
        max-width: 15ch;
        margin: 0 auto 0.9rem;
        color: #08173f;
        font-size: clamp(2rem, 3.7vw, 3.55rem);
        line-height: 0.98;
        letter-spacing: -0.05rem;
        text-wrap: balance;
    }

    &__description {
        max-width: 760px;
        margin: 0 auto;
        color: #55617c;
        font-size: 1rem;
        line-height: 1.75;
    }

    &__grid {
        row-gap: 1rem;
    }

    &__col {
        animation: about-store-rise 0.75s ease both;

        &:nth-child(2) {
            animation-delay: 0.08s;
        }

        &:nth-child(3) {
            animation-delay: 0.14s;
        }
    }

    &__card {
        display: grid;
        justify-items: center;
        align-content: start;
        gap: 0.9rem;
        height: 100%;
        padding: 1.25rem;
        border: 1px solid rgba(8, 23, 63, 0.08);
        border-radius: 1.35rem;
        background: rgba(255, 255, 255, 0.88);
        text-align: center;
        transition:
            transform 0.28s ease,
            border-color 0.28s ease,
            box-shadow 0.28s ease;

        &:hover {
            transform: translateY(-4px);
            border-color: rgba(1, 12, 128, 0.16);
            box-shadow: 0 14px 38px rgba(8, 27, 90, 0.1);
        }
    }

    &__imageWrap {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 5.7rem;
        height: 5.7rem;
        border-radius: 1.25rem;
        background: linear-gradient(145deg, rgba(1, 12, 128, 0.08), rgba(0, 128, 255, 0.16));
    }

    &__image {
        width: 4.2rem;
        height: 4.2rem;
        object-fit: contain;
    }

    &__cardTitle {
        margin-bottom: 0;
        color: #08173f;
        font-size: 1.08rem;
        line-height: 1.35;
    }

    &__cardText {
        margin-bottom: 0;
        color: #5a6680;
        font-size: 0.94rem;
        line-height: 1.68;
    }
}

@keyframes about-store-rise {
    from {
        opacity: 0;
        transform: translateY(22px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (max-width: 767px) {
    .aboutStore {
        padding: 3.25rem 0;

        &__title {
            max-width: 100%;
            font-size: clamp(1.85rem, 7vw, 2.75rem);
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    .aboutStore {
        &__intro,
        &__col,
        &__card {
            animation: none;
            transition: none;
        }
    }
}
</style>
