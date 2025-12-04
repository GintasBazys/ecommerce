// @ts-check
import tsParser from "@typescript-eslint/parser"
import vueParser from "vue-eslint-parser"

import withNuxt from "./.nuxt/eslint.config.mjs"

export default withNuxt({
    languageOptions: {
        parser: vueParser,
        parserOptions: {
            parser: tsParser,
            ecmaVersion: 2022,
            sourceType: "module",
            extraFileExtensions: [".vue"],
        },
    },
    rules: {
        "vue/html-self-closing": [
            "error",
            {
                html: {
                    void: "always",
                    normal: "never",
                    component: "always",
                },
                svg: "always",
                math: "always",
            },
        ],
        "no-console": ["warn", { allow: ["warn", "error"] }],
        "no-debugger": "warn",
        "prefer-const": ["error", { destructuring: "all" }],
        "no-var": "error",
        "object-shorthand": ["error", "always"],
        "arrow-body-style": ["warn", "as-needed"],
        "consistent-return": "warn",
        "default-case-last": "error",
        "no-return-await": "error",
        "no-useless-return": "error",
        "no-else-return": ["warn", { allowElseIf: false }],
        "prefer-template": "warn",
        "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
        "vue/no-unused-components": "warn",
        "vue/require-v-for-key": "error",
        "vue/no-mutating-props": "error",
        "vue/require-default-prop": "warn",
        "vue/require-explicit-emits": "error",
        "vue/no-v-html": "warn",
        "vue/padding-line-between-blocks": ["warn", "always"],
        "vue/html-indent": ["error", 4, { baseIndent: 1 }],
        "import/order": [
            "warn",
            {
                groups: ["builtin", "external", "internal", ["parent", "sibling", "index"], "object", "type"],
                "newlines-between": "always",
                alphabetize: { order: "asc", caseInsensitive: true },
            },
        ],
        "import/newline-after-import": "warn",
        "import/no-duplicates": "error",
    },
})
