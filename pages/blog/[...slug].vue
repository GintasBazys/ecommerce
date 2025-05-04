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
    <main>
        <VContainer class="py-8 blog-row">
            <VRow justify="center">
                <VCol cols="12" md="10" lg="8">
                    <h1 class="text-h4 mb-2">{{ currentPost?.title }}</h1>
                    <div class="d-flex align-center text-body-2 text-medium-emphasis mb-4">
                        <span class="me-3">
                            <i>{{ currentPost?.date }}</i>
                        </span>
                        <span>{{ currentPost?.author }}</span>
                    </div>

                    <VImg
                        v-if="currentPost?.image"
                        :src="currentPost.image"
                        :alt="currentPost.title"
                        width="800"
                        height="400"
                        class="rounded-lg mb-6 mx-auto"
                        cover
                    />

                    <ContentRenderer v-if="currentPost" :value="currentPost" />
                </VCol>
            </VRow>
        </VContainer>

        <VContainer class="py-6">
            <VRow justify="center" class="mb-6">
                <VCol cols="12" md="8">
                    <h2 class="text-center text-h5">Related Posts</h2>
                </VCol>
            </VRow>

            <VRow v-if="relatedPosts && relatedPosts.length > 0" class="gy-6">
                <VCol v-for="article in relatedPosts" :key="article.path" cols="12" md="6" lg="4">
                    <NuxtLink :to="BLOG_HANDLE + article.path" style="text-decoration: none">
                        <VImg :src="article.image" :alt="article.title" width="700" height="400" class="mb-4 rounded-lg" cover />
                    </NuxtLink>

                    <NuxtLink :to="BLOG_HANDLE + article.path" class="text-decoration-none">
                        <h3 class="text-h6 mb-2">{{ article.title }}</h3>
                    </NuxtLink>

                    <p class="mb-4">{{ article.description }}</p>

                    <NuxtLink :to="BLOG_HANDLE + article.path">
                        <VBtn variant="outlined" color="primary">Read more</VBtn>
                    </NuxtLink>
                </VCol>
            </VRow>

            <VRow v-else>
                <VCol cols="12" class="text-center">
                    <p>No related posts found.</p>
                </VCol>
            </VRow>
        </VContainer>
    </main>
</template>
