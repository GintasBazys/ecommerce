export default defineNuxtConfig({
    compatibilityDate: "2025-05-04",
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
    css: ["@/assets/scss/main.scss", "swiper/swiper-bundle.css"],
    image: {
        inject: true,
        domains: ["https://medusa-public-images.s3.eu-west-1.amazonaws.com"]
    },
    modules: [
        "@nuxt/eslint",
        "nuxt-medusa",
        "@pinia/nuxt",
        "pinia-plugin-persistedstate/nuxt",
        "@nuxt/image",
        "@nuxtjs/sitemap",
        "@unlok-co/nuxt-stripe",
        "@nuxt/content",
        "vuetify-nuxt-module"
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
    },
    plugins: ["~/plugins/init-app"],
    vite: {
        optimizeDeps: {
            include: ["@stripe/stripe-js"]
        }
    },
    content: {
        experimental: { nativeSqlite: true }
    },
    vue: {
        compilerOptions: {
            isCustomElement: (tag) => tag.startsWith("swiper-")
        }
    }
})
