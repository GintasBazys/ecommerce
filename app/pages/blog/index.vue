<script setup lang="ts">
import type { SchemaNode } from "~/composables/useStructuredData"

type BlogArticle = {
    title?: string
    path?: string
    description?: string
    image?: string
    date?: string
    author?: string
}

const route = useRoute()
const { siteName, absoluteUrl } = useSiteIdentity()

useHead({
    title: `Blog | Ecommerce`
})

const limit = 12
const page = ref<number>(1)
const skip = computed<number>(() => (page.value - 1) * limit)

const { data: articles, refresh: refreshArticles } = useAsyncData<BlogArticle[]>(`articles-page-${page.value}`, () =>
    queryCollection("content")
        .order("date", "DESC")
        .limit(limit)
        .skip(skip.value)
        .select("title", "path", "description", "image", "date", "author")
        .all()
)

const { data: allArticles } = useAsyncData("all-content", () => queryCollection("content").select("path").all())

const total = computed<number>(() => allArticles.value?.length ?? 0)
const totalPages = computed<number>(() => Math.ceil(total.value / limit))
const router = useRouter()
const breadcrumbItems = computed(() => [{ label: "Home", to: "/" }, { label: "Blog" }])

const blogSchema = computed<SchemaNode>(() => ({
    "@type": "Blog",
    "@id": `${absoluteUrl(route.path)}#blog`,
    name: `${siteName.value} Blog`,
    description: "Editorial stories, ecommerce guidance, and product-focused insights from the store.",
    url: absoluteUrl(route.path)
}))

const blogListSchema = computed<SchemaNode | null>(() => {
    if (!articles.value?.length) {
        return null
    }

    return {
        "@type": "ItemList",
        itemListElement: articles.value.map((article, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(article.path ? `/blog${article.path}` : route.path),
            name: article.title || `Blog post ${index + 1}`
        }))
    }
})

const breadcrumbSchema = computed<SchemaNode>(() =>
    createBreadcrumbSchema(
        [
            { name: "Home", path: "/" },
            { name: "Blog", path: route.path }
        ],
        absoluteUrl
    )
)

page.value = parseInt(route.query.page as string) || 1

watch(
    () => route.query.page,
    (newPage) => {
        const pageNumber = parseInt(newPage as string) || 1
        if (pageNumber !== page.value) {
            page.value = pageNumber
        }
    }
)

watch(page, (newPage) => {
    router.push({ query: { ...route.query, page: newPage } })
    refreshArticles()
})

useStructuredData(() => [blogSchema.value, blogListSchema.value, breadcrumbSchema.value], "blog-index-structured-data")
</script>

<template>
    <main class="blog-index">
        <VContainer class="blog-index__container">
            <section class="blog-index__hero">
                <div class="blog-index__hero-copy">
                    <AppBreadcrumbs :items="breadcrumbItems" class="blog-index__breadcrumbs" />
                    <span class="blog-index__eyebrow">Journal</span>
                    <h1 class="blog-index__title">Explore the latest posts with a cleaner reading and browsing experience.</h1>
                    <p class="blog-index__description">
                        Thoughtful ecommerce notes, product ideas, and practical reading pieces presented with lighter cards and a more
                        modern editorial rhythm.
                    </p>
                </div>
            </section>
            <VRow class="blog-index__grid" align="stretch">
                <VCol v-for="article in articles" :key="article.path" cols="12" md="6" lg="4" class="blog-index__col">
                    <BlogCard :article="article" />
                </VCol>
            </VRow>
            <div v-if="totalPages > 1" class="blog-index__pagination">
                <VBtn color="primary" variant="flat" rounded="pill" :disabled="page === 1" @click="page--">Previous</VBtn>
                <span class="blog-index__pagination-label">Page {{ page }} of {{ totalPages }}</span>
                <VBtn color="primary" variant="flat" rounded="pill" :disabled="page === totalPages" @click="page++">Next</VBtn>
            </div>
        </VContainer>
    </main>
</template>

<style scoped lang="scss">
.blog-index {
    min-height: 100vh;
    padding: 6rem 0;
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%), linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
}

.blog-index__container {
    position: relative;
    z-index: 1;
}

.blog-index__hero {
    display: flex;
    justify-content: center;
    margin-bottom: 2.5rem;
}

.blog-index__hero-copy,
.blog-index__col,
.blog-index__pagination {
    animation: blog-index-rise 0.75s ease both;
}

.blog-index__hero-copy {
    width: 100%;
    max-width: 860px;
    text-align: center;
}

.blog-index__breadcrumbs {
    margin: 0 auto 1rem;
}

.blog-index__col:nth-child(2) {
    animation-delay: 0.08s;
}

.blog-index__col:nth-child(3) {
    animation-delay: 0.14s;
}

.blog-index__pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2.5rem;
    animation-delay: 0.18s;
}

.blog-index__eyebrow {
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

.blog-index__title {
    max-width: 18ch;
    margin: 0 auto 1rem;
    color: #08173f;
    font-size: 4.2rem;
    line-height: 0.96;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.blog-index__description {
    max-width: 760px;
    margin: 0 auto;
    color: #53607b;
    font-size: 1.03rem;
    line-height: 1.75;
}

.blog-index__grid {
    row-gap: 1.25rem;
}

.blog-index__pagination-label {
    color: #53607b;
    font-size: 0.95rem;
    line-height: 1.4;
}

@keyframes blog-index-rise {
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
    .blog-index {
        padding: 3.5rem 0;
    }

    .blog-index__title {
        max-width: 100%;
        font-size: 3rem;
    }

    .blog-index__pagination {
        flex-wrap: wrap;
    }
}

@media (prefers-reduced-motion: reduce) {
    .blog-index__hero-copy,
    .blog-index__col,
    .blog-index__pagination {
        animation: none;
    }
}
</style>
