<script setup lang="ts">
const { data: latestPosts } = await useAsyncData("/", () => {
    return queryCollection("content").limit(3).order("date", "DESC").all()
})
</script>

<template>
    <VContainer class="py-10">
        <VRow justify="center" class="mb-8">
            <VCol cols="12" class="text-center">
                <h2 class="text-h4">Latest Posts</h2>
            </VCol>
        </VRow>

        <VRow class="pb-10" align="stretch" justify="center" dense>
            <template v-if="latestPosts">
                <VCol v-for="article in latestPosts" :key="article.path" cols="12" md="6" lg="4">
                    <NuxtLink :to="BLOG_HANDLE + article.path" style="text-decoration: none">
                        <NuxtImg
                            :src="article?.image"
                            :alt="article.title"
                            width="700"
                            height="400"
                            class="mb-4 rounded-lg"
                            style="width: 100%; height: auto"
                        />
                    </NuxtLink>
                    <NuxtLink :to="BLOG_HANDLE + article.path" style="text-decoration: none">
                        <h3 class="text-h6 mb-2">{{ article.title }}</h3>
                    </NuxtLink>
                    <p class="mb-4">{{ article.description }}</p>
                    <NuxtLink :to="BLOG_HANDLE + article.path">
                        <VBtn variant="outlined" color="primary"> Read more </VBtn>
                    </NuxtLink>
                </VCol>
            </template>
        </VRow>
    </VContainer>
</template>
