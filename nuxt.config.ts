import { fileURLToPath } from "node:url"

import tailwindcss from "@tailwindcss/vite"

const imageDomains = ["medusa-public-images.s3.eu-west-1.amazonaws.com", "api.medusa-commerce.de", "cdn.visa.com"]
const posthogPublicKey = process.env.NUXT_PUBLIC_POSTHOG_PUBLIC_KEY || process.env.NUXT_PUBLIC_POSTHOG_PROJECT_TOKEN || ""
const posthogHost = process.env.NUXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com"

export default defineNuxtConfig({
    compatibilityDate: "2026-01-26",

    features: {
        inlineStyles: true
    },

    app: {
        head: {
            charset: "utf-8",
            viewport: "width=device-width, initial-scale=1",
            title: "Medusa Commerce",
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

    modules: [
        "@nuxt/eslint",
        "@pinia/nuxt",
        "pinia-plugin-persistedstate/nuxt",
        "@nuxt/image",
        "@nuxtjs/sitemap",
        "@nuxtjs/robots",
        "@sentry/nuxt/module"
    ],

    sitemap: {
        sources: ["/api/__sitemap__/urls"]
    },

    site: {
        url: process.env.NUXT_PUBLIC_SITE_URL || process.env.SITE_URL || "",
        name: process.env.SITE_NAME || "Medusa Commerce",
        indexable: false
    },

    runtimeConfig: {
        medusaUrl: process.env.NUXT_MEDUSA_URL || process.env.MEDUSA_URL,
        turnstileSecretKey: process.env.NUXT_TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY,
        public: {
            posthog: {
                publicKey: posthogPublicKey,
                host: posthogHost,
                captureExceptions: true
            },
            sentry: {
                dsn: process.env.NUXT_PUBLIC_SENTRY_DSN || ""
            },
            MEDUSA_URL: process.env.NUXT_PUBLIC_MEDUSA_URL || process.env.MEDUSA_URL,
            PUBLISHABLE_KEY: process.env.NUXT_PUBLIC_PUBLISHABLE_KEY || process.env.PUBLISHABLE_KEY,
            STRIPE_PUBLIC_KEY: process.env.NUXT_PUBLIC_STRIPE_PUBLIC_KEY || process.env.STRIPE_PUBLIC_KEY,
            TURNSTILE_SITE_KEY: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || process.env.TURNSTILE_SITE_KEY,
            SITE_NAME: process.env.SITE_NAME || "Medusa Commerce",
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
            include: ["@stripe/stripe-js", "posthog-js", "lodash-es/debounce"]
        }
    },

    sentry: {
        org: "medusa-test",
        project: "javascript-nuxt"
    },

    sourcemap: {
        client: "hidden"
    }
})
