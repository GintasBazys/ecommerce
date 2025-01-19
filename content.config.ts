import { defineContentConfig, defineCollection, z } from "@nuxt/content"

export default defineContentConfig({
    collections: {
        content: defineCollection({
            type: "page",
            source: "**/*.md",
            schema: z.object({
                date: z.string(),
                image: z.string(),
                author: z.string()
            })
        })
    }
})
