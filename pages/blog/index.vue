<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

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
    <main class="spacer">
        <section class="container">
            <h1 class="text-center mb-5">Explore Latest Blog Posts</h1>
            <div class="row gy-4">
                <div v-for="article in articles" :key="article.path" class="col-lg-4 col-md-6">
                    <NuxtLink :to="route.path + article.path" class="d-block" style="text-decoration: none">
                        <NuxtImg :src="article.image" :alt="article.title" width="700" height="400" class="img-fluid mb-4 rounded-2" />
                    </NuxtLink>
                    <NuxtLink class="text-decoration-none" :to="route.path + article.path">
                        <h2 class="h4">{{ article.title }}</h2>
                    </NuxtLink>
                    <p>{{ article.description }}</p>
                    <NuxtLink class="btn btn-outline-primary px-4" :to="route.path + article.path">
                        <span role="button">Read more</span>
                    </NuxtLink>
                </div>
            </div>

            <nav v-if="totalPages > 1" class="d-flex justify-content-center align-items-center mt-4">
                <button class="btn btn-primary mx-2" :disabled="page === 1" @click="page--">Previous</button>
                <span class="mx-2"> Page {{ page }} of {{ totalPages }} </span>
                <button class="btn btn-primary mx-2" :disabled="page === totalPages" @click="page++">Next</button>
            </nav>
        </section>
    </main>
</template>
