<script setup lang="ts">
const limit = 12
const page = ref<number>(1)
const skip = computed(() => (page.value - 1) * limit)

const { data: articles, refresh: refreshArticles } = useAsyncData(`articles-page-${page.value}`, () =>
    queryCollection("content").order("date", "DESC").limit(limit).skip(skip.value).select("title", "path", "description", "image").all()
)

const { data: allArticles } = useAsyncData("all-content", () => queryCollection("content").select("path").all())

const total = computed(() => allArticles.value?.length ?? 0)
const totalPages = computed(() => Math.ceil(total.value / limit))

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
    <main>
        <VContainer>
            <VRow justify="center" class="mb-6 mt-10 blog-row">
                <VCol cols="12" md="8">
                    <h1 class="text-center">Explore Latest Blog Posts</h1>
                </VCol>
            </VRow>

            <VRow>
                <VCol v-for="article in articles" :key="article.path" cols="12" md="6" lg="4">
                    <NuxtLink :to="route.path + article.path" style="text-decoration: none">
                        <VImg :src="article.image" :alt="article.title" height="250" class="mb-4 rounded-lg" cover />
                    </NuxtLink>

                    <NuxtLink :to="route.path + article.path" class="text-decoration-none">
                        <h2 class="text-h6 mb-2">{{ article.title }}</h2>
                    </NuxtLink>

                    <p class="mb-4">{{ article.description }}</p>

                    <NuxtLink :to="route.path + article.path">
                        <VBtn variant="outlined" color="primary">Read more</VBtn>
                    </NuxtLink>
                </VCol>
            </VRow>

            <VRow v-if="totalPages > 1" justify="center" class="mt-6">
                <VCol cols="auto">
                    <VBtn color="primary" variant="flat" :disabled="page === 1" class="mx-2" @click="page--"> Previous </VBtn>

                    <span class="mx-2">Page {{ page }} of {{ totalPages }}</span>

                    <VBtn color="primary" variant="flat" :disabled="page === totalPages" class="mx-2" @click="page++"> Next </VBtn>
                </VCol>
            </VRow>
        </VContainer>
    </main>
</template>
