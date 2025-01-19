<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const slug = computed(() => {
    if (route.params.slug) {
        return route.params.slug
    }
    const parts = route.path.split("/")
    return parts[parts.length - 1] || ""
})

const { data: currentPost } = await useAsyncData(`post-${slug.value}`, () => {
    return queryCollection("content").path(`/${slug.value}`).first()
})

const relatedQuery = queryCollection("content")
    .order("date", "DESC")
    .limit(3)
    .where("path", "NOT LIKE", currentPost.value?.path || "")

const { data: relatedPosts } = await useAsyncData(`related-${slug.value}`, () => {
    return relatedQuery.all()
})
</script>

<template>
    <main class="spacer">
        <section class="container blog-row">
            <h1>{{ currentPost?.title }}</h1>
            <div class="blog-additional">
                <span class="date"
                    ><i>{{ currentPost?.date }}</i></span
                >
                <span class="author">{{ currentPost?.author }}</span>
            </div>
            <picture class="d-block text-center">
                <NuxtImg class="main-blog-image" :src="currentPost?.image" :alt="currentPost?.title" width="800" height="400" />
            </picture>
            <article>
                <ContentRenderer v-if="currentPost" :value="currentPost" />
            </article>
        </section>

        <section class="container mt-5">
            <h2 class="text-center mb-4">Related Posts</h2>
            <div class="row gy-4">
                <template v-if="relatedPosts && relatedPosts.length > 0">
                    <div v-for="article in relatedPosts" :key="article.path" class="col-lg-4 col-md-6">
                        <NuxtLink :to="'/blog' + article.path" class="d-block" style="text-decoration: none">
                            <NuxtImg :src="article?.image" :alt="article.title" width="700" height="400" class="img-fluid mb-4 rounded-2" />
                        </NuxtLink>
                        <NuxtLink :to="'/blog' + article.path" class="text-decoration-none">
                            <h2 class="h4">{{ article.title }}</h2></NuxtLink
                        >
                        <p>{{ article.description }}</p>
                        <NuxtLink class="btn btn-outline-primary px-4" :to="'/blog' + article.path">
                            <span role="button" class="read-more-btn-text">Read more</span>
                        </NuxtLink>
                    </div>
                </template>
                <template v-else>
                    <p class="text-center">No related posts found.</p>
                </template>
            </div>
        </section>
    </main>
</template>
