<script setup lang="ts">
const approachSteps = [
    {
        title: "Select with intent",
        text: "We focus on products that are genuinely useful, durable, and easy to integrate into daily shopping habits."
    },
    {
        title: "Design for clarity",
        text: "Navigation, content, and checkout are structured so decisions feel simple and confidence stays high."
    },
    {
        title: "Support after checkout",
        text: "Delivery and service are treated as part of the product experience, not a separate afterthought."
    }
]
</script>

<template>
    <section class="aboutApproach">
        <VContainer class="aboutApproach__container">
            <div class="aboutApproach__intro">
                <span class="aboutApproach__eyebrow">Our Approach</span>
                <h2 class="aboutApproach__title">A practical framework that keeps quality high and experience simple.</h2>
                <p class="aboutApproach__description">
                    The way we operate is straightforward: curate better, communicate clearly, and keep every step from product discovery to
                    post-purchase support easy to trust.
                </p>
            </div>

            <div class="aboutApproach__panel">
                <div class="aboutApproach__media">
                    <NuxtImg
                        src="/images/about_banner.webp"
                        alt="Our approach visual"
                        width="1140"
                        height="880"
                        format="webp"
                        class="aboutApproach__image"
                    />
                </div>

                <div class="aboutApproach__content">
                    <h3 class="aboutApproach__contentTitle">How we work</h3>
                    <p class="aboutApproach__contentLead">
                        We balance product quality, transparent pricing, and speed of execution. That balance is what shapes every release,
                        campaign, and customer flow in the store.
                    </p>

                    <div class="aboutApproach__steps">
                        <article v-for="(step, index) in approachSteps" :key="step.title" class="aboutApproach__step">
                            <span class="aboutApproach__stepIndex">0{{ index + 1 }}</span>
                            <div class="aboutApproach__stepBody">
                                <h4 class="aboutApproach__stepTitle">{{ step.title }}</h4>
                                <p class="aboutApproach__stepText">{{ step.text }}</p>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
        </VContainer>
    </section>
</template>

<style scoped lang="scss">
.aboutApproach {
    position: relative;
    overflow: hidden;
    padding: clamp(4rem, 6vw, 5.5rem) 0;
    background:
        radial-gradient(circle at top right, rgba(0, 128, 255, 0.1), transparent 26%),
        linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%);

    &__container {
        position: relative;
        z-index: 1;
    }

    &__intro {
        max-width: 860px;
        margin: 0 auto 2rem;
        text-align: center;
        animation: about-approach-rise 0.75s ease both;
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
        max-width: 800px;
        margin: 0 auto 0.9rem;
        color: #08173f;
        font-size: clamp(2rem, 3.7vw, 3.55rem);
        line-height: 0.98;
        letter-spacing: -0.05rem;
        text-wrap: balance;
    }

    &__description {
        max-width: 780px;
        margin: 0 auto;
        color: #55617c;
        font-size: 1rem;
        line-height: 1.75;
    }

    &__panel {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: clamp(1.25rem, 3vw, 2.5rem);
        align-items: stretch;
    }

    &__media,
    &__content {
        animation: about-approach-rise 0.75s ease both;
    }

    &__content {
        animation-delay: 0.1s;
        display: grid;
        align-content: start;
        gap: 1rem;
        padding: clamp(1.1rem, 2vw, 1.5rem);
        border: 1px solid rgba(8, 23, 63, 0.08);
        border-radius: 1.35rem;
        background: rgba(255, 255, 255, 0.9);
    }

    &__image {
        width: 100%;
        height: 100%;
        min-height: 100%;
        border-radius: 1.35rem;
        object-fit: cover;
    }

    &__contentTitle {
        margin-bottom: 0;
        color: #08173f;
        font-size: 1.45rem;
        line-height: 1.25;
    }

    &__contentLead {
        margin-bottom: 0;
        color: #55617c;
        font-size: 0.98rem;
        line-height: 1.72;
    }

    &__steps {
        display: grid;
        gap: 0.75rem;
    }

    &__step {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.8rem;
        padding: 0.85rem;
        border: 1px solid rgba(8, 23, 63, 0.08);
        border-radius: 1rem;
        background: rgba(247, 251, 255, 0.92);
    }

    &__stepIndex {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 2.1rem;
        height: 2.1rem;
        border-radius: 999px;
        background: linear-gradient(135deg, #010c80 0%, #0056d6 100%);
        color: #ffffff;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
    }

    &__stepBody {
        min-width: 0;
    }

    &__stepTitle {
        margin-bottom: 0.25rem;
        color: #08173f;
        font-size: 1rem;
        line-height: 1.35;
    }

    &__stepText {
        margin-bottom: 0;
        color: #5a6680;
        font-size: 0.92rem;
        line-height: 1.62;
    }
}

@keyframes about-approach-rise {
    from {
        opacity: 0;
        transform: translateY(22px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (max-width: 1024px) {
    .aboutApproach {
        &__panel {
            grid-template-columns: 1fr;
        }

        &__title {
            max-width: 100%;
        }

        &__image {
            max-height: 420px;
        }
    }
}

@media screen and (max-width: 767px) {
    .aboutApproach {
        padding: 3.25rem 0;

        &__title {
            font-size: clamp(1.85rem, 7vw, 2.75rem);
        }

        &__step {
            padding: 0.8rem;
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    .aboutApproach {
        &__intro,
        &__media,
        &__content {
            animation: none;
        }
    }
}
</style>
