import { fileURLToPath } from 'node:url'

import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

const publicAssetStubPlugin = {
    name: 'test-public-asset-stub',
    enforce: 'pre' as const,
    resolveId(id: string) {
        if (id.startsWith('virtual:public?')) {
            return id
        }
    },
    load(id: string) {
        if (id.startsWith('virtual:public?')) {
            return 'export default ""'
        }
    },
}

const nuxtTestAliases = [
    {
        find: /^#app\/composables\/.+$/,
        replacement: fileURLToPath(new URL('./node_modules/nuxt/dist/app/composables/index.js', import.meta.url)),
    },
    {
        find: '#app/nuxt',
        replacement: fileURLToPath(new URL('./node_modules/nuxt/dist/app/nuxt.js', import.meta.url)),
    },
    {
        find: '#app/config',
        replacement: fileURLToPath(new URL('./node_modules/nuxt/dist/app/config.js', import.meta.url)),
    },
    {
        find: '#app/components/utils',
        replacement: fileURLToPath(new URL('./test/mocks/nuxt-component-utils.ts', import.meta.url)),
    },
    {
        find: '#app/components/injections',
        replacement: fileURLToPath(new URL('./test/mocks/nuxt-component-injections.ts', import.meta.url)),
    },
    {
        find: '#app/components/route-provider',
        replacement: fileURLToPath(new URL('./test/mocks/nuxt-route-provider.ts', import.meta.url)),
    },
    {
        find: '#app',
        replacement: fileURLToPath(new URL('./node_modules/nuxt/dist/app/index.js', import.meta.url)),
    },
]

export default defineConfig({
    plugins: [publicAssetStubPlugin],
    resolve: {
        alias: nuxtTestAliases,
    },
    test: {
        projects: [
            {
                test: {
                    name: 'unit',
                    include: ['test/unit/**/*.{test,spec}.ts'],
                    environment: 'node',
                    setupFiles: ['test/setup.ts'],
                },
            },
            await defineVitestProject({
                plugins: [publicAssetStubPlugin],
                resolve: {
                    alias: nuxtTestAliases,
                },
                test: {
                    name: 'nuxt',
                    include: ['test/nuxt/**/*.{test,spec}.ts'],
                    environment: 'nuxt',
                    setupFiles: ['test/setup.ts'],
                    environmentOptions: {
                        nuxt: {
                            domEnvironment: 'happy-dom',
                        },
                    },
                },
            }),
        ],
    },
})
