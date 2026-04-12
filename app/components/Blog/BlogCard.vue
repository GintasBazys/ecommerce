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
    <article class="blog-card" :class="{ 'blog-card--compact': compact }">
        <NuxtLink :to="articleHref" class="blog-card__media-link">
            <div class="blog-card__media">
                <NuxtImg
                    :src="articleImage"
                    :alt="article.title || 'Blog post image'"
                    format="webp"
                    width="960"
                    height="640"
                    sizes="320px md:50vw xl:33vw"
                    densities="x1 x2"
                    class="blog-card__image"
                />
                <div class="blog-card__overlay"></div>
            </div>
        </NuxtLink>

        <div class="blog-card__body">
            <div v-if="article.date || article.author" class="blog-card__meta">
                <span v-if="article.date" class="blog-card__meta-item">
                    <VIcon icon="mdi-calendar-blank-outline" size="16" />
                    {{ article.date }}
                </span>
                <span v-if="article.author" class="blog-card__meta-item">
                    <VIcon icon="mdi-account-outline" size="16" />
                    {{ article.author }}
                </span>
            </div>

            <NuxtLink :to="articleHref" class="blog-card__title-link">
                <h3 class="blog-card__title">{{ article.title }}</h3>
            </NuxtLink>

            <p class="blog-card__description">{{ article.description }}</p>

            <NuxtLink :to="articleHref" class="blog-card__cta-link">
                <span class="blog-card__cta">Read article</span>
                <VIcon icon="mdi-arrow-right" size="18" />
            </NuxtLink>
        </div>
    </article>
</template>

<style scoped lang="scss">
.blog-card {
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
}

.blog-card:hover {
    transform: translateY(-4px);
    border-color: rgba(1, 12, 128, 0.16);
    background: linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%);
}

.blog-card--compact .blog-card__media {
    aspect-ratio: 1.18;
}

.blog-card__media-link,
.blog-card__title-link,
.blog-card__cta-link {
    color: inherit;
    text-decoration: none;
}

.blog-card__media {
    position: relative;
    overflow: hidden;
    aspect-ratio: 1.32;
    background: radial-gradient(circle at top, rgba(0, 128, 255, 0.14), transparent 38%), linear-gradient(180deg, #ecf4ff 0%, #dde9fb 100%);
}

.blog-card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.45s ease;
}

.blog-card:hover .blog-card__image {
    transform: scale(1.04);
}

.blog-card__overlay {
    position: absolute;
    inset: auto 0 0;
    height: 44%;
    background: linear-gradient(180deg, transparent 0%, rgba(7, 21, 67, 0.2) 100%);
    pointer-events: none;
}

.blog-card__body {
    display: grid;
    gap: 0.9rem;
    padding: 1.15rem;
}

.blog-card__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.85rem;
}

.blog-card__meta-item {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    color: #6a758f;
    font-size: 0.8rem;
    line-height: 1.4;
}

.blog-card__title {
    display: -webkit-box;
    overflow: hidden;
    margin: 0;
    color: #08173f;
    font-size: 1.18rem;
    line-height: 1.35;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}

.blog-card__description {
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

.blog-card__cta-link {
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

@media screen and (max-width: 767px) {
    .blog-card__body {
        padding: 1rem;
    }

    .blog-card__title {
        font-size: 1.06rem;
    }

    .blog-card__description {
        min-height: auto;
        font-size: 0.92rem;
        line-height: 1.6;
    }
}

@media (prefers-reduced-motion: reduce) {
    .blog-card,
    .blog-card__image {
        transition: none;
    }
}
</style>
