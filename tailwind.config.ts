import type { Config } from "tailwindcss"

export default <Partial<Config>>{
    content: ["./app/components/**/*.{vue,js,ts}", "./app/layouts/**/*.vue", "./app/pages/**/*.vue", "./app/app.vue"],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: "#edf4ff",
                    100: "#d7e6ff",
                    300: "#82b2ff",
                    500: "#2563eb",
                    700: "#1743a3",
                    900: "#0b1d4f"
                }
            },
            fontFamily: {
                sans: ["Archivo", "sans-serif"]
            },
            boxShadow: {
                panel: "0 18px 48px rgba(8, 27, 90, 0.08)"
            }
        }
    }
}
