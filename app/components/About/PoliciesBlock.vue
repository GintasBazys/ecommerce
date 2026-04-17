<script setup lang="ts">
interface PolicyItem {
    icon: string
    title: string
    description: string
}

const policies: PolicyItem[] = [
    {
        icon: "/images/policies/shipping.svg",
        title: "Free Shipping",
        description: "Enjoy free shipping on qualifying orders with a clearer delivery experience."
    },
    {
        icon: "/images/policies/secure-payment.svg",
        title: "Secure Payment",
        description: "Protected checkout with trusted payment flows and transparent confirmation."
    },
    {
        icon: "/images/policies/support.svg",
        title: "Human Support",
        description: "Helpful support for product questions, order updates, and returns when needed."
    }
]
</script>

<template>
    <section class="policies-strip">
        <div class="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
            <div class="policies-strip__intro">
                <span class="policies-strip__eyebrow">Shop with confidence</span>
                <h2 class="policies-strip__title">A smoother purchase experience from product discovery to delivery.</h2>
                <p class="policies-strip__description">
                    Clear delivery, safer checkout, and responsive support built into the same premium storefront experience.
                </p>
            </div>

            <div class="policies-strip__grid">
                <article v-for="policy in policies" :key="policy.title" class="policies-strip__card">
                    <div class="policies-strip__icon-wrap" aria-hidden="true">
                        <img :src="policy.icon" alt="" class="policies-strip__icon" loading="lazy" width="40" height="40" />
                    </div>
                    <div class="policies-strip__content">
                        <h3 class="policies-strip__card-title">{{ policy.title }}</h3>
                        <p class="policies-strip__card-description">{{ policy.description }}</p>
                    </div>
                </article>
            </div>
        </div>
    </section>
</template>

<style scoped>
.policies-strip {
    background:
        radial-gradient(circle at top left, rgba(245, 158, 11, 0.08), transparent 24%), linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.policies-strip__intro {
    max-width: 42rem;
}

.policies-strip__eyebrow {
    display: inline-flex;
    min-height: 2.25rem;
    align-items: center;
    border-radius: 999px;
    border: 1px solid rgba(253, 230, 138, 0.72);
    background: rgba(254, 243, 199, 0.72);
    padding: 0.45rem 0.95rem;
    color: #78350f;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.policies-strip__title {
    margin: 1rem 0 0;
    max-width: 14ch;
    color: #0f172a;
    font-size: clamp(1.9rem, 6vw, 3.1rem);
    font-weight: 700;
    line-height: 0.98;
    letter-spacing: -0.05em;
}

.policies-strip__description {
    margin: 1rem 0 0;
    max-width: 38rem;
    color: #475569;
    font-size: 1rem;
    line-height: 1.8;
}

.policies-strip__grid {
    display: grid;
    gap: 1rem;
    margin-top: 1.75rem;
}

.policies-strip__card {
    display: grid;
    gap: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.82);
    border-radius: 1.5rem;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
    box-shadow: 0 12px 28px rgba(8, 27, 90, 0.06);
    padding: 1.2rem;
}

.policies-strip__icon-wrap {
    display: inline-flex;
    height: 3.25rem;
    width: 3.25rem;
    align-items: center;
    justify-content: center;
    border-radius: 1rem;
    border: 1px solid rgba(253, 230, 138, 0.65);
    background: linear-gradient(180deg, rgba(254, 243, 199, 0.85), rgba(255, 255, 255, 0.98));
}

.policies-strip__icon {
    display: block;
    height: 2.5rem;
    width: 2.5rem;
}

.policies-strip__content {
    min-width: 0;
}

.policies-strip__card-title {
    margin: 0;
    color: #0f172a;
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 1.35;
}

.policies-strip__card-description {
    margin: 0.45rem 0 0;
    color: #475569;
    font-size: 0.95rem;
    line-height: 1.7;
}

@media (min-width: 768px) {
    .policies-strip__grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .policies-strip__card {
        min-height: 100%;
    }
}

@media (max-width: 767px) {
    .policies-strip__title {
        max-width: 100%;
    }
}
</style>
