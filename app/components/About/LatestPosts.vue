<script setup lang="ts">
const { data: latestPosts } = await useAsyncData("/", () => queryCollection("content").limit(3).order("date", "DESC").all())
</script>

<template>
    <section class="latestPostsSection">
        <VContainer class="latestPostsSection__container">
            <div class="latestPostsSection__intro">
                <div class="latestPostsSection__copy">
                    <span class="latestPostsSection__eyebrow">Journal</span>
                    <h2 class="latestPostsSection__title">Fresh reads that keep the storefront feeling alive and useful.</h2>
                    <p class="latestPostsSection__description">
                        Short, practical articles with a cleaner card layout, brighter visuals, and clearer routes into the full story.
                    </p>
                </div>
            </div>

            <VRow class="latestPostsSection__grid" align="stretch">
                <template v-if="latestPosts">
                    <VCol v-for="article in latestPosts" :key="article.path" cols="12" md="6" lg="4" class="latestPostsSection__col">
                        <BlogCard :article="article" />
                    </VCol>
                </template>
            </VRow>
        </VContainer>
    </section>
</template>

<style scoped lang="scss">
.latestPostsSection {
    position: relative;
    overflow: hidden;
    padding: clamp(4.5rem, 7vw, 6.5rem) 0;
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #ffffff 0%, #f7faff 100%);

    &__container {
        position: relative;
        z-index: 1;
    }

    &__intro {
        display: flex;
        justify-content: center;
        margin-bottom: 2rem;
    }

    &__copy,
    &__col {
        animation: latest-post-rise 0.75s ease both;
    }

    &__copy {
        width: 100%;
        max-width: 820px;
        text-align: center;
    }

    &__col {
        &:nth-child(2) {
            animation-delay: 0.08s;
        }

        &:nth-child(3) {
            animation-delay: 0.14s;
        }
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
        max-width: 18ch;
        margin: 0 auto 0.9rem;
        color: #08173f;
        font-size: clamp(2rem, 3.8vw, 3.5rem);
        line-height: 0.98;
        letter-spacing: -0.05rem;
        text-wrap: balance;
    }

    &__description {
        max-width: 760px;
        margin: 0 auto;
        color: #53607b;
        font-size: 1rem;
        line-height: 1.75;
    }

    &__grid {
        row-gap: 1.25rem;
    }
}

@keyframes latest-post-rise {
    from {
        opacity: 0;
        transform: translateY(24px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (max-width: 767px) {
    .latestPostsSection {
        padding: 3.75rem 0;

        &__title {
            max-width: 100%;
            font-size: clamp(1.9rem, 7vw, 2.75rem);
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    .latestPostsSection {
        &__copy,
        &__col {
            animation: none;
        }
    }
}
</style>
