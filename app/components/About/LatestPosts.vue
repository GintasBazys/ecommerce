<script setup lang="ts">
import type { BlogPostsResponse } from "~/types/blog"

import BlogCard from "~/components/Blog/BlogCard.vue"
import { BLOG_HANDLE } from "~/utils/consts"

const { data: latestPostsData, error: latestPostsError } = await useAsyncData("latest-blog-posts", () =>
    $fetch<BlogPostsResponse>("/api/blog/posts", {
        query: {
            limit: 3,
            offset: 0
        }
    })
)

const latestPosts = computed(() => latestPostsData.value?.posts || [])
</script>

<template>
    <section class="latest-posts-section">
        <div class="latest-posts-section__container">
            <div class="latest-posts-section__intro">
                <div class="latest-posts-section__copy">
                    <span class="latest-posts-section__eyebrow">Journal</span>
                    <h2 class="latest-posts-section__title">Journal posts with the same premium tone as the storefront.</h2>
                    <p class="latest-posts-section__description">
                        Editorial updates, product context, and commerce guidance surfaced in a calmer, more refined reading layout.
                    </p>
                </div>

                <NuxtLink :to="BLOG_HANDLE" class="latest-posts-section__link">Browse all posts</NuxtLink>
            </div>

            <div v-if="latestPosts.length" class="latest-posts-section__grid">
                <div v-for="article in latestPosts" :key="article.id" class="latest-posts-section__col">
                    <BlogCard :article="article" />
                </div>
            </div>

            <div v-else-if="latestPostsError" class="latest-posts-section__state">
                Something went wrong while loading the journal. Please try again.
            </div>

            <div v-else class="latest-posts-section__state">No blog posts published yet.</div>
        </div>
    </section>
</template>

<style scoped>
.latest-posts-section {
    position: relative;
    overflow: hidden;
    padding: clamp(4.5rem, 7vw, 6.5rem) 1rem;
    background:
        radial-gradient(circle at top left, rgba(245, 158, 11, 0.08), transparent 24%), linear-gradient(180deg, #fcfdff 0%, #f6f8fc 100%);
}

.latest-posts-section__container {
    position: relative;
    z-index: 1;
    margin: 0 auto;
    width: 100%;
    max-width: 80rem;
}

.latest-posts-section__intro {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.latest-posts-section__copy,
.latest-posts-section__col {
    animation: latest-post-rise 0.75s ease both;
}

.latest-posts-section__copy {
    max-width: 46rem;
}

.latest-posts-section__col:nth-child(2) {
    animation-delay: 0.08s;
}

.latest-posts-section__col:nth-child(3) {
    animation-delay: 0.14s;
}

.latest-posts-section__eyebrow {
    display: inline-flex;
    align-items: center;
    min-height: 2.3rem;
    padding: 0.45rem 0.9rem;
    margin-bottom: 1rem;
    border-radius: 999px;
    border: 1px solid rgba(253, 230, 138, 0.72);
    background: rgba(254, 243, 199, 0.72);
    color: #78350f;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.latest-posts-section__link {
    display: inline-flex;
    min-height: 2.75rem;
    align-items: center;
    justify-content: center;
    align-self: flex-start;
    border-radius: 999px;
    border: 1px solid rgba(203, 213, 225, 1);
    background: rgba(255, 255, 255, 0.92);
    padding: 0.75rem 1.15rem;
    color: #1e293b;
    font-size: 0.92rem;
    font-weight: 700;
    text-decoration: none;
    box-shadow: 0 10px 24px rgba(8, 27, 90, 0.05);
    transition:
        border-color 0.2s ease,
        color 0.2s ease;
}

.latest-posts-section__link:hover {
    border-color: rgba(253, 230, 138, 0.95);
    color: #0f172a;
}

.latest-posts-section__title {
    max-width: 14ch;
    margin: 0 0 0.9rem;
    color: #08173f;
    font-size: clamp(2rem, 3.8vw, 3.5rem);
    line-height: 0.98;
    letter-spacing: -0.05rem;
    text-wrap: balance;
}

.latest-posts-section__description {
    max-width: 42rem;
    margin: 0;
    color: #53607b;
    font-size: 1rem;
    line-height: 1.75;
}

.latest-posts-section__grid {
    display: grid;
    gap: 1.25rem;
    grid-template-columns: repeat(1, minmax(0, 1fr));
}

.latest-posts-section__state {
    border: 1px solid rgba(226, 232, 240, 0.9);
    border-radius: 1.5rem;
    background: rgba(255, 255, 255, 0.9);
    padding: 1.5rem;
    color: #475569;
    text-align: center;
    box-shadow: 0 14px 32px rgba(8, 27, 90, 0.06);
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
    .latest-posts-section {
        padding: 3.75rem 1rem;
    }

    .latest-posts-section__intro {
        align-items: flex-start;
        flex-direction: column;
    }

    .latest-posts-section__title {
        max-width: 100%;
        font-size: clamp(1.9rem, 7vw, 2.75rem);
    }
}

@media screen and (min-width: 768px) {
    .latest-posts-section__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media screen and (min-width: 1200px) {
    .latest-posts-section__grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (prefers-reduced-motion: reduce) {
    .latest-posts-section__copy,
    .latest-posts-section__col {
        animation: none;
    }
}
</style>
