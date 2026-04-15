<script setup lang="ts">
defineProps<{
    linkShown?: boolean
    extraSpacerClass?: string
}>()

const highlights = [
    {
        title: "Curated since 2012",
        text: "A sharper product mix built around quality, utility, and easier everyday shopping."
    },
    {
        title: "Global delivery",
        text: "Fast-moving collections shipped internationally with a cleaner, lower-friction checkout flow."
    },
    {
        title: "Human support",
        text: "Real help when you need it, from product questions to delivery follow-ups."
    }
]
</script>

<template>
    <section class="about-cta-section" :class="extraSpacerClass">
        <VContainer class="about-cta">
            <div class="about-cta__panel">
                <div class="about-cta__media">
                    <div class="about-cta__image-wrap">
                        <NuxtImage
                            src="/images/online_purchase.jpg"
                            alt="online purchase illustration"
                            width="1200"
                            height="1120"
                            sizes="100vw lg:45vw"
                            format="webp"
                            quality="72"
                            loading="lazy"
                            decoding="async"
                            class="about-cta__image"
                        />
                        <div class="about-cta__floating">
                            <span class="about-cta__floating-label">Trusted ecommerce</span>
                            <strong class="about-cta__floating-value">12+ years</strong>
                            <span class="about-cta__floating-text">Building a smoother shopping experience from Vilnius.</span>
                        </div>
                    </div>
                </div>

                <div class="about-cta__content">
                    <span class="about-cta__eyebrow">Who We Are</span>
                    <h2 class="about-cta__title">A cleaner, more thoughtful online store experience.</h2>
                    <p class="about-cta__lead">
                        Since 2012, we have focused on combining dependable products, fast fulfillment, and a storefront that feels easy to
                        browse from the first scroll.
                    </p>

                    <div class="about-cta__highlights">
                        <article v-for="item in highlights" :key="item.title" class="about-cta__highlight">
                            <h3 class="about-cta__highlight-title">{{ item.title }}</h3>
                            <p class="about-cta__highlight-text">{{ item.text }}</p>
                        </article>
                    </div>

                    <div class="about-cta__footer">
                        <p class="about-cta__body">
                            We curate a broad range of products and support customers worldwide with a practical, friendly approach. The
                            goal is simple: make shopping feel confident, calm, and efficient.
                        </p>
                        <VBtn
                            v-if="linkShown"
                            to="/about"
                            class="about-cta__button text-none"
                            color="primary"
                            rounded="pill"
                            tag="NuxtLink"
                        >
                            Learn about our approach
                        </VBtn>
                    </div>
                </div>
            </div>
        </VContainer>
    </section>
</template>

<style scoped lang="scss">
.about-cta-section {
    position: relative;
    overflow: hidden;
    padding: clamp(4.5rem, 8vw, 7rem) 0;
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 28%), linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%);
}

.about-cta {
    position: relative;
    z-index: 1;
}

.about-cta__panel {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
    align-items: center;
    gap: clamp(2rem, 4vw, 4rem);
}

.about-cta__media,
.about-cta__content {
    animation: about-rise 0.8s ease both;
}

.about-cta__content {
    animation-delay: 0.12s;
}

.about-cta__image-wrap {
    position: relative;
    overflow: hidden;
    border-radius: 2rem;
    background: linear-gradient(160deg, rgba(1, 12, 128, 0.08), rgba(0, 128, 255, 0.12));
    box-shadow: 0 24px 70px rgba(8, 27, 90, 0.14);
}

.about-cta__image {
    display: block;
    width: 100%;
    aspect-ratio: 1.08;
    object-fit: cover;
    transform: scale(1.01);
}

.about-cta__floating {
    position: absolute;
    right: 1.25rem;
    bottom: 1.25rem;
    display: grid;
    gap: 0.35rem;
    max-width: 15rem;
    padding: 1rem 1.1rem;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 1.25rem;
    background: rgba(8, 24, 73, 0.8);
    backdrop-filter: blur(12px);
    color: #ffffff;
    box-shadow: 0 14px 40px rgba(8, 24, 73, 0.22);
}

.about-cta__floating-label {
    color: rgba(220, 231, 255, 0.88);
    font-size: 0.73rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.about-cta__floating-value {
    font-size: 1.5rem;
    line-height: 1.1;
}

.about-cta__floating-text {
    color: rgba(255, 255, 255, 0.82);
    font-size: 0.92rem;
    line-height: 1.5;
}

.about-cta__eyebrow {
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

.about-cta__title {
    max-width: 11ch;
    margin-bottom: 1rem;
    color: #08173f;
    font-size: clamp(2.25rem, 4vw, 4.1rem);
    line-height: 0.96;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.about-cta__lead {
    max-width: 38rem;
    margin-bottom: 1.75rem;
    color: #44506d;
    font-size: 1.05rem;
    line-height: 1.75;
}

.about-cta__highlights {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: 1.75rem;
}

.about-cta__highlight {
    min-height: 100%;
    padding: 1.15rem 1rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.25rem;
    background: rgba(255, 255, 255, 0.78);
    box-shadow: 0 12px 40px rgba(8, 27, 90, 0.06);
    transition:
        transform 0.25s ease,
        box-shadow 0.25s ease,
        border-color 0.25s ease;
}

.about-cta__highlight:hover {
    transform: translateY(-4px);
    border-color: rgba(1, 12, 128, 0.14);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.12);
}

.about-cta__highlight-title {
    margin-bottom: 0.55rem;
    color: #08173f;
    font-size: 1rem;
    line-height: 1.35;
}

.about-cta__highlight-text {
    margin-bottom: 0;
    color: #5a6480;
    font-size: 0.95rem;
    line-height: 1.65;
}

.about-cta__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem 1.5rem;
}

.about-cta__body {
    flex: 1 1 22rem;
    margin-bottom: 0;
    color: #44506d;
    font-size: 1rem;
    line-height: 1.75;
}

.about-cta__button {
    min-width: 9rem;
    min-height: 3rem;
    padding-inline: 1.5rem;
    font-weight: 700;
}

@keyframes about-rise {
    from {
        opacity: 0;
        transform: translateY(28px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (max-width: 1260px) {
    .about-cta__highlights {
        grid-template-columns: 1fr;
    }
}

@media screen and (max-width: 960px) {
    .about-cta-section {
        padding: 4rem 0;
    }

    .about-cta__panel {
        grid-template-columns: 1fr;
    }

    .about-cta__title {
        max-width: 100%;
    }

    .about-cta__image-wrap {
        max-width: 44rem;
        margin: 0 auto;
    }
}

@media screen and (max-width: 600px) {
    .about-cta-section {
        padding: 3.25rem 0;
    }

    .about-cta__image-wrap {
        border-radius: 1.4rem;
    }

    .about-cta__floating {
        right: 0.85rem;
        bottom: 0.85rem;
        max-width: 13rem;
        padding: 0.85rem 0.95rem;
    }

    .about-cta__title {
        font-size: clamp(1.9rem, 8vw, 2.6rem);
        line-height: 1;
    }

    .about-cta__lead,
    .about-cta__body {
        font-size: 0.98rem;
        line-height: 1.65;
    }
}

@media (prefers-reduced-motion: reduce) {
    .about-cta__media,
    .about-cta__content,
    .about-cta__highlight {
        animation: none;
        transition: none;
    }
}
</style>
