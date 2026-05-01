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
                },
                accent: {
                    50: "#fbf6ed",
                    100: "#f5e8d2",
                    300: "#e8c98d",
                    400: "#d8b57a",
                    500: "#cda45e",
                    700: "#8a6a2f",
                    900: "#4a320d"
                },
                focus: {
                    DEFAULT: "#e8c98d",
                    inverse: "#d7e6ff"
                },
                surface: {
                    soft: "#f8fafc",
                    raised: "#ffffff"
                },
                ink: {
                    primary: "#0f172a",
                    muted: "#475569"
                }
            },
            fontFamily: {
                sans: ["Archivo", "sans-serif"]
            },
            fontSize: {
                "label-2xs": ["0.7rem", { lineHeight: "0.98rem" }],
                "label-xs": ["0.72rem", { lineHeight: "1rem" }],
                "label-eyebrow-sm": ["0.73rem", { lineHeight: "1.02rem" }],
                "label-eyebrow": ["0.74rem", { lineHeight: "1.04rem" }],
                "label-sm": ["0.78rem", { lineHeight: "1.1rem" }]
            },
            letterSpacing: {
                label: "0.14em",
                "label-tight": "0.12em"
            },
            borderRadius: {
                "card-sm": "1.15rem",
                card: "1.35rem",
                panel: "1.75rem"
            },
            boxShadow: {
                card: "0 10px 26px rgba(8, 27, 90, 0.05)",
                panel: "0 18px 48px rgba(8, 27, 90, 0.08)",
                elevated: "0 22px 54px rgba(8, 27, 90, 0.12)"
            },
            maxHeight: {
                "screen-sticky-header": "calc(100vh - 6rem)"
            }
        }
    }
}
