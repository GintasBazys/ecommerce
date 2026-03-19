<script setup lang="ts">
import type { Policies } from "@/types/interfaces"

const policies = ref<Policies[]>([
    {
        icon: "mdi-truck-fast",
        title: "Free Shipping",
        description: "Enjoy free shipping on qualifying orders with a clearer delivery experience."
    },
    {
        icon: "mdi-lock-outline",
        title: "Secure Payment",
        description: "Protected checkout with trusted payment flows and transparent confirmation."
    },
    {
        icon: "mdi-headset",
        title: "Human Support",
        description: "Helpful support for product questions, order updates, and returns when needed."
    }
])
</script>

<template>
    <section class="policiesStrip">
        <VContainer class="policiesStrip__container">
            <VRow class="policiesStrip__grid" align="stretch">
                <VCol v-for="policy in policies" :key="policy.title" cols="12" md="4" class="policiesStrip__col">
                    <article class="policiesStrip__card">
                        <div class="policiesStrip__iconWrap">
                            <VIcon size="26" class="policiesStrip__icon">
                                {{ policy.icon }}
                            </VIcon>
                        </div>
                        <div class="policiesStrip__content">
                            <h3 class="policiesStrip__title">{{ policy.title }}</h3>
                            <p class="policiesStrip__description">{{ policy.description }}</p>
                        </div>
                    </article>
                </VCol>
            </VRow>
        </VContainer>
    </section>
</template>

<style scoped lang="scss">
.policiesStrip {
    position: relative;
    overflow: hidden;
    padding: clamp(3rem, 5vw, 4.5rem) 0;
    background:
        linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);

    &__container {
        position: relative;
        z-index: 1;
    }

    &__grid {
        row-gap: 1rem;
    }

    &__col {
        animation: policies-rise 0.72s ease both;

        &:nth-child(2) {
            animation-delay: 0.08s;
        }

        &:nth-child(3) {
            animation-delay: 0.14s;
        }
    }

    &__card {
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: start;
        gap: 1rem;
        height: 100%;
        padding: 1.2rem;
        border: 1px solid rgba(8, 23, 63, 0.08);
        border-radius: 1.35rem;
        background: rgba(255, 255, 255, 0.88);
        transition:
            transform 0.28s ease,
            border-color 0.28s ease,
            background-color 0.28s ease;

        &:hover {
            transform: translateY(-3px);
            border-color: rgba(1, 12, 128, 0.16);
            background: #ffffff;
        }
    }

    &__iconWrap {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 3rem;
        height: 3rem;
        border-radius: 1rem;
        background: linear-gradient(135deg, rgba(1, 12, 128, 0.08), rgba(0, 128, 255, 0.14));
        color: #010c80;
        flex-shrink: 0;
    }

    &__content {
        min-width: 0;
    }

    &__title {
        margin-bottom: 0.35rem;
        color: #08173f;
        font-size: 1rem;
        line-height: 1.35;
    }

    &__description {
        margin-bottom: 0;
        color: #5a6480;
        font-size: 0.92rem;
        line-height: 1.65;
    }
}

@keyframes policies-rise {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (max-width: 767px) {
    .policiesStrip {
        padding: 2.5rem 0;

        &__card {
            grid-template-columns: 1fr;
            gap: 0.85rem;
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    .policiesStrip {
        &__col,
        &__card {
            animation: none;
            transition: none;
        }
    }
}
</style>
