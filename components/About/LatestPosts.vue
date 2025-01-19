<script setup lang="ts">
const { data: latestPosts } = await useAsyncData("/", () => {
    return queryCollection("content").limit(3).order("date", "DESC").all()
})
</script>

<template>
    <section class="container mt-5">
        <h2 class="text-center mb-4">Latest Posts</h2>
        <div class="row gy-4 pb-5">
            <template v-if="latestPosts">
                <div v-for="article in latestPosts" :key="article.path" class="col-lg-4 col-md-6">
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
        </div>
    </section>
</template>
