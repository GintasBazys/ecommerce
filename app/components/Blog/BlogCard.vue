<script setup lang="ts">
import { BLOG_HANDLE } from "~/utils/consts"

type BlogCardArticle = {
    title?: string
    path?: string
    description?: string
    image?: string
    date?: string
    author?: string
}

const FALLBACK_IMAGE = "/images/blog/about_banner.webp"

const { article, compact = false } = defineProps<{
    article: BlogCardArticle
    compact?: boolean
}>()

const articleHref = computed<string>(() => `${BLOG_HANDLE}${article.path || ""}`)
const articleImage = computed<string>(() => article.image || FALLBACK_IMAGE)
</script>

<template>
    <article class="blogCard" :class="{ 'blogCard--compact': compact }">
        <NuxtLink :to="articleHref" class="blogCard__mediaLink">
            <div class="blogCard__media">
                <NuxtImg
                    :src="articleImage"
                    :alt="article.title || 'Blog post image'"
                    format="webp"
                    width="960"
                    height="640"
                    sizes="320px md:50vw xl:33vw"
                    densities="x1 x2"
                    class="blogCard__image"
                />
                <div class="blogCard__overlay"></div>
            </div>
        </NuxtLink>

        <div class="blogCard__body">
            <div v-if="article.date || article.author" class="blogCard__meta">
                <span v-if="article.date" class="blogCard__metaItem">
                    <VIcon icon="mdi-calendar-blank-outline" size="16" />
                    {{ article.date }}
                </span>
                <span v-if="article.author" class="blogCard__metaItem">
                    <VIcon icon="mdi-account-outline" size="16" />
                    {{ article.author }}
                </span>
            </div>

            <NuxtLink :to="articleHref" class="blogCard__titleLink">
                <h3 class="blogCard__title">{{ article.title }}</h3>
            </NuxtLink>

            <p class="blogCard__description">{{ article.description }}</p>

            <NuxtLink :to="articleHref" class="blogCard__ctaLink">
                <span class="blogCard__cta">Read article</span>
                <VIcon icon="mdi-arrow-right" size="18" />
            </NuxtLink>
        </div>
    </article>
</template>

<style scoped lang="scss">
.blogCard {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
    overflow: hidden;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.35rem;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    transition:
        transform 0.3s ease,
        border-color 0.3s ease,
        background-color 0.3s ease;

    &:hover {
        transform: translateY(-4px);
        border-color: rgba(1, 12, 128, 0.16);
        background: linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%);
    }

    &--compact {
        .blogCard__media {
            aspect-ratio: 1.18;
        }
    }

    &__mediaLink,
    &__titleLink,
    &__ctaLink {
        color: inherit;
        text-decoration: none;
    }

    &__media {
        position: relative;
        overflow: hidden;
        aspect-ratio: 1.32;
        background:
            radial-gradient(circle at top, rgba(0, 128, 255, 0.14), transparent 38%),
            linear-gradient(180deg, #ecf4ff 0%, #dde9fb 100%);
    }

    &__image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.45s ease;
    }

    &:hover &__image {
        transform: scale(1.04);
    }

    &__overlay {
        position: absolute;
        inset: auto 0 0;
        height: 44%;
        background: linear-gradient(180deg, transparent 0%, rgba(7, 21, 67, 0.2) 100%);
        pointer-events: none;
    }

    &__body {
        display: grid;
        gap: 0.9rem;
        padding: 1.15rem;
    }

    &__meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.85rem;
    }

    &__metaItem {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        color: #6a758f;
        font-size: 0.8rem;
        line-height: 1.4;
    }

    &__title {
        display: -webkit-box;
        overflow: hidden;
        margin: 0;
        color: #08173f;
        font-size: 1.18rem;
        line-height: 1.35;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
    }

    &__description {
        display: -webkit-box;
        overflow: hidden;
        min-height: 4.2rem;
        margin: 0;
        color: #53607b;
        font-size: 0.96rem;
        line-height: 1.7;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
    }

    &__ctaLink {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        width: fit-content;
        margin-top: auto;
        color: #010c80;
        font-size: 0.92rem;
        font-weight: 700;
        letter-spacing: 0.01em;
    }
}

@media screen and (max-width: 767px) {
    .blogCard {
        &__body {
            padding: 1rem;
        }

        &__title {
            font-size: 1.06rem;
        }

        &__description {
            min-height: auto;
            font-size: 0.92rem;
            line-height: 1.6;
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    .blogCard,
    .blogCard__image {
        transition: none;
    }
}
</style>
