/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./assets/**/*.{vue,js,css}",
        "./components/**/*.{vue,js}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./nuxt.config.{js,ts}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Sora", "sans-serif"],
            },
        },
    },
    plugins: [],
};
