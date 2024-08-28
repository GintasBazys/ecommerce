// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2024-04-03",
    devtools: { enabled: true },
    app: {
        pageTransition: { name: "page", mode: "out-in" },
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
    modules: ["@nuxt/eslint", "nuxt-medusa", "@pinia/nuxt", "@nuxt/image", "@nuxtjs/sitemap"],
    medusa: {
        server: true
    },
    alias: {
        pinia: "/node_modules/@pinia/nuxt/node_modules/pinia/dist/pinia.mjs"
    }
})
