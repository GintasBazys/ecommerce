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
    css: ["@/assets/css/fonts.css", "@/assets/scss/main.scss"],
    image: {
        domains: ["https://medusa-public-images.s3.eu-west-1.amazonaws.com"]
    },
    modules: [
        "@nuxt/eslint",
        "nuxt-medusa",
        "@pinia/nuxt",
        "pinia-plugin-persistedstate/nuxt",
        "@nuxt/image",
        "@nuxtjs/sitemap",
        "nuxt-swiper",
        "@unlok-co/nuxt-stripe",
        "@nuxt/content"
    ],
    stripe: {
        server: {
            key: process.env.STRIPE_SECRET_KEY,
            options: {}
        },
        client: {
            key: process.env.STRIPE_PUBLIC_KEY,
            options: {}
        }
    },
    medusa: {
        server: true
    },
    runtimeConfig: {
        public: {
            MEDUSA_URL: process.env.MEDUSA_URL,
            PUBLISHABLE_KEY: process.env.PUBLISHABLE_KEY,
            STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY
        },
        secret: {
            mailchimpApiKey: process.env.MAILCHIMP_API_KEY,
            mailchimpAudienceId: process.env.MAILCHIMP_AUDIENCE_ID
        }
    }
})
