<script setup lang="ts">
import type { SchemaNode } from "~/composables/useStructuredData"

type BlogPost = {
    title?: string
    path?: string
    description?: string
    image?: string
    author?: string
    date?: string
}

const route = useRoute()
const { organizationId, absoluteUrl } = useSiteIdentity()
const slug = computed<string[] | string>(() => {
    if (route.params.slug) {
        return route.params.slug
    }
    const parts = route.path.split("/")
    return parts[parts.length - 1] || ""
})

const { data: currentPost } = await useAsyncData<BlogPost | null>(`post-${slug.value}`, () =>
    queryCollection("content").path(`/${slug.value}`).first()
)

const relatedQuery = queryCollection("content")
    .order("date", "DESC")
    .limit(3)
    .where("path", "NOT LIKE", currentPost.value?.path || "")

const { data: relatedPosts } = await useAsyncData(`related-${slug.value}`, () => relatedQuery.all())

useHead({
    title: `${currentPost.value?.title ?? "Shop"} | Ecommerce`
})

const articleUrl = computed<string>(() => absoluteUrl(route.path))
const breadcrumbItems = computed(() => [
    { label: "Home", to: "/" },
    { label: "Blog", to: "/blog" },
    { label: currentPost.value?.title || "Article" }
])

const articleSchema = computed<SchemaNode | null>(() => {
    if (!currentPost.value?.title) {
        return null
    }

    const image = currentPost.value.image ? absoluteUrl(currentPost.value.image) : undefined

    return {
        "@type": "BlogPosting",
        "@id": `${articleUrl.value}#article`,
        headline: currentPost.value.title,
        description: currentPost.value.description || undefined,
        url: articleUrl.value,
        mainEntityOfPage: articleUrl.value,
        image: image ? [image] : undefined,
        datePublished: normalizeSchemaDate(currentPost.value.date),
        dateModified: normalizeSchemaDate(currentPost.value.date),
        author: {
            "@type": "Person",
            name: currentPost.value.author || "Admin"
        },
        publisher: {
            "@id": organizationId.value
        }
    }
})

const breadcrumbSchema = computed<SchemaNode | null>(() => {
    if (!currentPost.value?.title) {
        return null
    }

    return createBreadcrumbSchema(
        [
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: currentPost.value.title, path: route.path }
        ],
        absoluteUrl
    )
})

useStructuredData(() => [articleSchema.value, breadcrumbSchema.value], "blog-post-structured-data")
</script>

<template>
    <main class="blog-post">
        <VContainer class="blog-post__container">
            <section class="blog-post__hero">
                <div class="blog-post__hero-copy">
                    <AppBreadcrumbs :items="breadcrumbItems" class="blog-post__breadcrumbs" />
                    <span class="blog-post__eyebrow">Journal</span>
                    <h1 class="blog-post__title">{{ currentPost?.title }}</h1>
                    <div class="blog-post__meta">
                        <span v-if="currentPost?.date" class="blog-post__meta-item">
                            <VIcon icon="mdi-calendar-blank-outline" size="18" />
                            {{ currentPost.date }}
                        </span>
                        <span v-if="currentPost?.author" class="blog-post__meta-item">
                            <VIcon icon="mdi-account-outline" size="18" />
                            {{ currentPost.author }}
                        </span>
                    </div>
                </div>
            </section>
            <section class="blog-post__article">
                <NuxtImg
                    v-if="currentPost?.image"
                    :src="currentPost.image"
                    :alt="currentPost.title"
                    format="webp"
                    width="1600"
                    height="900"
                    sizes="100vw md:960px"
                    densities="x1 x2"
                    class="blog-post__image"
                />
                <div class="blog-post__content">
                    <ContentRenderer v-if="currentPost" :value="currentPost" />
                </div>
            </section>
            <section class="blog-post__related">
                <div class="blog-post__related-intro">
                    <h2 class="blog-post__related-title">Related posts</h2>
                </div>
                <VRow v-if="relatedPosts && relatedPosts.length > 0" class="blog-post__related-grid" align="stretch">
                    <VCol v-for="article in relatedPosts" :key="article.path" cols="12" md="6" lg="4" class="blog-post__related-col">
                        <BlogCard :article="article" compact />
                    </VCol>
                </VRow>
                <div v-else class="blog-post__empty">No related posts found.</div>
            </section>
        </VContainer>
    </main>
</template>

<style scoped lang="scss">
.blog-post {
    min-height: 100vh;
    padding: 6rem 0;
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%), linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
}

.blog-post__container {
    position: relative;
    z-index: 1;
}

.blog-post__hero {
    display: flex;
    justify-content: center;
    margin-bottom: 2.5rem;
}

.blog-post__hero-copy,
.blog-post__article,
.blog-post__related-col {
    animation: blog-post-rise 0.78s ease both;
}

.blog-post__hero-copy {
    width: 100%;
    max-width: 880px;
    text-align: center;
}

.blog-post__breadcrumbs {
    margin: 0 auto 1rem;
}

.blog-post__eyebrow {
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

.blog-post__title {
    max-width: 800px;
    margin: 0 auto 1rem;
    color: #08173f;
    font-size: 4.3rem;
    line-height: 0.96;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.blog-post__meta {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.85rem 1.15rem;
}

.blog-post__meta-item {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: #6a758f;
    font-size: 0.92rem;
    line-height: 1.4;
}

.blog-post__article {
    max-width: 960px;
    margin: 0 auto 3rem;
}

.blog-post__image {
    width: 100%;
    height: auto;
    margin-bottom: 1.5rem;
    border-radius: 1.5rem;
}

.blog-post__content {
    padding: 2rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.5rem;
    background: rgba(255, 255, 255, 0.86);
    color: #2f3c59;
    line-height: 1.8;
    box-shadow: 0 16px 48px rgba(10, 28, 86, 0.06);
}

.blog-post__related {
    margin-top: 1rem;
}

.blog-post__related-intro {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
}

.blog-post__related-title {
    margin: 0;
    color: #08173f;
    font-size: 2.3rem;
    line-height: 1.1;
}

.blog-post__related-grid {
    row-gap: 1.25rem;
}

.blog-post__related-col:nth-child(2) {
    animation-delay: 0.08s;
}

.blog-post__related-col:nth-child(3) {
    animation-delay: 0.14s;
}

.blog-post__empty {
    color: #53607b;
    text-align: center;
    font-size: 0.98rem;
    line-height: 1.6;
}

:deep(.blog-post__content h2),
:deep(.blog-post__content h3),
:deep(.blog-post__content h4) {
    color: #08173f;
    margin-top: 1.7rem;
    margin-bottom: 0.8rem;
}

:deep(.blog-post__content a) {
    color: #010c80;
    text-decoration: none;
}

:deep(.blog-post__content p),
:deep(.blog-post__content li) {
    color: #42506b;
    font-size: 1.02rem;
    line-height: 1.85;
}

:deep(.blog-post__content img) {
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
    .blog-post {
        padding: 3.5rem 0;
    }

    .blog-post__title {
        max-width: 100%;
        font-size: 3rem;
    }

    .blog-post__content {
        padding: 1.15rem;
    }

    .blog-post__image {
        border-radius: 1rem;
    }

    .blog-post__related-title {
        font-size: 2rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .blog-post__hero-copy,
    .blog-post__article,
    .blog-post__related-col {
        animation: none;
    }
}
</style>
