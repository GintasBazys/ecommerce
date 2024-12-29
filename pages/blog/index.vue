<script setup lang="ts">
import { ref, computed, onMounted } from "vue"

const page = ref(1)

const limit = 12
const skip = computed(() => (page.value - 1) * limit)

const total = ref(0)

onMounted(async () => {
    const allArticles = await queryContent("/").only(["_path"]).find()
    total.value = allArticles.length
})

const totalPages = computed(() => Math.ceil(total.value / limit))
</script>

<template>
    <main class="spacer">
        <section class="container">
            <h1 class="text-center mb-5">Explore latest blog posts</h1>
            <div class="row gy-4">
                <ContentList v-slot="{ list }" path="/" :query="{ limit: limit, skip: skip }">
                    <div v-for="article in list" :key="article._path" class="col-lg-4 col-md-6">
                        <NuxtLink :href="`${article._path}`" class="d-block" style="text-decoration: none">
                            <NuxtImg :src="article?.image" :alt="article.title" width="700" height="400" class="img-fluid mb-4 rounded-2" />
                        </NuxtLink>
                        <h2 class="h4">{{ article.title }}</h2>
                        <p>{{ article.description }}</p>
                        <NuxtLink class="btn btn-outline-primary px-4" :href="`${article._path}`">
                            <span role="button" class="read-more-btn-text">Read more</span>
                        </NuxtLink>
                    </div>
                </ContentList>

                <nav v-if="totalPages > 1" class="d-flex justify-content-center align-items-center mt-4">
                    <button class="btn btn-primary mx-2" :disabled="page === 1" @click="page--">Previous</button>
                    <span class="mx-2"> Page {{ page }} of {{ totalPages }} </span>
                    <button class="btn btn-primary mx-2" :disabled="page === totalPages" @click="page++">Next</button>
                </nav>
            </div>
        </section>
    </main>
</template>
