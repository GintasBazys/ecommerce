<script setup lang="ts">
import type { BlogPost, BlogPostResponse, BlogPostSummary, BlogPostsResponse } from "~/types/blog"
import type { BreadcrumbItem } from "~/types/breadcrumbs"

import {
    createBreadcrumbSchema,
    normalizeSchemaDate,
    type SchemaNode,
    useSiteIdentity,
    useStructuredData
} from "~/composables/shared/useStructuredData"
import { formatDate } from "~/utils/formatDate"
import { getCanonicalRouteParam, localizePath } from "~/utils/locale"

const route = useRoute()
const { organizationId, absoluteUrl } = useSiteIdentity()
const { currentLocale } = storeToRefs(useLocaleStore())

const slug = computed<string>(() => getCanonicalRouteParam(route.params.slug))

const { data: postResponse } = await useAsyncData(`blog-post-${slug.value}`, () =>
    $fetch<BlogPostResponse>(`/api/blog/posts/${slug.value}`)
)

const currentPost = computed<BlogPost | null>(() => postResponse.value?.post || null)

if (!currentPost.value) {
    throw createError({ statusCode: 404, statusMessage: "Blog post not found" })
}

const publishedDate = computed<string>(() => formatDate(currentPost.value?.publishedAt))

const { data: relatedPostsData } = await useAsyncData(`related-${slug.value}`, async () => {
    const primaryResponse = await $fetch<BlogPostsResponse>("/api/blog/posts", {
        query: {
            limit: 6,
            offset: 0,
            category: currentPost.value?.category?.slug || undefined
        }
    })

    const primaryPosts = primaryResponse.posts.filter((post) => post.slug !== slug.value)
    if (primaryPosts.length >= 3 || !currentPost.value?.category?.slug) {
        return primaryPosts.slice(0, 3)
    }

    const fallbackResponse = await $fetch<BlogPostsResponse>("/api/blog/posts", {
        query: {
            limit: 6,
            offset: 0
        }
    })

    const combinedPosts = [...primaryPosts]

    for (const post of fallbackResponse.posts) {
        if (post.slug === slug.value || combinedPosts.some((item) => item.id === post.id)) {
            continue
        }

        combinedPosts.push(post)
    }

    return combinedPosts.slice(0, 3)
})

const relatedPosts = computed<BlogPostSummary[]>(() => relatedPostsData.value || [])

useHead(() => ({
    title: `${currentPost.value?.title ?? "Shop"} | Medusa Commerce`,
    meta: [
        {
            name: "description",
            content: currentPost.value?.excerpt || "Read the latest journal post from the storefront."
        }
    ]
}))

const articlePath = computed<string>(() => localizePath(`/blog/${slug.value}`, currentLocale.value))
const blogPath = computed<string>(() => localizePath("/blog", currentLocale.value))
const homePath = computed<string>(() => localizePath("/", currentLocale.value))
const articleUrl = computed<string>(() => absoluteUrl(articlePath.value))
const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    { label: "Home", to: homePath.value },
    { label: "Blog", to: blogPath.value },
    { label: currentPost.value?.title || "Article" }
])

const articleSchema = computed<SchemaNode | null>(() => {
    if (!currentPost.value?.title) {
        return null
    }

    const image = currentPost.value.thumbnail ? absoluteUrl(currentPost.value.thumbnail) : undefined

    return {
        "@type": "BlogPosting",
        "@id": `${articleUrl.value}#article`,
        headline: currentPost.value.title,
        description: currentPost.value.excerpt || undefined,
        url: articleUrl.value,
        mainEntityOfPage: articleUrl.value,
        image: image ? [image] : undefined,
        datePublished: normalizeSchemaDate(currentPost.value.publishedAt),
        dateModified: normalizeSchemaDate(currentPost.value.updatedAt || currentPost.value.publishedAt),
        author: {
            "@type": "Person",
            name: currentPost.value.author || "Editorial team"
        },
        publisher: {
            "@id": organizationId.value
        }
    }
})

const breadcrumbSchema = computed<SchemaNode | null>(() => {
    if (!currentPost.value?.title) {
        return null
    }

    return createBreadcrumbSchema(
        [
            { name: "Home", path: homePath.value },
            { name: "Blog", path: blogPath.value },
            { name: currentPost.value.title, path: articlePath.value }
        ],
        absoluteUrl
    )
})

useStructuredData(() => [articleSchema.value, breadcrumbSchema.value], "blog-post-structured-data")
</script>

<template>
    <NuxtIsland
        v-if="currentPost"
        name="BlogPostContent"
        :props="{ currentPost, publishedDate, breadcrumbItems, relatedPosts }"
    />
</template>
