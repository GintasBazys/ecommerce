import { fileURLToPath } from "node:url"

import tailwindcss from "@tailwindcss/vite"

const imageDomains = ["medusa-public-images.s3.eu-west-1.amazonaws.com", "api.medusa-commerce.de", "cdn.visa.com"]

export default defineNuxtConfig({
    compatibilityDate: "2026-01-26",

    nitro: {
        preset: process.env.VERCEL ? "vercel" : undefined
    },

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
            htmlAttrs: {
                lang: "en"
            },
            meta: [{ name: "description", content: "..." }]
        }
    },

    css: ["@/assets/css/tailwind.css"],

    image: {
        inject: true,
        domains: [...new Set(imageDomains)]
    },

    modules: ["@nuxt/eslint", "@pinia/nuxt", "pinia-plugin-persistedstate/nuxt", "@nuxt/image", "@nuxtjs/sitemap", "@unlok-co/nuxt-stripe"],

    stripe: {
        server: {
            key: process.env.NUXT_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY,
            options: {}
        },
        client: {
            key: process.env.NUXT_PUBLIC_STRIPE_PUBLIC_KEY || process.env.STRIPE_PUBLIC_KEY,
            options: {}
        }
    },

    runtimeConfig: {
        medusaUrl: process.env.NUXT_MEDUSA_URL || process.env.MEDUSA_URL,
        turnstileSecretKey: process.env.NUXT_TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY,
        public: {
            MEDUSA_URL: process.env.NUXT_PUBLIC_MEDUSA_URL || process.env.MEDUSA_URL,
            PUBLISHABLE_KEY: process.env.NUXT_PUBLIC_PUBLISHABLE_KEY || process.env.PUBLISHABLE_KEY,
            STRIPE_PUBLIC_KEY: process.env.NUXT_PUBLIC_STRIPE_PUBLIC_KEY || process.env.STRIPE_PUBLIC_KEY,
            TURNSTILE_SITE_KEY: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || process.env.TURNSTILE_SITE_KEY,
            SITE_NAME: process.env.SITE_NAME || "Ecommerce",
            SITE_URL: process.env.NUXT_PUBLIC_SITE_URL || process.env.SITE_URL || ""
        },
        secret: {
            mailchimpApiKey: process.env.MAILCHIMP_API_KEY,
            mailchimpAudienceId: process.env.MAILCHIMP_AUDIENCE_ID
        }
    },

    plugins: ["~/plugins/init-app"],

    vite: {
        plugins: [tailwindcss()],
        resolve: {
            alias: [
                {
                    find: /^vue$/,
                    replacement: fileURLToPath(new URL("./app/shims/vue.ts", import.meta.url))
                }
            ]
        },
        optimizeDeps: {
            include: ["@stripe/stripe-js"]
        }
    }
})
