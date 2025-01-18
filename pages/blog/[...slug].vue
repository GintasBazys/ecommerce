<script setup lang="ts">
import type { QueryBuilderParams } from "@nuxt/content"

const route = useRoute()
const currentSlug = route.path
const { data: currentPost } = useAsyncData(() => queryContent().where({ _path: currentSlug }).findOne())
const query: QueryBuilderParams = { path: "/", where: [{ _path: { $ne: currentSlug } }], limit: 5, sort: [{ date: -1 }] }
</script>
<template>
    <main class="spacer">
        <section class="container blog-row">
            <h1>{{ currentPost?.title }}</h1>
            <div class="blog-additional">
                <span class="date"
                    ><i>{{ currentPost?.date }}</i></span
                >
                <span class="author"> {{ currentPost?.author }}</span>
            </div>
            <picture class="d-block text-center">
                <NuxtImg class="main-blog-image" :src="currentPost?.image" :alt="currentPost?.title" width="800" height="400" />
            </picture>
            <article>
                <ContentDoc />
            </article>
        </section>
        <section class="container mt-5">
            <h2 class="text-center mb-4">Related Posts</h2>
            <div class="row gy-4">
                <ContentList :query="query">
                    <template #default="{ list }">
                        <div v-for="article in list" :key="article._path" class="col-lg-4 col-md-6">
                            <NuxtLink :href="`${article._path}`" class="d-block" style="text-decoration: none">
                                <NuxtImg
                                    :src="article?.image"
                                    :alt="article.title"
                                    width="700"
                                    height="400"
                                    class="img-fluid mb-4 rounded-2"
                                />
                            </NuxtLink>
                            <h2 class="h4">{{ article.title }}</h2>
                            <p>{{ article.description }}</p>
                            <NuxtLink class="btn btn-outline-primary px-4" :href="`${article._path}`">
                                <span role="button" class="read-more-btn-text">Read more</span>
                            </NuxtLink>
                        </div>
                    </template>
                    <template #not-found>
                        <p>No articles found.</p>
                    </template>
                </ContentList>
            </div>
        </section>
    </main>
</template>
