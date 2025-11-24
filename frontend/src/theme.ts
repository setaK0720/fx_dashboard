import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
    theme: {
        tokens: {
            colors: {
                glass: {
                    100: { value: "rgba(30, 30, 35, 0.4)" },
                    200: { value: "rgba(30, 30, 35, 0.6)" },
                    300: { value: "rgba(30, 30, 35, 0.8)" },
                    border: { value: "rgba(100, 100, 110, 0.3)" },
                },
                violet: {
                    500: { value: "#7c7c8a" }, // Much more desaturated, slate-like
                    glow: { value: "0 0 10px #7c7c8a" },
                },
                cyan: {
                    400: { value: "#00ffff" },
                }
            },
        },
        semanticTokens: {
            colors: {
                bg: {
                    main: { value: "#0a0a0c" },
                    panel: { value: "{colors.glass.200}" },
                },
                text: {
                    main: { value: "#e0e0e0" },
                    muted: { value: "#909095" },
                },
                border: {
                    glass: { value: "{colors.glass.border}" },
                }
            }
        }
    },
    globalCss: {
        "html, body": {
            bg: "linear-gradient(135deg, #050505 0%, #1a1a1e 100%)", // Gray/Black gradient
            color: "text.main",
            minHeight: "100vh",
            margin: 0,
            padding: 0,
        }
    }
})

export const system = createSystem(defaultConfig, config)
