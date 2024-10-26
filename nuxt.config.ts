// https://nuxt.com/docs/api/configuration/nuxt-config
import type { NuxtPage } from "@nuxt/schema"

export default defineNuxtConfig({
    compatibilityDate: "2024-04-03",
    app: {
        layoutTransition: {
            name: "page",
            mode: "out-in"
        },
        pageTransition: {
            name: "page",
            mode: "out-in"
        },
        head: {
            charset: "utf-8",
            viewport: "width=device-width, initial-scale=1",
            title: "Ecommerce",
            meta: [{ name: "description", content: "..." }]
        }
    },
    hooks: {
        "pages:extend"(pages) {
            function setMiddleware(pages: NuxtPage[]) {
                for (const page of pages) {
                    page.meta ||= {}
                    page.meta.middleware = ["auth-middleware"]
                    if (page.children) {
                        setMiddleware(page.children)
                    }
                }
            }
            setMiddleware(pages)
        }
    },
    css: ["@/assets/css/fonts.css", "@/assets/scss/main.scss"],
    image: {
        domains: ["https://medusa-public-images.s3.eu-west-1.amazonaws.com"]
    },
    modules: ["@nuxt/eslint", "nuxt-medusa", "@pinia/nuxt", "@nuxt/image", "@nuxtjs/sitemap", "nuxt-swiper"],
    medusa: {
        server: true
    },
    alias: {
        pinia: "/node_modules/@pinia/nuxt/node_modules/pinia/dist/pinia.mjs"
    },
    runtimeConfig: {
        public: {
            MEDUSA_URL: process.env.MEDUSA_URL
        },
        secret: {
            mailchimpApiKey: process.env.MAILCHIMP_API_KEY,
            mailchimpAudienceId: process.env.MAILCHIMP_AUDIENCE_ID
        }
    }
})
