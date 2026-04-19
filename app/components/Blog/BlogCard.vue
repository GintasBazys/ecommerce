<script setup lang="ts">
import type { BlogPostSummary } from "~/types/blog"

import { BLOG_HANDLE } from "~/utils/consts"
import { formatDate } from "~/utils/formatDate"

const FALLBACK_IMAGE = "/images/about-premium.jpg"

const { article, compact = false } = defineProps<{
    article: BlogPostSummary
    compact?: boolean
}>()

const articleHref = computed<string>(() => `${BLOG_HANDLE}/${article.slug}`)
const articleImage = computed<string>(() => article.thumbnail || FALLBACK_IMAGE)
const articleDate = computed<string>(() => formatDate(article.publishedAt))
</script>

<template>
    <article class="blog-card" :class="{ 'blog-card--compact': compact }">
        <NuxtLink :to="articleHref" class="blog-card__media-link">
            <div class="blog-card__media">
                <NuxtImg
                    :src="articleImage"
                    :alt="article.title"
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
            <div class="blog-card__meta">
                <span v-if="article.category" class="blog-card__category">{{ article.category.name }}</span>
                <span v-if="articleDate" class="blog-card__meta-item">
                    <span class="blog-card__meta-dot" aria-hidden="true"></span>
                    {{ articleDate }}
                </span>
                <span v-if="article.author" class="blog-card__meta-item">
                    <span class="blog-card__meta-dot" aria-hidden="true"></span>
                    {{ article.author }}
                </span>
            </div>

            <NuxtLink :to="articleHref" class="blog-card__title-link">
                <h3 class="blog-card__title">{{ article.title }}</h3>
            </NuxtLink>

            <p class="blog-card__description">{{ article.excerpt || "Read the latest journal entry from the storefront." }}</p>

            <NuxtLink :to="articleHref" class="blog-card__cta-link">
                <span class="blog-card__cta">Read article</span>
                <span aria-hidden="true">→</span>
            </NuxtLink>
        </div>
    </article>
</template>

<style scoped>
.blog-card {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
    overflow: hidden;
    border: 1px solid rgba(226, 232, 240, 0.9);
    border-radius: 1.6rem;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
    box-shadow: 0 18px 40px rgba(8, 27, 90, 0.06);
    transition:
        transform 0.3s ease,
        border-color 0.3s ease,
        box-shadow 0.3s ease;
}

.blog-card:hover {
    transform: translateY(-4px);
    border-color: rgba(202, 138, 4, 0.2);
    box-shadow: 0 22px 48px rgba(8, 27, 90, 0.1);
}

.blog-card--compact .blog-card__media {
    aspect-ratio: 1.12;
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
    aspect-ratio: 1.2;
    background:
        radial-gradient(circle at top right, rgba(202, 138, 4, 0.16), transparent 30%), linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
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
    background: linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.18) 100%);
    pointer-events: none;
}

.blog-card__body {
    display: grid;
    gap: 0.95rem;
    padding: 1.25rem;
}

.blog-card__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.6rem 0.8rem;
}

.blog-card__category {
    display: inline-flex;
    min-height: 2rem;
    align-items: center;
    border-radius: 999px;
    border: 1px solid rgba(253, 230, 138, 0.8);
    background: rgba(254, 243, 199, 0.7);
    padding: 0.35rem 0.8rem;
    color: #78350f;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.blog-card__meta-item {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    color: #64748b;
    font-size: 0.8rem;
    line-height: 1.4;
}

.blog-card__meta-dot {
    height: 0.3rem;
    width: 0.3rem;
    border-radius: 999px;
    background: #cbd5e1;
}

.blog-card__title {
    display: -webkit-box;
    overflow: hidden;
    margin: 0;
    color: #0f172a;
    font-size: 1.22rem;
    line-height: 1.3;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}

.blog-card__description {
    display: -webkit-box;
    overflow: hidden;
    min-height: 4.2rem;
    margin: 0;
    color: #475569;
    font-size: 0.97rem;
    line-height: 1.75;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
}

.blog-card__cta-link {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    width: fit-content;
    margin-top: auto;
    color: #8a6a2f;
    font-size: 0.92rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    transition: color 0.2s ease;
}

.blog-card__cta-link:hover {
    color: #6b4f1d;
}

@media screen and (max-width: 767px) {
    .blog-card__body {
        padding: 1rem;
    }

    .blog-card__title {
        font-size: 1.08rem;
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
