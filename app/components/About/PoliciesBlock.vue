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
    <section class="policies-strip">
        <VContainer class="policies-strip__container">
            <VRow class="policies-strip__grid" align="stretch">
                <VCol v-for="policy in policies" :key="policy.title" cols="12" md="4" class="policies-strip__col">
                    <article class="policies-strip__card">
                        <div class="policies-strip__icon-wrap">
                            <VIcon size="26" class="policies-strip__icon">
                                {{ policy.icon }}
                            </VIcon>
                        </div>
                        <div class="policies-strip__content">
                            <h3 class="policies-strip__title">{{ policy.title }}</h3>
                            <p class="policies-strip__description">{{ policy.description }}</p>
                        </div>
                    </article>
                </VCol>
            </VRow>
        </VContainer>
    </section>
</template>

<style scoped lang="scss">
.policies-strip {
    position: relative;
    overflow: hidden;
    padding: clamp(3rem, 5vw, 4.5rem) 0;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.policies-strip__container {
    position: relative;
    z-index: 1;
}

.policies-strip__grid {
    row-gap: 1rem;
}

.policies-strip__col {
    animation: policies-rise 0.72s ease both;
}

.policies-strip__col:nth-child(2) {
    animation-delay: 0.08s;
}

.policies-strip__col:nth-child(3) {
    animation-delay: 0.14s;
}

.policies-strip__card {
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
}

.policies-strip__card:hover {
    transform: translateY(-3px);
    border-color: rgba(1, 12, 128, 0.16);
    background: #ffffff;
}

.policies-strip__icon-wrap {
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

.policies-strip__content {
    min-width: 0;
}

.policies-strip__title {
    margin-bottom: 0.35rem;
    color: #08173f;
    font-size: 1rem;
    line-height: 1.35;
}

.policies-strip__description {
    margin-bottom: 0;
    color: #5a6480;
    font-size: 0.92rem;
    line-height: 1.65;
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
    .policies-strip {
        padding: 2.5rem 0;
    }

    .policies-strip__card {
        grid-template-columns: 1fr;
        gap: 0.85rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .policies-strip__col,
    .policies-strip__card {
        animation: none;
        transition: none;
    }
}
</style>
