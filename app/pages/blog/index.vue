<script setup lang="ts">
useHead({
    title: `Blog | Ecommerce`
})

const limit = 12
const page = ref<number>(1)
const skip = computed<number>(() => (page.value - 1) * limit)

const { data: articles, refresh: refreshArticles } = useAsyncData(`articles-page-${page.value}`, () =>
    queryCollection("content").order("date", "DESC").limit(limit).skip(skip.value).select("title", "path", "description", "image").all()
)

const { data: allArticles } = useAsyncData("all-content", () => queryCollection("content").select("path").all())

const total = computed<number>(() => allArticles.value?.length ?? 0)
const totalPages = computed<number>(() => Math.ceil(total.value / limit))

const route = useRoute()
const router = useRouter()

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
</script>

<template>
    <main class="blogIndex">
        <VContainer class="blogIndex__container">
            <section class="blogIndex__hero">
                <div class="blogIndex__heroCopy">
                    <span class="blogIndex__eyebrow">Journal</span>
                    <h1 class="blogIndex__title">Explore the latest posts with a cleaner reading and browsing experience.</h1>
                    <p class="blogIndex__description">
                        Thoughtful ecommerce notes, product ideas, and practical reading pieces presented with lighter cards and a more
                        modern editorial rhythm.
                    </p>
                </div>
            </section>
            <VRow class="blogIndex__grid" align="stretch">
                <VCol v-for="article in articles" :key="article.path" cols="12" md="6" lg="4" class="blogIndex__col">
                    <BlogCard :article="article" />
                </VCol>
            </VRow>
            <div v-if="totalPages > 1" class="blogIndex__pagination">
                <VBtn color="primary" variant="flat" rounded="pill" :disabled="page === 1" @click="page--">Previous</VBtn>
                <span class="blogIndex__paginationLabel">Page {{ page }} of {{ totalPages }}</span>
                <VBtn color="primary" variant="flat" rounded="pill" :disabled="page === totalPages" @click="page++">Next</VBtn>
            </div>
        </VContainer>
    </main>
</template>

<style scoped lang="scss">
.blogIndex {
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
    &__col,
    &__pagination {
        animation: blog-index-rise 0.75s ease both;
    }

    &__heroCopy {
        width: 100%;
        max-width: 860px;
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

    &__pagination {
        animation-delay: 0.18s;
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
        margin: 0 auto 1rem;
        color: #08173f;
        font-size: clamp(2.25rem, 4.5vw, 4.2rem);
        line-height: 0.96;
        letter-spacing: -0.06rem;
        text-wrap: balance;
    }

    &__description {
        max-width: 760px;
        margin: 0 auto;
        color: #53607b;
        font-size: 1.03rem;
        line-height: 1.75;
    }

    &__grid {
        row-gap: 1.25rem;
    }

    &__pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 2.5rem;
    }

    &__paginationLabel {
        color: #53607b;
        font-size: 0.95rem;
        line-height: 1.4;
    }
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
    .blogIndex {
        padding: 3.5rem 0;

        &__title {
            max-width: 100%;
            font-size: clamp(2rem, 7vw, 3rem);
        }

        &__pagination {
            flex-wrap: wrap;
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    .blogIndex {
        &__heroCopy,
        &__col,
        &__pagination {
            animation: none;
        }
    }
}
</style>
