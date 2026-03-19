<script setup lang="ts">
const route = useRoute()
const slug = computed<string[] | string>(() => {
    if (route.params.slug) {
        return route.params.slug
    }
    const parts = route.path.split("/")
    return parts[parts.length - 1] || ""
})

const { data: currentPost } = await useAsyncData(`post-${slug.value}`, () => queryCollection("content").path(`/${slug.value}`).first())

const relatedQuery = queryCollection("content")
    .order("date", "DESC")
    .limit(3)
    .where("path", "NOT LIKE", currentPost.value?.path || "")

const { data: relatedPosts } = await useAsyncData(`related-${slug.value}`, () => relatedQuery.all())

useHead({
    title: `${currentPost.value?.title ?? "Shop"} | Ecommerce`
})
</script>

<template>
    <main class="blogPost">
        <VContainer class="blogPost__container">
            <section class="blogPost__hero">
                <div class="blogPost__heroCopy">
                    <span class="blogPost__eyebrow">Journal</span>
                    <h1 class="blogPost__title">{{ currentPost?.title }}</h1>
                    <div class="blogPost__meta">
                        <span v-if="currentPost?.date" class="blogPost__metaItem">
                            <VIcon icon="mdi-calendar-blank-outline" size="18" />
                            {{ currentPost.date }}
                        </span>
                        <span v-if="currentPost?.author" class="blogPost__metaItem">
                            <VIcon icon="mdi-account-outline" size="18" />
                            {{ currentPost.author }}
                        </span>
                    </div>
                </div>
            </section>

            <section class="blogPost__article">
                <NuxtImg
                    v-if="currentPost?.image"
                    :src="currentPost.image"
                    :alt="currentPost.title"
                    format="webp"
                    width="1600"
                    height="900"
                    sizes="100vw md:960px"
                    densities="x1 x2"
                    class="blogPost__image"
                />
                <div class="blogPost__content">
                    <ContentRenderer v-if="currentPost" :value="currentPost" />
                </div>
            </section>

            <section class="blogPost__related">
                <div class="blogPost__relatedIntro">
                    <h2 class="blogPost__relatedTitle">Related posts</h2>
                </div>

                <VRow v-if="relatedPosts && relatedPosts.length > 0" class="blogPost__relatedGrid" align="stretch">
                    <VCol v-for="article in relatedPosts" :key="article.path" cols="12" md="6" lg="4" class="blogPost__relatedCol">
                        <BlogCard :article="article" compact />
                    </VCol>
                </VRow>

                <div v-else class="blogPost__empty">No related posts found.</div>
            </section>
        </VContainer>
    </main>
</template>

<style scoped lang="scss">
.blogPost {
    min-height: 100vh;
    padding: clamp(4rem, 7vw, 6rem) 0;
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #ffffff 0%, #f7faff 100%);

    &__container {
        position: relative;
        z-index: 1;
    }

    &__hero {
        display: flex;
        justify-content: center;
        margin-bottom: 2.5rem;
    }

    &__heroCopy,
    &__article,
    &__relatedCol {
        animation: blog-post-rise 0.78s ease both;
    }

    &__heroCopy {
        width: 100%;
        max-width: 880px;
        text-align: center;
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
        margin: 0 auto 1rem;
        color: #08173f;
        font-size: clamp(2.25rem, 4.5vw, 4.3rem);
        line-height: 0.96;
        letter-spacing: -0.06rem;
        text-wrap: balance;
    }

    &__meta {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.85rem 1.15rem;
    }

    &__metaItem {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        color: #6a758f;
        font-size: 0.92rem;
        line-height: 1.4;
    }

    &__article {
        max-width: 960px;
        margin: 0 auto 3rem;
    }

    &__image {
        width: 100%;
        height: auto;
        margin-bottom: 1.5rem;
        border-radius: 1.5rem;
    }

    &__content {
        padding: clamp(1.5rem, 3vw, 2rem);
        border: 1px solid rgba(8, 23, 63, 0.08);
        border-radius: 1.5rem;
        background: rgba(255, 255, 255, 0.86);
        color: #2f3c59;
        line-height: 1.8;
        box-shadow: 0 16px 48px rgba(10, 28, 86, 0.06);
    }

    &__related {
        margin-top: 1rem;
    }

    &__relatedIntro {
        display: flex;
        justify-content: center;
        margin-bottom: 1.5rem;
    }

    &__relatedTitle {
        margin: 0;
        color: #08173f;
        font-size: clamp(1.7rem, 3vw, 2.3rem);
        line-height: 1.1;
    }

    &__relatedGrid {
        row-gap: 1.25rem;
    }

    &__relatedCol {
        &:nth-child(2) {
            animation-delay: 0.08s;
        }

        &:nth-child(3) {
            animation-delay: 0.14s;
        }
    }

    &__empty {
        color: #53607b;
        text-align: center;
        font-size: 0.98rem;
        line-height: 1.6;
    }
}

:deep(.blogPost__content h2),
:deep(.blogPost__content h3),
:deep(.blogPost__content h4) {
    color: #08173f;
    margin-top: 1.7rem;
    margin-bottom: 0.8rem;
}

:deep(.blogPost__content p),
:deep(.blogPost__content li) {
    color: #42506b;
    font-size: 1.02rem;
    line-height: 1.85;
}

:deep(.blogPost__content img) {
    border-radius: 1rem;
}

@keyframes blog-post-rise {
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
    .blogPost {
        padding: 3.5rem 0;

        &__title {
            max-width: 100%;
            font-size: clamp(2rem, 7vw, 3rem);
        }

        &__content {
            padding: 1.15rem;
        }

        &__image {
            border-radius: 1rem;
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    .blogPost {
        &__heroCopy,
        &__article,
        &__relatedCol {
            animation: none;
        }
    }
}
</style>
